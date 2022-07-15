const defaultOptions = {
  krokiEndpoint: "https://kroki.io",
  defaultOutputFormat: "svg",
  path: null,
  copyToSrcPath: false,
  skipImageCreation: false,
};

function pluginOptionsSchema({ Joi }) {
  return Joi.object({
    krokiEndpoint: Joi.string()
      .uri()
      .description(
        `Kroki server endpoint (default: ${defaultOptions.krokiEndpoint})`
      ),
    defaultOutputFormat: Joi.string().description(
      `Output format if not specified on frontmatter (default: ${defaultOptions.defaultOutputFormat})`
    ),
    path: Joi.string().description(
      `If present only process files inside this path (default: ${defaultOptions.path})`
    ),
    copyToSrcPath: Joi.boolean().description(
      `Copy image to source image path (default: ${defaultOptions.copyToSrcPath})`
    ),
    skipImageCreation: Joi.boolean().description(
      `Only create nodes, don't download files (default: ${defaultOptions.skipImageCreation})`
    ),
  });
}

module.exports.pluginOptionsSchema = pluginOptionsSchema;

function getOptions(pluginOptions) {
  const options = {
    ...defaultOptions,
    ...pluginOptions,
  };

  if (options.copyToSrcPath === true && options.skipImageCreation === true) {
    throw Error(
      `option: copyToSrcPath with value 'true' will have no effect with skipImageCreation with value 'true'`
    );
  }

  return options;
}

module.exports.getOptions = getOptions;
