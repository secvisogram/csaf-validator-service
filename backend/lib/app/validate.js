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
  description: `This endpoint validates a CSAF document against a selected set of tests. \
In the 'tests' array, provide at least one entry. Each entry runs either a single named test (type 'test') or a named preset (type 'preset') that expands to a fixed group of tests. \
Duplicate tests resulting from overlapping entries are automatically removed.

**Available presets and their contents:**
- \`schema\` – \`csaf_2_0\` and \`csaf_2_0_strict\` (JSON Schema validation; strict variant disallows additional properties)
- \`mandatory\` – all mandatory tests (section 6.1)
- \`optional\` – all optional tests (section 6.2)
- \`informative\` – all informative tests (section 6.3)
- \`basic\` – \`csaf_2_0_strict\` plus all mandatory tests (test 6.1.8 is already covered by the schema test and is excluded)
- \`extended\` – everything in \`basic\` plus all optional tests
- \`full\` – everything in \`extended\` plus all informative tests

Use \`GET /api/v1/tests\` to retrieve a list of all individual test names and the atomic preset each belongs to.`,
  summary: 'Validate document.',
}

/** @type {import('ajv').JSONSchemaType<import('./validate/types.js').RequestBody>} */
const requestBodySchema = {
  type: 'object',
  required: ['document', 'tests'],
  examples: [
    {
      tests: [{ name: 'full', type: 'preset' }],
      document: { document: { category: 'csaf_base', csaf_version: '2.0' } },
    },
  ],
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
