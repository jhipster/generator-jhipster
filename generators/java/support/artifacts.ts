import type { JavaArtifactType } from '../types.js';

export const javaScopeToGradleScope = (artifactType: JavaArtifactType): string => {
  const { scope = 'compile', type = 'jar' } = artifactType;
  if (type === 'pom') {
    if (scope === 'import') {
      return 'implementation platform';
    }
    throw new Error(`Unsupported scope for POM artifact: ${scope}`);
  }
  if (type === 'jar') {
    switch (scope) {
      case 'compile':
        return 'implementation';
      case 'provided':
        return 'compileOnly';
      case 'runtime':
        return 'runtimeOnly';
      case 'test':
        return 'testImplementation';
      case 'system':
        return 'system';
      case 'annotationProcessor':
        return 'annotationProcessor';
      default:
        throw new Error(`Unsupported scope for JAR artifact: ${scope}`);
    }
  }
  throw new Error(`Unsupported type: ${type}`);
};
