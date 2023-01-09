import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default function (samples = ['angular', 'react', 'vue']) {
  return Object.fromEntries(
    samples
      .map(sampleFile => JSON.parse(readFileSync(join(__dirname, `../../workflow-samples/${sampleFile}.json`)).toString()).include)
      .flat()
      .map(sample => [sample.name, sample])
  );
}
