import properties from 'dot-properties';

// eslint-disable-next-line import/prefer-default-export
export const addSpringFactory =
  ({ key, value }) =>
  content => {
    const obj = properties.parse(content ?? '');
    const oldContent = obj[key] as string;
    const factories = (oldContent?.split(',') ?? []).map(val => val.trim());
    if (factories.includes(value)) {
      return content;
    }
    obj[key] = [...factories, value].join(',');
    return properties.stringify(obj);
  };
