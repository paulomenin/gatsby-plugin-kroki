const typeDefs = `
      type Kroki implements Node {
          frontmatter: KrokiFrontmatter
          diagramContent: String
          diagramOutputFormat: String
          diagramType: String
          encodedContent: String
          krokiURL: String
          fileAbsolutePath: String
      }

      type KrokiFrontmatter {
          diagramType: String
          outputFormat: String
      }
  `

function createSchemaCustomization({ actions: { createTypes } }) {
  createTypes(typeDefs)
}

module.exports = createSchemaCustomization

module.exports.typeDefs = typeDefs
