const { onCreateNode } = require("../src/gatsby-node");

const mockOptions = {
    krokiEndpoint: "https://kroki.server",
    defaultOutputFormat: "png",
    path: null,
    copyToSrcPath: false,
    skipImageCreation: false,
};

const mockNode = {
  extension: "kroki",
  internal: {
    type: "File",
  }
};

const fileContent = `
---
diagramType: plantuml
diagramOutput: svg
---

Content
`

const mockApi = {
  actions: { createNode: jest.fn(), createParentChildLink: jest.fn() },
  loadNodeContent: jest.fn(),
  createNodeId: jest.fn(),
  createContentDigest: jest.fn(),
  reporter: jest.fn(),
};

describe("onCreateNode function", () => {
  describe("test node types", () => {
    it("should ignore an invalid node type", () => {
      // Given
      const mockedNode = {
        ...mockNode,
        internal: { type: "InvalidType" },
      };

      // When
      onCreateNode({ node: mockedNode, ...mockApi }, mockOptions);

      // Then
      expect(mockApi.createNode).not.toBeCalled();
    });

    it("should ignore an invalid extension", () => {
        // Given
        const mockedNode = {
            ...mockNode,
            extension: "InvalidExtension",
        };

        // When
        onCreateNode({ node: mockedNode, ...mockApi }, mockOptions);

        // Then
        expect(mockApi.createNode).not.toBeCalled();
    });

    it("should process a valid node type", () => {
      // Given

      // When
      onCreateNode({ node: mockNode, ...mockApi }, mockOptions);

      // Then
      expect(mockApi.createNode).toHaveBeenCalledTimes(2);
    });
  });

});
