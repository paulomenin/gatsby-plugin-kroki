const createSchemaCustomization = require("../src/create-schema-customization");
const { typeDefs } = require("../src/create-schema-customization");

const mockApi = {
  actions: {
    createTypes: jest.fn(),
  },
};

describe("test createSchemaCustomization", () => {
  it("should call createTypes", () => {
    // Arrange

    // Act
    createSchemaCustomization(mockApi);

    // Assert
    expect(mockApi.actions.createTypes).toHaveBeenNthCalledWith(1, typeDefs);
  });
});
