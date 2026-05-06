import { expect } from 'chai'
import { Agent, request, setGlobalDispatcher } from 'undici'
import * as schemaTests from '@secvisogram/csaf-validator-lib/schemaTests.js'
import * as mandatoryTests from '@secvisogram/csaf-validator-lib/mandatoryTests.js'
import * as optionalTests from '@secvisogram/csaf-validator-lib/optionalTests.js'
import * as informativeTests from '@secvisogram/csaf-validator-lib/informativeTests.js'
import * as basic from '@secvisogram/csaf-validator-lib/basic.js'
import * as extended from '@secvisogram/csaf-validator-lib/extended.js'
import * as full from '@secvisogram/csaf-validator-lib/full.js'
import validate from '@secvisogram/csaf-validator-lib/validate.js'
import { getConfig } from './shared/configData.js'
import { getValidSampleDocuments } from './shared/sampleDocumentsData.js'

const agent = new Agent({
  keepAliveTimeout: 10,
  keepAliveMaxTimeout: 10,
})

setGlobalDispatcher(agent)

/** @type {Record<string, Parameters<typeof validate>[0][number]>} */
const tests = Object.fromEntries(
  /** @type {Array<[string, any]>} */ (Object.entries(schemaTests))
    .concat(Object.entries(mandatoryTests))
    .concat(Object.entries(optionalTests))
    .concat(Object.entries(informativeTests))
)

/** @type {Record<string, Parameters<typeof validate>[0]>} */
const presets = {
  schema: Object.values(schemaTests),
  mandatory: Object.values(mandatoryTests),
  optional: Object.values(optionalTests),
  informative: Object.values(informativeTests),
  basic: Object.values(basic),
  extended: Object.values(extended),
  full: Object.values(full),
}

describe('API', function () {
  describe('GET /api/v1/tests', function () {
    it('returns a list of all available tests alongside their preset', async function () {
      const res = await request(
        'http://localhost:' + getConfig().port + '/api/v1/tests'
      )
      const body = await res.body.json()

      expect(res.statusCode).to.equal(200)
      expect(body).to.deep.equal(
        Object.keys(schemaTests)
          .map((t) => ({ name: t, preset: 'schema' }))
          .concat(
            Object.keys(mandatoryTests).map((t) => ({
              name: t,
              preset: 'mandatory',
            }))
          )
          .concat(
            Object.keys(optionalTests).map((t) => ({
              name: t,
              preset: 'optional',
            }))
          )
          .concat(
            Object.keys(informativeTests).map((t) => ({
              name: t,
              preset: 'informative',
            }))
          )
      )
    })
  })

  describe('OPTIONS /api/v1/tests', function () {
    it('returns valid CORS information', async function () {
      const res = await request(
        'http://localhost:' + getConfig().port + '/api/v1/tests',
        {
          method: 'OPTIONS',
          headers: {
            Origin: 'http://localhost',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'content-type',
          },
        }
      )
      expect(res.statusCode).to.equal(204)
    })
  })

  describe('OPTIONS /api/v1/validate', function () {
    it('returns valid CORS information', async function () {
      const res = await request(
        'http://localhost:' + getConfig().port + '/api/v1/validate',
        {
          method: 'OPTIONS',
          headers: {
            Origin: 'http://localhost',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
          },
        }
      )
      expect(res.statusCode).to.equal(204)
    })
  })

  describe('POST /api/v1/validate', function () {
    describe('documents can be checked using presets and single tests', function () {
      for (let i = 0; i < getValidSampleDocuments().length; ++i) {
        const doc = getValidSampleDocuments()[i]

        it(`valid document #${i + 1}`, async function () {
          const requestBody = JSON.stringify({
            tests: [
              { type: 'test', name: 'mandatoryTest_6_1_1' },
              { type: 'preset', name: 'optional' },
            ],
            document: doc,
          })
          const res = await request(
            'http://localhost:' + getConfig().port + '/api/v1/validate',
            {
              method: 'POST',
              body: requestBody,
              headers: {
                'content-length': Buffer.byteLength(requestBody).toString(),
                'content-type': 'application/json',
              },
            }
          )
          const body = await res.body.json()

          expect(res.statusCode).to.equal(200)
          expect(body).to.deep.equal({
            tests: [
              {
                name: 'mandatoryTest_6_1_1',
                errors: [],
                warnings: [],
                infos: [],
                isValid: true,
              },
              ...Object.keys(optionalTests).map((name) => ({
                name,
                errors: [],
                warnings: [],
                infos: [],
                isValid: true,
              })),
            ],
            isValid: true,
          })
        })
      }
    })

    describe('can execute all tests independently', function () {
      for (const [name, test] of Object.entries(tests)) {
        it(`test=${name}`, async function () {
          const doc = {}
          const requestBody = JSON.stringify({
            tests: [{ type: 'test', name }],
            document: doc,
          })
          const res = await request(
            'http://localhost:' + getConfig().port + '/api/v1/validate',
            {
              method: 'POST',
              body: requestBody,
              headers: {
                'content-length': Buffer.byteLength(requestBody).toString(),
                'content-type': 'application/json',
              },
            }
          )
          const body = await res.body.json()

          expect(res.statusCode).to.equal(200)
          const result = await validate([test], doc)
          expect(body).to.deep.equal({
            ...result,
            tests: result.tests.map((t) => ({
              ...t,
              errors: t.errors.map((e) => ({
                instancePath: e.instancePath,
                message: e.message,
              })),
            })),
          })
        })
      }
    })

    describe('can execute all presets independently', function () {
      for (const [name, preset] of Object.entries(presets)) {
        it(`preset=${name}`, async function () {
          const doc = {}
          const requestBody = JSON.stringify({
            tests: [{ type: 'preset', name }],
            document: doc,
          })
          const res = await request(
            'http://localhost:' + getConfig().port + '/api/v1/validate',
            {
              method: 'POST',
              body: requestBody,
              headers: {
                'content-length': Buffer.byteLength(requestBody).toString(),
                'content-type': 'application/json',
              },
            }
          )
          const body = await res.body.json()

          expect(res.statusCode).to.equal(200)
          const result = await validate(preset, doc)
          expect(body).to.deep.equal({
            ...result,
            tests: result.tests.map((t) => ({
              ...t,
              errors: t.errors.map((e) => ({
                instancePath: e.instancePath,
                message: e.message,
              })),
            })),
          })
        })
      }
    })

    describe('tests are only executed once', function () {
      for (let i = 0; i < getValidSampleDocuments().length; ++i) {
        const doc = getValidSampleDocuments()[i]

        it(`valid document #${i + 1}`, async function () {
          const requestBody = JSON.stringify({
            tests: [
              { type: 'test', name: 'mandatoryTest_6_1_1' },
              { type: 'test', name: 'mandatoryTest_6_1_1' },
            ],
            document: doc,
          })
          const res = await request(
            'http://localhost:' + getConfig().port + '/api/v1/validate',
            {
              method: 'POST',
              body: requestBody,
              headers: {
                'content-length': Buffer.byteLength(requestBody).toString(),
                'content-type': 'application/json',
              },
            }
          )
          const body = await res.body.json()

          expect(res.statusCode).to.equal(200)
          expect(body).to.deep.equal({
            tests: [
              {
                name: 'mandatoryTest_6_1_1',
                errors: [],
                warnings: [],
                infos: [],
                isValid: true,
              },
            ],
            isValid: true,
          })
        })
      }
    })
  })
})
