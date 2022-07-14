const path = require(`path`)
const fs = require(`fs`)
const pako = require("pako")
const matter = require(`gray-matter`)
const { createRemoteFileNode } = require(`gatsby-source-filesystem`)
const { getOptions } = require("./plugin-options")

const KROKI_NODE_TYPE = "Kroki"

function unstable_shouldOnCreateNode({ node }) {
  return node.internal.type === `File` && ["kroki"].includes(node.extension)
}

module.exports.unstable_shouldOnCreateNode = unstable_shouldOnCreateNode

async function onCreateNode(api, pluginOptions) {
  const {
    node,
    actions: { createNode, createParentChildLink },
    loadNodeContent,
    createNodeId,
    createContentDigest,
    reporter,
  } = api

  const options = getOptions(pluginOptions)

  if (!unstable_shouldOnCreateNode({ node: node })) {
    return
  }

  if (options.path !== null) {
    const normalizedPath = path.join(
      ...path.normalize(options.path).split(path.sep)
    )
    const normalizedNodePath = path.normalize(node.absolutePath)

    if (!normalizedNodePath.startsWith(normalizedPath)) {
      return
    }
  }

  const content = await loadNodeContent(node)

  try {
    const file = matter(content)

    if (file.isEmpty) {
      throw new Error("Missing frontmatter")
    }

    if (!file.data.hasOwnProperty("diagramType")) {
      throw new Error("Missing frontmatter 'diagramType' field")
    }

    const diagramType = file.data.diagramType
    const diagramOutput = file.data.outputFormat
      ? file.data.outputFormat
      : options.defaultOutputFormat

    const encodedContent = encodeContentForKrokiGetRequest(file.content)

    const krokiURL = `${options.krokiEndpoint}/${diagramType}/${diagramOutput}/${encodedContent}`

    const krokiNode = {
      id: createNodeId(`${node.id} >>> ${KROKI_NODE_TYPE}`),
      children: [],
      parent: node.id,
      internal: {
        type: KROKI_NODE_TYPE,
        content: content,
      },
      diagramContent: file.content,
      encodedContent: encodedContent,
      diagramType: diagramType,
      diagramOutputFormat: diagramOutput,
      krokiURL: krokiURL,
      frontmatter: {
        ...file.data,
      },
    }

    if (node.internal.type === `File`) {
      krokiNode.fileAbsolutePath = node.absolutePath
    }

    krokiNode.internal.contentDigest = createContentDigest(krokiNode)

    if (!options.skipImageCreation) {
      const fileNode = await downloadDiagramFile({
        api: api,
        pluginOptions: pluginOptions,
        krokiNode: krokiNode,
        fileNode: node,
      })

      if (options.copyToSrcPath) {
        const filename = path.basename(fileNode.absolutePath)
        const destinationDir = path.dirname(krokiNode.fileAbsolutePath)
        const destinationPath = path.join(destinationDir, filename)
        fs.copyFileSync(fileNode.absolutePath, destinationPath)
      }
    }

    createNode(krokiNode)
    createParentChildLink({ parent: node, child: krokiNode })

    return krokiNode
  } catch (err) {
    reporter.panicOnBuild(
      `Error processing ${KROKI_NODE_TYPE} ${
        node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`
      }:\n
      ${err.message}`
    )
  }
}

function encodeContentForKrokiGetRequest(content) {
  const data = Buffer.from(content, "utf8")
  const compressed = pako.deflate(data, { level: 9 })
  const result = Buffer.from(compressed)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")

  return result
}

async function downloadDiagramFile({
  api,
  pluginOptions,
  fileNode,
  krokiNode,
}) {
  const {
    getCache,
    actions: { createNode },
    createNodeId,
  } = api

  const imageNode = await createRemoteFileNode({
    url: krokiNode.krokiURL,
    parentNodeId: krokiNode.id,
    getCache,
    createNode,
    createNodeId,
    name: `${fileNode.name}`,
    ext: `.${krokiNode.diagramOutputFormat}`,
  })

  if (imageNode) {
    krokiNode.localFile___NODE = imageNode.id
  }

  return imageNode
}

module.exports.onCreateNode = onCreateNode
