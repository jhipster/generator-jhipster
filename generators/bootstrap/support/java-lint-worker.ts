import { removeUnusedImports } from 'java-lint';

export default ({ fileContents }: { fileContents: string }): { result: string } | { error: string } => {
  try {
    return { result: removeUnusedImports(fileContents) };
  } catch (error) {
    return { error: `${error}` };
  }
};
