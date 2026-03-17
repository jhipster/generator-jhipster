import { removeUnusedImports } from '../../java/support/index.ts';

export default ({ fileContents }: { fileContents: string }): { result: string } | { error: string } => {
  try {
    return { result: removeUnusedImports(fileContents) };
  } catch (error) {
    return { error: `${error}` };
  }
};
