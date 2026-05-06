import * as schemaTests from '@secvisogram/csaf-validator-lib/schemaTests.js'
import * as mandatoryTests from '@secvisogram/csaf-validator-lib/mandatoryTests.js'
import * as optionalTests from '@secvisogram/csaf-validator-lib/optionalTests.js'
import * as informativeTests from '@secvisogram/csaf-validator-lib/informativeTests.js'
import * as basic from '@secvisogram/csaf-validator-lib/basic.js'
import * as extended from '@secvisogram/csaf-validator-lib/extended.js'
import * as full from '@secvisogram/csaf-validator-lib/full.js'
import validateStrict from '@secvisogram/csaf-validator-lib/validateStrict.js'

/** @type {Record<string, Parameters<typeof validateStrict>[0][number] | undefined>} */
const tests = Object.fromEntries(
  /** @type {Array<[string, any]>} */ (Object.entries(schemaTests))
    .concat(Object.entries(mandatoryTests))
    .concat(Object.entries(optionalTests))
    .concat(Object.entries(informativeTests))
)

/** @type {Record<string, Parameters<typeof validateStrict>[0] | undefined>} */
const presets = {
  schema: Object.values(schemaTests),
  mandatory: Object.values(mandatoryTests),
  optional: Object.values(optionalTests),
  informative: Object.values(informativeTests),
  basic: Object.values(basic),
  extended: Object.values(extended),
  full: Object.values(full),
}

/** @typedef {Parameters<typeof validateStrict>[0][number]} DocumentTest */

const swaggerInfo = {
  description:
    "This endpoint is intended to validate a document against the specified tests. In the list of tests provide at least one object, where each object is used to run either a single test or an entire preset. For 'name' provide the test's or the preset's name, and as 'type' provide accordingly either 'test' or 'preset'. For the value of the property 'document' just provide the json of your CSAF document.",
  summary: 'Validate document.',
}

/** @type {import('ajv').JSONSchemaType<import('./validate/types.js').RequestBody>} */
const requestBodySchema = {
  type: 'object',
  required: ['document', 'tests'],
  properties: {
    tests: {
      type: 'array',
      items: {
        oneOf: [
          {
            type: 'object',
            required: ['name', 'type'],
            properties: {
              name: { type: 'string', enum: Object.keys(tests) },
              type: { type: 'string', enum: ['test'] },
            },
          },
          {
            type: 'object',
            required: ['name', 'type'],
            properties: {
              name: { type: 'string', enum: Object.keys(presets) },
              type: { type: 'string', enum: ['preset'] },
            },
          },
        ],
      },
    },
    document: {
      type: 'object',
      additionalProperties: true,
      properties: {},
    },
  },
}

/** @type {import('ajv').JSONSchemaType<import('./validate/types.js').ResponseBody>} */
const responseSchema = {
  type: 'object',
  required: ['isValid', 'tests'],
  properties: {
    isValid: { type: 'boolean' },
    tests: {
      type: 'array',
      items: {
        type: 'object',
        required: ['errors', 'infos', 'isValid', 'name', 'warnings'],
        properties: {
          errors: {
            type: 'array',
            items: {
              type: 'object',
              required: ['instancePath'],
              properties: {
                instancePath: { type: 'string' },
                message: { type: 'string', nullable: true },
              },
            },
          },
          warnings: {
            type: 'array',
            items: {
              type: 'object',
              required: ['instancePath', 'message'],
              properties: {
                instancePath: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
          infos: {
            type: 'array',
            items: {
              type: 'object',
              required: ['instancePath', 'message'],
              properties: {
                instancePath: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
          isValid: { type: 'boolean' },
          name: { type: 'string' },
        },
      },
    },
  },
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function (fastify) {
  fastify.post(
    '/api/v1/validate',
    {
      schema: {
        ...swaggerInfo,
        body: requestBodySchema,
        response: {
          200: responseSchema,
        },
      },
    },

    /**
     * @returns {Promise<import('./validate/types.js').ResponseBody>}
     */
    async (request) => {
      const requestBody =
        /** @type {import('./validate/types.js').RequestBody} */ (request.body)

      return await validateStrict(
        requestBody.tests
          .flatMap((t) =>
            t.type === 'preset'
              ? presets[t.name] ?? []
              : [tests[t.name]].filter(
                  /** @returns {t is DocumentTest} */
                  (t) => Boolean(t)
                )
          )

          // Filter duplicated tests
          .filter(
            (test, i, array) =>
              array.findIndex((a) => a.name === test.name) === i
          ),
        requestBody.document
      )
    }
  )
}
