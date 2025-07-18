import sortKeys from 'sort-keys';

export type ValueType = string | boolean | number | undefined | (string | boolean)[];

export type MatrixSample = Record<string, ValueType>;

export type Matrix = Record<string, MatrixSample>;

export type MatrixInput = Record<string, ValueType[]>;

type AdditionalValue = { value: ValueType; additional?: Record<string, ValueType> };

export type MatrixAdditionalInput = Record<string, (AdditionalValue | ValueType)[]>;

const appendTitle = (title: string, config: string, value: ValueType): string => {
  if (Array.isArray(value)) value = value[0];
  if (value === undefined) return title;
  const newTitle = typeof value === 'string' && value !== 'no' ? value : `${config}(${value})`;
  return `${title}${title.length === 0 ? '' : '-'}${newTitle}`;
};

/**
 * Create a matrix from a options
 * @example
 * const matrix = fromMatrix({ a: [true, false], b: [true, false] });
 * // {
 * //  'a(true)-b(true)': { a: true, b: true },
 * //  'a(true)-b(false)': { a: true, b: false },
 * //  'a(false)-b(true)': { a: false, b: true },
 * //  'a(false)-b(false)': { a: false, b: false },
 * // }
 */
export const fromMatrix = (configMatrix: MatrixInput): Matrix => {
  const configEntries = Object.entries(configMatrix);
  const samples = configEntries.reduce(
    (previousValue, currentValue) => {
      const [config, configValues] = currentValue;
      return previousValue
        .map(([previousName, previousConfig]) =>
          configValues.map((value: ValueType) => {
            return [
              appendTitle(previousName as string, config, value),
              {
                ...(previousConfig as Record<string, ValueType>),
                [config]: value,
              },
            ];
          }),
        )
        .flat();
    },
    [['', {} as Record<string, ValueType>]],
  );
  return Object.fromEntries(samples);
};

const applyExtendedMatrix = (matrixEntries: [string, MatrixSample][], configMatrix: MatrixAdditionalInput): [string, MatrixSample][] => {
  const configEntries = Object.entries(configMatrix);
  const additionalMatrixTemp = configEntries.reduce(
    (currentArray, [configName, configValues]) => {
      const currentConfigObjects: Record<string, ValueType | AdditionalValue>[] = configValues.map(configValue => ({
        [configName]: configValue,
      }));
      return currentArray
        .map(existingConfig => currentConfigObjects.map(currentObject => ({ ...existingConfig, ...currentObject })))
        .flat();
    },
    [{} as Record<string, ValueType | AdditionalValue>],
  );
  const additionalMatrix: Record<string, ValueType | AdditionalValue>[] = [];
  while (additionalMatrixTemp.length > 0) {
    additionalMatrix.push(additionalMatrixTemp.shift()!);
    if (additionalMatrixTemp.length > 0) {
      additionalMatrix.push(additionalMatrixTemp.pop()!);
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

/**
 * Apply new matrix value to existing matrix
 * @example
 * const matrix = extendMatrix(fromMatrix({ initialMatrix: [true, false] }), { toBeMerged: [true, false] });
 * // {
 * //  'initialMatrix(true)-toBeMerged(true)': { initialMatrix: true, toBeMerged: true },
 * //  'initialMatrix(false)-toBeMerged(false)': { initialMatrix: false, toBeMerged: false },
 * // }
 */
export const extendMatrix = (matrix: Matrix, configMatrix: MatrixAdditionalInput): Matrix =>
  Object.fromEntries(applyExtendedMatrix(Object.entries(matrix), configMatrix));

export const extendFilteredMatrix = (
  matrix: Matrix,
  filter: (sample: MatrixSample) => boolean,
  extendedConfig: MatrixAdditionalInput,
): Matrix => {
  const matrixEntries = Object.entries(matrix);
  const filteredEntries = matrixEntries.filter(([_name, sample]) => filter(sample));
  applyExtendedMatrix(filteredEntries, extendedConfig);
  return Object.fromEntries(matrixEntries);
};

export const buildSamplesFromMatrix = (
  samples: Record<string, Record<string, unknown>>,
  { commonConfig = {} }: { commonConfig?: Record<string, unknown> } = {},
): Record<string, Record<string, unknown>> =>
  sortKeys(
    commonConfig
      ? Object.fromEntries(
          Object.entries(samples).map(([name, sample]) => [
            name,
            {
              ...sample,
              ...commonConfig,
            },
          ]),
        )
      : samples,
    { deep: true },
  );
