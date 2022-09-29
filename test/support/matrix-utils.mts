const appendTitle = (title, config, value) => {
  if (Array.isArray(value)) value = value[0];
  if (value === undefined) return title;
  const newTitle = typeof value === 'string' && value !== 'no' ? value : `${config}(${value})`;
  return `${title}${title.length === 0 ? '' : '-'}${newTitle}`;
};

export const fromMatrix = configMatrix => {
  const configEntries = Object.entries(configMatrix);
  const samples = configEntries.reduce((previousValue, currentValue) => {
    const [config, configValues] = currentValue;
    if (previousValue.length === 0) {
      return configValues.map(value => [
        value,
        {
          [config]: value,
        },
      ]);
    }
    return previousValue
      .map(([previousName, previousConfig]) =>
        configValues.map(value => {
          return [
            appendTitle(previousName, config, value),
            {
              ...previousConfig,
              [config]: value,
            },
          ];
        })
      )
      .flat();
  }, []);
  return Object.fromEntries(samples);
};

const applyExtendedMatrix = (matrixEntries, configMatrix) => {
  const configEntries = Object.entries(configMatrix);
  const additionalMatrixTemp = configEntries.reduce(
    (currentArray, [configName, configValues]) => {
      const currentConfigObjects = configValues.map(configValue => ({ [configName]: configValue }));
      return currentArray
        .map(existingConfig => currentConfigObjects.map(currentObject => ({ ...existingConfig, ...currentObject })))
        .flat();
    },
    [{}]
  );
  const additionalMatrix = [];
  while (additionalMatrixTemp.length > 0) {
    additionalMatrix.push(additionalMatrixTemp.shift());
    if (additionalMatrixTemp.length > 0) {
      additionalMatrix.push(additionalMatrixTemp.pop());
    }
  }
  matrixEntries.forEach((entry, matrixIndex) => {
    let matrixName = entry[0];
    const matrixConfig = entry[1];
    let newValues = additionalMatrix[matrixIndex % additionalMatrix.length];
    Object.entries(newValues).forEach(([configName, configValue]) => {
      if (typeof configValue === 'object' && !Array.isArray(configValue)) {
        const additionalValues = configValue.additional;
        configValue = configValue.value;
        newValues = { ...newValues, ...additionalValues, [configName]: configValue };
      }
      matrixName = appendTitle(matrixName, configName, configValue);
    });
    entry.splice(0, entry.length);
    entry.push(matrixName, Object.assign(matrixConfig, newValues));
  });
  return matrixEntries;
};

export const extendMatrix = (matrix, configMatrix) => {
  return Object.fromEntries(applyExtendedMatrix(Object.entries(matrix), configMatrix));
};

export const extendFilteredMatrix = (matrix, filter, extendedConfig) => {
  const matrixEntries = Object.entries(matrix);
  const filteredEntries = matrixEntries.filter(([_name, sample]) => filter(sample));
  applyExtendedMatrix(filteredEntries, extendedConfig);
  return Object.fromEntries(matrixEntries);
};
