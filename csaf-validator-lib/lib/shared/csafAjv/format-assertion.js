export default {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://json-schema.org/draft/2020-12/meta/format-assertion',
  $dynamicAnchor: 'meta',

  title: 'Format vocabulary meta-schema for assertion results',
  type: ['object', 'boolean'],
  properties: {
    format: { type: 'string' },
  },
}
