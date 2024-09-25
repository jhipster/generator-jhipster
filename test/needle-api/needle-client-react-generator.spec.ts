import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.js';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.js';
import { clientFrameworkTypes } from '../../lib/jhipster/index.js';
import ReactGenerator from '../../generators/react/index.js';
import BaseApplicationGenerator from '../../generators/base-application/index.js';

const { REACT } = clientFrameworkTypes;

const mockReactBlueprintSubGen: any = class extends ReactGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.jhipsterContext) {
      throw new Error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      addEntityToMenuStep() {
        this.addEntityToMenu('routerName', false);
      },
      addEntityToModuleStep({ application }) {
        const { applicationTypeMicroservice, clientSrcDir } = application;
        this.addEntityToModule('entityInstance', 'entityClass', 'entityName', 'entityFolderName', 'entityFileName', {
          applicationTypeMicroservice,
          clientSrcDir,
        });
      },
    });
  }
};

describe('needle API React: JHipster client generator with blueprint', () => {
  let result;

  before(async () => {
    result = await helpers
      .runJHipster('react')
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        blueprint: ['myblueprint'],
        ignoreNeedlesError: true,
      })
      .withGenerators([[mockReactBlueprintSubGen, { namespace: 'jhipster-myblueprint:react' }]])
      .withAnswers({
        baseName: 'jhipster',
        clientFramework: REACT,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      });
  });

  it('Assert entity is added to module', () => {
    const indexModulePath = `${CLIENT_MAIN_SRC_DIR}app/entities/routes.tsx`;
    const indexReducerPath = `${CLIENT_MAIN_SRC_DIR}app/entities/reducers.ts`;

    runResult.assertFileContent(indexModulePath, "import entityName from './entityFolderName';");
    runResult.assertFileContent(indexModulePath, '<Route path="entityFileName/*" element={<entityName />} />');

    runResult.assertFileContent(indexReducerPath, "import entityInstance from 'app/entities/entityFolderName/entityFileName.reducer';");
    runResult.assertFileContent(indexReducerPath, 'entityInstance,');
  });

  it('Assert entity is added to menu', () => {
    result.assertFileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/menu.tsx`,
      '<MenuItem icon="asterisk" to="/routerName">\n        Router Name\n      </MenuItem>',
    );
  });
});
