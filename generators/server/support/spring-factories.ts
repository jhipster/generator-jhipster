import properties from 'dot-properties';

export const addSpringFactory =
  ({ key, value }: { key: string; value: string }) =>
  (content: string) => {
    const obj = properties.parse(content ?? '');
    const oldContent = obj[key] as string;
    const factories = (oldContent?.split(',') ?? []).map(val => val.trim());
    if (factories.includes(value)) {
      return content;
    }
    obj[key] = [...factories, value].join(',');
    return properties.stringify(obj);
  };
