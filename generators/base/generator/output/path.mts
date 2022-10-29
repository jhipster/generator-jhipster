import normalize from 'normalize-path';

export function normalizeOutputPath(outputPath: any): any {
  return outputPath ? normalize(outputPath) : outputPath;
}

export function applyPathCustomizer(context: any, outputPath: any, outputPathCustomizer: any): any {
  if (Array.isArray(outputPathCustomizer)) {
    let outputhPathApplied = outputPath;
    outputPathCustomizer.forEach(customizer => {
      outputhPathApplied = customizer.call(context, outputhPathApplied);
    });
    return outputhPathApplied;
  }
  return outputPathCustomizer.call(context, outputPath);
}
