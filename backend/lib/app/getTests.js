import * as schemaTests from '@secvisogram/csaf-validator-lib/schemaTests.js'
import * as mandatoryTests from '@secvisogram/csaf-validator-lib/mandatoryTests.js'
import * as optionalTests from '@secvisogram/csaf-validator-lib/optionalTests.js'
import * as informativeTests from '@secvisogram/csaf-validator-lib/informativeTests.js'

const swaggerInfo = {
  description:
    'This endpoint is intended to be used to discover all available tests. For each tests it lists the name as well as the preset the test belongs to.',
  summary: 'Retrieve all tests.',
}

/**
 * @type {import('ajv').JSONSchemaType<import('./getTests/types.js').ResponseBody>}
 */
const responseSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['name', 'preset'],
    properties: {
      name: { type: 'string' },
      preset: { type: 'string' },
    },
  },
}

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function (fastify) {
  fastify.get(
    '/api/v1/tests',
    {
      schema: {
        ...swaggerInfo,
        response: {
          200: responseSchema,
        },
      },
    },

    /**
     * @returns {Promise<import('./getTests/types.js').ResponseBody>}
     */
    async () => {
      const tests = Object.keys(schemaTests)
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

      return tests
    }
  )
}
