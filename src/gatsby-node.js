const {
  onCreateNode,
  unstable_shouldOnCreateNode,
} = require(`./on-create-node`)

const { pluginOptionsSchema } = require(`./plugin-options`)

module.exports.pluginOptionsSchema = pluginOptionsSchema

/**
 * Create Kroki types
 */
module.exports.createSchemaCustomization = require(`./create-schema-customization`)

/**
 * Check whether to create Kroki nodes from Kroki files.
 */
module.exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode

/**
 * Create Kroki nodes from Kroki files.
 */
module.exports.onCreateNode = onCreateNode
