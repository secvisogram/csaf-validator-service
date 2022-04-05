/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export default async function (fastify) {
  fastify.register(import('fastify-swagger'), {
    routePrefix: '/docs',
    openapi: {
      info: {
        title: 'CSAF Validator Service',
        version: '1.0.0',
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
}
