export const convertOptionsToJDL = (opts: Record<string, any>): string => {
  return `application {
  config {
    testFrameworks [cypress]
${Object.entries(opts)
  .filter(([_key, value]) => value !== undefined)
  .map(([key, value]) => `    ${key} ${value}`)
  .join('\n')}
  }
}`;
};
