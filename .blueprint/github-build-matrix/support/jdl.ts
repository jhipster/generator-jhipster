export const convertOptionsToJDL = (opts: Record<string, any>): string => {
  return `application {
  config {
    testFrameworks [cypress]
${Object.entries(opts)
  .map(([key, value]) => `    ${key} ${value}`)
  .join('\n')}
  }
}`;
};
