export const addLineNumbers = (input: string) =>
  input
    .split('\n')
    .map((line, index) => `${index + 1}: ${line}`)
    .join('\n');
