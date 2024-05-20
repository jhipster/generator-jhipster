import { readdir } from 'fs/promises';
import { RECOMMENDED_JAVA_VERSION, RECOMMENDED_NODE_VERSION } from 'generator-jhipster';
import { fromMatrix } from 'generator-jhipster/testing';

const defaultMatrix = {
  os: ['ubuntu-latest'],
  'node-version': [RECOMMENDED_NODE_VERSION],
  'java-version': [RECOMMENDED_JAVA_VERSION],
  'default-environment': ['prod'],
};

export const buildMatrix = async samplesFolder => {
  const samples = await readdir(samplesFolder);
  return {
    include: Object.values(
      fromMatrix({
        ...defaultMatrix,
        'sample-name': samples.filter(sample => !sample.includes('disabled')),
      }),
    ),
  };
};
