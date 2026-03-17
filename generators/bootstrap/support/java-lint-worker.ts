import { removeUnusedImports } from '../../java/support/index.ts';

export default async ({ fileContents }: { fileContents: string }): Promise<{ result: string } | { error: string }> => {
  try {
    return { result: await removeUnusedImports(fileContents) };
  } catch (error) {
    return { error: `${error}` };
  }
};
