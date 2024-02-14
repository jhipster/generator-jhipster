import { removeUnusedImports } from 'java-lint';

export default async ({ fileContents }) => {
  try {
    return { result: await removeUnusedImports(fileContents) };
  } catch (error) {
    return { error: `${error}` };
  }
};
