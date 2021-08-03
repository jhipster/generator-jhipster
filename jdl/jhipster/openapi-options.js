const OpenAPIOptionsNames = {
  REGEN: 'regen',
  API_CLIENTS: 'new',
};

const OpenAPIOptionsValues = {
  REGEN: {
    YES: true,
    NO: false,
  },
};

const OpenAPIDefaultValues = {
  REGEN: OpenAPIOptionsValues.REGEN.NO,
};

module.exports = {
  OpenAPIOptionsNames,
  OpenAPIOptionsValues,
  OpenAPIDefaultValues,
};
