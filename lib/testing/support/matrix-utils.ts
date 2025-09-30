import sortKeys from 'sort-keys';

import type { ConfigAll } from '../../types/command-all.ts';

type ValueType = string | boolean | number | undefined | (string | boolean)[];

export type MatrixSample<T extends Record<string, any> = ConfigAll> = {
  [P in keyof T]?: T[P];
};

export type Matrix<T extends Record<string, any> = ConfigAll> = Record<string, MatrixSample<T>>;

export type MatrixInput<T extends Record<string, any> = ConfigAll> = {
  [P in keyof T]?: T[P][];
};

type AdditionalValue<T extends Record<string, any>, K extends keyof T> = { value: T[K]; additional?: MatrixSample<T> } | T[K];

export type MatrixAdditionalInput<T extends Record<string, any> = ConfigAll> = {
  [P in keyof T]?: AdditionalValue<T, P>[];
};

const appendTitle = <K extends string>(title: string, config: K, value: any): string => {
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
export const fromMatrix = <T extends Record<string, any> = ConfigAll>(configMatrix: MatrixInput<T>): Matrix<T> => {
  const configEntries = Object.entries(configMatrix) as [keyof T, ValueType[]][];
  const samples = configEntries.reduce(
    (previousValue, currentValue) => {
      const [config, configValues] = currentValue;
      return previousValue
        .map(([previousName, previousConfig]) =>
          configValues.map((value: ValueType) => {
            return [
              // @ts-expect-error fix type
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
    [['', {}]],
  );
  return Object.fromEntries(samples);
};

const applyExtendedMatrix = <M extends Record<string, any> = ConfigAll, A extends Record<string, any> = ConfigAll>(
  matrixEntries: [string, MatrixSample<M>][],
  configMatrix: MatrixAdditionalInput<A>,
): [string, MatrixSample<M & A>][] => {
  const configEntries = Object.entries(configMatrix) as [keyof A, AdditionalValue<A, keyof A>[]][];
  const additionalMatrixTemp = configEntries.reduce(
    (currentArray, [configName, configValues]) => {
      const currentConfigObjects = configValues.map(configValue => ({
        [configName]: configValue,
      }));
      return currentArray
        .map(existingConfig => currentConfigObjects.map(currentObject => ({ ...existingConfig, ...currentObject })))
        .flat();
    },
    [{} as Record<keyof A, AdditionalValue<A, keyof A>>],
  );
  const additionalMatrix: Record<keyof A, AdditionalValue<A, keyof A>>[] = [];
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
      if (typeof configValue === 'object' && !Array.isArray(configValue) && 'value' in configValue) {
        const additionalValues = configValue.additional;
        configValue = configValue.value;
        newValues = { ...newValues, ...additionalValues, [configName]: configValue };
      }
      matrixName = appendTitle(matrixName, configName, configValue);
    });
    entry.splice(0, entry.length);
    entry.push(matrixName, Object.assign(matrixConfig, newValues));
  });
  return matrixEntries as [string, MatrixSample<M & A>][];
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
export const extendMatrix = <M extends Record<string, any> = ConfigAll, A extends Record<string, any> = ConfigAll>(
  matrix: Matrix<M>,
  configMatrix: MatrixAdditionalInput<A>,
): Matrix<M & A> => Object.fromEntries(applyExtendedMatrix(Object.entries(matrix), configMatrix));

export const extendFilteredMatrix = <M extends Record<string, any> = ConfigAll, A extends Record<string, any> = ConfigAll>(
  matrix: Matrix<M>,
  filter: (sample: MatrixSample<M>) => boolean,
  extendedConfig: MatrixAdditionalInput<A>,
): Matrix<M & A> => {
  const matrixEntries = Object.entries(matrix);
  const filteredEntries = matrixEntries.filter(([_name, sample]) => filter(sample));
  applyExtendedMatrix(filteredEntries, extendedConfig);
  return Object.fromEntries(matrixEntries) as Matrix<M & A>;
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
