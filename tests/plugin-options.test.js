const Joi = require("joi");
const { getOptions, pluginOptionsSchema } = require("../src/plugin-options");

const mockOptions = {
  krokiEndpoint: "https://kroki.server",
  defaultOutputFormat: "png",
  path: "",
  copyToSrcPath: true,
  skipImageCreation: false,
};

describe("test pluginOptionsSchema", () => {
  it("default options should have all keys from options schema", () => {
    // Arrange
    const schema = pluginOptionsSchema({ Joi: Joi });
    const schemaKeys = Object.keys(schema.describe().keys);

    // Act
    const options = getOptions();
    const optionsKeys = Object.keys(options);

    // Assert
    expect(optionsKeys.sort()).toEqual(schemaKeys.sort());
  });
});

describe("test getOptions", () => {
  it("no options should return default values", () => {
    // Arrange
    const mockedOptions = {};

    // Act
    const options = getOptions(mockedOptions);

    // Assert
    expect(options).toEqual({
      krokiEndpoint: "https://kroki.io",
      defaultOutputFormat: "svg",
      path: null,
      copyToSrcPath: false,
      skipImageCreation: false,
    });
  });

  it("should set all options", () => {
    // Arrange
    // Act
    const options = getOptions(mockOptions);

    // Assert
    expect(options).toEqual(mockOptions);
  });

  it("should throw error when both options copyToSrcPath and skipImageCreation are true", () => {
    // Arrange
    const mockedOptions = {
      ...mockOptions,
      copyToSrcPath: true,
      skipImageCreation: true,
    };

    // Act
    //Assert
    expect(() => getOptions(mockedOptions)).toThrow(Error);
  });
});
