const fs = require(`fs`);

const {
  unstable_shouldOnCreateNode,
  onCreateNode,
} = require("../src/gatsby-node");

const { createRemoteFileNode } = require(`gatsby-source-filesystem`);

jest.mock(`fs`);
jest.mock(`gatsby-source-filesystem`, () => ({
  createRemoteFileNode: jest
    .fn()
    .mockResolvedValue({ absolutePath: "/path/to/cache/file.svg" }),
}));

createRemoteFileNode;

const mockNode = {
  extension: "kroki",
  absolutePath: "/path/to/file/diagram.kroki",
  internal: {
    type: "File",
  },
};

const mockOptions = {
  krokiEndpoint: "https://kroki.server",
  defaultOutputFormat: "png",
  path: null,
  copyToSrcPath: false,
  skipImageCreation: false,
};

const fileContent = `---
diagramType: plantuml
diagramOutput: svg
---

Content
`;

const fileWithoutDiagramTypeContent = `---
diagramOutput: svg
---

Content
`;

const fileWithoutFrontmatterContent = `
Content
`;

const mockApi = {
  actions: { createNode: jest.fn(), createParentChildLink: jest.fn() },
  loadNodeContent: jest.fn().mockResolvedValue(fileContent),
  createNodeId: jest.fn(),
  createContentDigest: jest.fn(),
  reporter: {
    panicOnBuild: jest.fn(),
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockApi.loadNodeContent = jest.fn().mockResolvedValue(fileContent);
});

describe("test unstable_shouldOnCreateNode function", () => {
  it("should return true for an invalid node type", () => {
    // Arrange

    // Act
    const result = unstable_shouldOnCreateNode({ node: mockNode });

    // Assert
    expect(result).toBeTruthy();
  });

  it("should return false for an invalid node type", () => {
    // Arrange
    const mockedNode = {
      ...mockNode,
      internal: { type: "InvalidType" },
    };

    // Act
    const result = unstable_shouldOnCreateNode({ node: mockedNode });

    // Assert
    expect(result).toBeFalsy();
  });

  it("should return false for an invalid extension", () => {
    // Arrange
    const mockedNode = {
      ...mockNode,
      extension: "InvalidExtension",
    };

    // Act
    const result = unstable_shouldOnCreateNode({ node: mockedNode });

    // Assert
    expect(result).toBeFalsy();
  });
});

describe("test onCreateNode function", () => {
  it("should ignore an invalid node type", async () => {
    // Arrange
    const mockedNode = {
      ...mockNode,
      internal: { type: "InvalidType" },
    };

    // Act
    await onCreateNode({ node: mockedNode, ...mockApi }, mockOptions);

    // Assert
    expect(mockApi.actions.createNode).not.toBeCalled();
  });

  it("should ignore a file not in the path option", async () => {
    // Arrange
    const mockedOptions = {
      ...mockOptions,
      path: "/path/other",
    };

    // Act
    await onCreateNode({ node: mockNode, ...mockApi }, mockedOptions);

    // Assert
    expect(mockApi.actions.createNode).not.toBeCalled();
  });

  it("should create child link for Kroki node and downloaded diagram when process a file", async () => {
    // Arrange

    // Act
    await onCreateNode({ node: mockNode, ...mockApi }, mockOptions);

    // Assert
    expect(mockApi.actions.createParentChildLink).toBeCalledTimes(2);
  });

  it("should process a file in the path option", async () => {
    // Arrange
    const mockedOptions = {
      ...mockOptions,
      path: "/path/to/",
    };

    // Act
    await onCreateNode({ node: mockNode, ...mockApi }, mockedOptions);

    // Assert
    expect(mockApi.actions.createNode).toBeCalled();
  });

  it("should report error when file does not have frontmatter", async () => {
    // Arrange
    const mockedApi = {
      ...mockApi,
      loadNodeContent: jest
        .fn()
        .mockResolvedValue(fileWithoutFrontmatterContent),
    };

    // Act
    await onCreateNode({ node: mockNode, ...mockedApi }, mockOptions);

    // Assert
    expect(mockApi.reporter.panicOnBuild).toBeCalled();
  });

  it("should report error when file does not diagramType on frontmatter", async () => {
    // Arrange
    const mockedApi = {
      ...mockApi,
      loadNodeContent: jest
        .fn()
        .mockResolvedValue(fileWithoutDiagramTypeContent),
    };

    // Act
    await onCreateNode({ node: mockNode, ...mockedApi }, mockOptions);

    // Assert
    expect(mockApi.reporter.panicOnBuild).toBeCalled();
  });

  it("should not download the diagram when skipImageCreation is true", async () => {
    // Arrange
    const mockedOptions = {
      ...mockOptions,
      skipImageCreation: true,
    };

    // Act
    await onCreateNode({ node: mockNode, ...mockApi }, mockedOptions);

    // Assert
    expect(createRemoteFileNode).not.toBeCalled();
  });

  it("should copy diagram to source path if copyToSrcPath option is true", async () => {
    // Arrange
    const mockedOptions = {
      ...mockOptions,
      skipImageCreation: false,
      copyToSrcPath: true,
    };

    // Act
    await onCreateNode({ node: mockNode, ...mockApi }, mockedOptions);

    // Assert
    expect(fs.copyFileSync).toBeCalled();
  });
});
