import { readFile, readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import type { GitHubMatrixGroup } from './github-matrix.js';
import { getUnknownGitHubMatrixGroupProperties } from './github-matrix.js';

export const getGithubSamplesGroups = async (samplesGroupFolder: string, keepExtensions = false): Promise<string[]> => {
  const samplesFolderContent = await readdir(samplesGroupFolder);
  return samplesFolderContent
    .filter(sample => ['.json', '.js', '.ts', ''].includes(extname(sample)))
    .map(sample => (keepExtensions ? sample : sample.split('.')[0]));
};

export const getGithubSamplesGroup = async (
  samplesGroupFolder: string,
  group: string,
): Promise<{ samples: GitHubMatrixGroup; warnings: string[] }> => {
  const warnings: string[] = [];
  let samples: GitHubMatrixGroup = {};
  const samplesFolderContent = await getGithubSamplesGroups(samplesGroupFolder, true);
  if (samplesFolderContent.includes(`${group}.js`) || samplesFolderContent.includes(`${group}.ts`)) {
    const jsGroup: { default: GitHubMatrixGroup } = await import(join(samplesGroupFolder, `${group}.js`));
    samples = Object.fromEntries(Object.entries(jsGroup.default).map(([sample, value]) => [sample, { ...value, 'samples-group': group }]));
  } else if (samplesFolderContent.includes(`${group}.json`)) {
    const jsonFile = await readFile(join(samplesGroupFolder, `${group}.json`));
    samples = Object.fromEntries(
      Object.entries(JSON.parse(jsonFile.toString()) as GitHubMatrixGroup).map(([sample, value]) => [
        sample,
        { ...value, 'samples-group': group },
      ]),
    );
  } else if (samplesFolderContent.includes(group)) {
    const samplesFolderContent = await readdir(join(samplesGroupFolder, group));
    if (samplesFolderContent.length > 0) {
      // Support jdl files and folder (with .yo-rc.json files)
      samples = Object.fromEntries(
        samplesFolderContent
          .filter(sample => ['', '.jdl'].includes(extname(sample)))
          .map(sample => [
            sample.replace('.jdl', ''),
            {
              'samples-group': group,
              'sample-type': extname(sample) === '.jdl' ? 'jdl' : 'yo-rc',
            },
          ]),
      );
      if (samplesFolderContent.includes('samples.json')) {
        const jsonFile = await readFile(join(samplesGroupFolder, group, 'samples.json'));
        const jsonSamples = JSON.parse(jsonFile.toString()) as GitHubMatrixGroup;
        for (const [sample, value] of Object.entries(jsonSamples)) {
          if (!samples[sample]) {
            throw new Error(`Sample ${sample} not found in ${group}`);
          }
          samples[sample] = { ...samples[sample], ...value };
        }
      }
    }
  }
  if (!samples) {
    throw new Error();
  }
  const unknownProperties = getUnknownGitHubMatrixGroupProperties(samples);
  if (unknownProperties.length) {
    warnings.push(`Unknown properties in ${group}: ${unknownProperties.join(', ')}`);
  }
  return { samples, warnings };
};
