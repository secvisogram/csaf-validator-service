import config from 'config'
import { getHunspellAvailableLangs } from '../../csaf-validator-lib/hunspell.js'

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function(fastify) {
  fastify.register(import('@fastify/swagger'), {
    routePrefix: '/docs',
    openapi: {
      info: {
        title: 'CSAF Validator Service',
        version: '1.3.34',
        description:
          'This is a service to validate documents against the CSAF standard.',
        contact: {
          url: 'https://github.com/secvisogram/csaf-validator-service',
          email: 'secvisogram@bsi.bund.de',
        },
        license: {
          name: 'MIT',
          url: 'https://github.com/secvisogram/csaf-validator-service/blob/main/LICENSE',
        },
      },
    },
    hideUntagged: false,
    exposeRoute: true,
  })
  fastify.register(import('./app/getTests.js'))
  fastify.register(import('./app/validate.js'))
  getHunspellAvailableLangs().then(
    (availableLangs) => {
      fastify.log.info(
        'Installation of hunspell found! Available languages: ' +
        availableLangs.join(', ')
      )
    },
    () => {
      fastify.log.warn(
        'No installation of hunspell found, test 6.3.8 is not available!'
      )
    }
  )
  fastify.register(import('@fastify/cors'), {
    origin: config.get('cors')?.origin,
    methods: config.get('cors')?.methods,
    allowedHeaders: config.get('cors')?.allowedHeaders,
    exposedHeaders: config.get('cors')?.exposedHeaders,
    credentials: config.get('cors')?.credentials,
    maxAge: config.get('cors')?.maxAge,
  })
}
