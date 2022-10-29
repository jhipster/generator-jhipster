export default function getOutputPathCustomizer(options: any, configOptions: any): any {
  let outputPathCustomizer = options.outputPathCustomizer;
  if (!outputPathCustomizer && configOptions) {
    outputPathCustomizer = configOptions.outputPathCustomizer;
  }
  return outputPathCustomizer;
}
