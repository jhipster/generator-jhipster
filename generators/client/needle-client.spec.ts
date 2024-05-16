import { before, it, describe } from 'esmocha';
import ClientGenerator from '../../generators/client/index.js';
import { CLIENT_MAIN_SRC_DIR } from '../generator-constants.js';
import { dryRunHelpers as helpers, result as runResult, getGenerator } from '../../testing/index.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockBlueprintSubGen: any = class extends ClientGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.jhipsterContext) {
      throw new Error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [ClientGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      // @ts-ignore
      async additionalResource({ source }) {
        source!.addExternalResourceToRoot!({
          resource: '<link rel="stylesheet" href="content/css/my.css">',
          comment: 'Comment added by JHipster API',
        });
      },
    });
  }
};

describe('needle API Client: JHipster client generator with blueprint', () => {
  before(async () => {
    await helpers
      .run(getGenerator('client'))
      .withJHipsterConfig({
        skipServer: true,
      })
      .withOptions({
        blueprint: 'myblueprint',
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:client' }]]);
  });

  it('Assert index.html contain the comment and the resource added', () => {
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}index.html`, '<!-- Comment added by JHipster API -->');
    runResult.assertFileContent(`${CLIENT_MAIN_SRC_DIR}index.html`, '<link rel="stylesheet" href="content/css/my.css" />');
  });
});
