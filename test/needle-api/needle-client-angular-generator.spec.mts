import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import { getGenerator } from '../support/index.mjs';

import AngularGenerator from '../../generators/angular/index.mjs';
import constants from '../../generators/generator-constants.cjs';
import BaseApplicationGenerator from '../../generators/base-application/index.mjs';

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const mockAngularBlueprintSubGen = class extends AngularGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);
    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return {
      addToMenuStep() {
        this.addEntityToMenu('routerName3', true, 'routerName3');
      },
      addToModuleStep() {
        this.addEntityToModule(
          'entityInstance',
          'entityClass',
          'entityName',
          'entityFolderName',
          'entityFileName',
          'entityUrl',
          'microserviceName',
          false,
          'entity.home.title'
        );
      },
    };
  }
};

describe('needle API Angular angular generator : JHipster with blueprint', () => {
  let runContext;
  let runResult;

  before(async () => {
    runContext = helpers.create(getGenerator('angular'));
    runResult = await runContext
      .withOptions({
        defaults: true,
        skipInstall: true,
        blueprint: 'myblueprint2',
        skipChecks: true,
      })
      .withGenerators([[mockAngularBlueprintSubGen, 'jhipster-myblueprint2:angular']])
      .run();
  });

  it('entity menu contains the entity added by needle api', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/layouts/navbar/navbar.component.html`,
      `
            <li>
              <a
                class="dropdown-item"
                routerLink="routerName3"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="collapseNavbar()"
              >
                <fa-icon icon="asterisk" [fixedWidth]="true"></fa-icon>
                <span jhiTranslate="global.menu.entities.routerName3">Router Name 3</span>
              </a>
            </li>
`
    );
  });

  it('should bail on any file change adding same needles again', async () => {
    await runResult
      .create('jhipster-myblueprint2:angular')
      .withGenerators([[mockAngularBlueprintSubGen, 'jhipster-myblueprint2:angular']])
      .withOptions({ force: false, skipChecks: true, skipInstall: true })
      // .withOptions({ force: false, bail: true, skipChecks: true, skipInstall: true })
      .run();
  });
  it('entity module contains the microservice object added by needle api', () => {
    assert.fileContent(
      `${CLIENT_MAIN_SRC_DIR}app/entities/entity-routing.module.ts`,
      '      {\n' +
        "        path: 'entityUrl',\n" +
        "        data: { pageTitle: 'entity.home.title' },\n" +
        "        loadChildren: () => import('./entityFolderName/entityFileName.module').then(m => m.MicroserviceNameentityNameModule),\n" +
        '      }'
    );
  });
});
