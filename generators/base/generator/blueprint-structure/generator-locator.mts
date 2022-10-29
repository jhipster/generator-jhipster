export default function locateGenerator(generator: any, env: any, options: any): any {
  let existingGenerator;
  try {
    existingGenerator = generator;
    if (!existingGenerator) {
      existingGenerator = env.requireNamespace(options.namespace).generator;
    }
  } catch (error) {
    const split = options.namespace.split(':', 2);
    existingGenerator = split.length === 1 ? split[0] : split[1];
  }
  return existingGenerator;
}
