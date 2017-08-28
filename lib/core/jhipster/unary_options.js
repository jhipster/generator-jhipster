

const UNARY_OPTIONS = {
  SKIP_CLIENT: 'skipClient',
  SKIP_SERVER: 'skipServer',
  SKIP_USER_MANAGEMENT: 'skipUserManagement',
  NO_FLUENT_METHOD: 'noFluentMethod',
  FILTER: 'filter',
};

function exists(option) {
  return Object.keys(UNARY_OPTIONS).map(key => UNARY_OPTIONS[key]).includes(option);
}

module.exports = {
  UNARY_OPTIONS,
  exists
};
