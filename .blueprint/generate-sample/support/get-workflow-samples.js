import { readFileSync } from 'fs';
import { join } from 'path';
import { testIntegrationFolder } from '../../constants.js';

const WORKFLOW_NAMES = ['angular', 'react', 'vue', 'daily-ms-oauth2', 'daily-neo4j'];
export const DAILY_PREFIX = 'daily-';

export const isDaily = workflow => workflow.startsWith(DAILY_PREFIX);

export const getWorkflowSamples = (workflows = WORKFLOW_NAMES) =>
  Object.fromEntries(
    workflows.map(workflow => [
      workflow,
      Object.fromEntries(
        JSON.parse(readFileSync(join(testIntegrationFolder, `workflow-samples/${workflow}.json`)).toString())
          .include.map(sample =>
            isDaily(workflow)
              ? {
                  ...sample,
                  name: `${DAILY_PREFIX}${sample.name}`,
                  'app-sample': `${DAILY_PREFIX}${sample['app-sample'] ?? sample.name}`,
                }
              : sample,
          )
          .map(sample => [sample.name, sample]),
      ),
    ]),
  );

export default workflows =>
  Object.fromEntries(
    Object.values(getWorkflowSamples(workflows))
      .map(workflowSamples => Object.entries(workflowSamples))
      .flat(),
  );
