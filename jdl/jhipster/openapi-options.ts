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

export default {
  OpenAPIOptionsNames,
  OpenAPIOptionsValues,
  OpenAPIDefaultValues,
};
