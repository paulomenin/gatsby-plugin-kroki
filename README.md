# gatsby-plugin-kroki

Gatsby plugin to create Kroki nodes from File nodes with `.kroki` extension.
It also downloads the diagram rendered files.

You can create `.kroki` files with the following frontmatter:

```text
---
diagramType: plantuml
outputFormat: png
---

diagram content
```

This plugin will parse these files and create Kroki nodes with the following fields:

- frontmatter
- diagramType: from the frontmatter
- diagramOutputFormat
- diagramContent: only the content of the file without the frontmatter
- encodedContent: kroki encoded file content for GET requests
- krokiURL: URL with the encoded content used to download the diagram
- fileAbsolutePath: path of .kroki file
- localFile: File node with the downloaded diagram

It also will download the diagram into the cache folder and publish it into the public folder.
You can get the public path to insert into pages from the Kroki node `localFile.publicURL` field.

## Install

`npm install --save gatsby-plugin-kroki`

or

`yarn add gatsby-plugin-kroki`

## How to use

```javascript
// In your gatsby-config.js
module.exports = {
  plugins: [
    {
      resolve: "gatsby-plugin-kroki",
      // Default values for options
      options: {
        // Kroki server Url used to generate diagrams
        krokiEndpoint: "https://kroki.io",
        defaultOutputFormat: "svg",
        // Only process .kroki files inside this path
        path: null,
        // Make a copy of the downloaded diagram in the same
        // directory of the .kroki file
        copyToSrcPath: false,
        // Skip diagram download and only create Kroki nodes
        skipImageCreation: false,
      },
    },
  ],
};
```

## Gatsby GraphQL Example

You can use a query like these to get the downloaded image Url:

```graphql
{
  allKroki {
    nodes {
      krokiURL
      localFile {
        publicURL
      }
      parent {
        ... on File {
          relativePath
          absolutePath
        }
      }
    }
  }
}
```
