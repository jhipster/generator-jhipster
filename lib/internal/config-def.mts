export const convertConfigToOption = (name, config) => {
  const choices = config.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value));
  return {
    name,
    description: config.description,
    choices,
    scope: 'storage',
    ...config.cli,
  };
};
