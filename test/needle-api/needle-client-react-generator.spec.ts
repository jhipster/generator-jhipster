import { before, it, describe } from 'esmocha';
import { basicHelpers as helpers, result as runResult, getGenerator } from '../support/index.js';
import { CLIENT_MAIN_SRC_DIR } from '../../generators/generator-constants.js';
import { clientFrameworkTypes } from '../../jdl/jhipster/index.js';
import ReactGenerator from '../../generators/react/index.js';
import BaseApplicationGenerator from '../../generators/base-application/index.js';

const { REACT } = clientFrameworkTypes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockReactBlueprintSubGen: any = class extends ReactGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    if (!this.jhipsterContext) {
      throw new Error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    const customPhaseSteps = {
      addEntityToMenuStep() {
        this.addEntityToMenu('routerName', false, false);
      },
      addEntityToModuleStep({ application }) {
        const { applicationTypeMicroservice, clientSrcDir } = application;
        this.addEntityToModule('entityInstance', 'entityClass', 'entityName', 'entityFolderName', 'entityFileName', {
          applicationTypeMicroservice,
          clientSrcDir,
        });
      },
    };
    return { ...customPhaseSteps };
  }
};

describe('needle API React: JHipster client generator with blueprint', () => {
  let result;

  before(async () => {
    result = await helpers
      .run(getGenerator('react'))
      .withOptions({
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        blueprint: 'myblueprint',
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
