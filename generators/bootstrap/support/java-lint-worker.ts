import { removeUnusedImports } from '../../java/support/index.ts';

/**
 * Worker function that invokes {@link removeUnusedImports} on the provided Java source content.
 *
 * @param input the worker input containing the Java source content
 * @param input.fileContents the Java source content to process
 * @returns `{ result: string }` with the cleaned content on success, or `{ error: string }` with the error message on failure
 */
export default async ({ fileContents }: { fileContents: string }): Promise<{ result: string } | { error: string }> => {
  try {
    return { result: await removeUnusedImports(fileContents) };
  } catch (error) {
    return { error: `${error}` };
  }
};
