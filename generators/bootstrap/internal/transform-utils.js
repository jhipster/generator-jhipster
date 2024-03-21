export const addLineNumbers = input =>
  input
    .split('\n')
    .map((line, index) => `${index + 1}: ${line}`)
    .join('\n');
