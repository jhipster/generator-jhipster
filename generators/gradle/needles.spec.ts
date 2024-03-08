import { before, it, describe } from 'esmocha';
import { dryRunHelpers as helpers, result as runResult } from '../../testing/index.js';
import BaseApplicationGenerator from '../base-application/index.js';
import { GENERATOR_SERVER } from '../generator-list.js';

class mockBlueprintSubGen extends BaseApplicationGenerator {
  constructor(args, opts, features) {
    super(args, opts, features);

    this.sbsBlueprint = true;
  }

  get [BaseApplicationGenerator.POST_WRITING]() {
    return this.asPostWritingTaskGroup({
      gradleStep({ source }) {
        source.addGradleProperty?.({ property: 'name', value: 'value' });
        source.addGradlePlugin?.({ id: 'id', version: 'version' });
        source.addGradleDependency?.({ scope: 'scope3', groupId: 'group3', artifactId: 'name3', version: 'version3' });
        source.addGradleDependency?.({ scope: 'scope4', groupId: 'group4', artifactId: 'name4' });
        source.applyFromGradle?.({ script: 'name.gradle' });
        source.addGradleMavenRepository?.({ url: 'url', username: 'username', password: 'password' });
        source.addGradleBuildSrcDependency?.({ scope: 'scope5', groupId: 'group5', artifactId: 'name5', version: 'version5' });
        source.addGradleDependencyCatalogVersion?.({ name: 'version-name', version: 'version' });
        source.addGradleBuildSrcDependencyCatalogVersion?.({ name: 'version-name', version: 'version' });
      },
    });
  }
}

describe('needle API server gradle: JHipster server generator with blueprint', () => {
  before(async () => {
    await helpers
      .runJHipster(GENERATOR_SERVER)
      .withJHipsterConfig({
        blueprint: 'myblueprint',
        clientFramework: 'no',
        buildTool: 'gradle',
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:server']]);
  });

  it('Assert gradle.properties has the property added', () => {
    runResult.assertFileContent('gradle.properties', 'name=value');
  });

  it('Assert gradle.properties has not snake case properties', () => {
    runResult.assertNoFileContent('gradle.properties', /^(?!.*#).*_.*[$|=]/m); // Not comment and contains underscore
  });

  it('Assert build.gradle has the PluginToPluginsBlock added', () => {
    runResult.assertFileContent('build.gradle', 'id "id" version "version"');
  });

  it('Assert build.gradle has the Dependency with version added', () => {
    runResult.assertFileContent('build.gradle', 'scope3 "group3:name3:version3"');
  });

  it('Assert build.gradle has the Dependency without version added', () => {
    runResult.assertFileContent('build.gradle', 'scope4 "group4:name4"');
  });

  it('Assert build.gradle has the apply gradle script added', () => {
    runResult.assertFileContent('build.gradle', 'apply from: "name.gradle"');
  });

  it('Assert build.gradle has the maven repository added', () => {
    runResult.assertFileContent(
      'build.gradle',
      '    maven {\n' +
        '        url "url"\n' +
        '        credentials {\n' +
        '            username = "username"\n' +
        '            password = "password"\n' +
        '        }\n' +
        '    }',
    );
  });

  it('Assert buildSrc/build.gradle has the Dependency with version added', () => {
    runResult.assertFileContent('buildSrc/build.gradle', 'scope5 "group5:name5:version5"');
  });

  it('Assert gradle/libs.versions.toml has the version added', () => {
    runResult.assertFileContent('gradle/libs.versions.toml', 'version-name = "version"');
  });

  it('Assert buildSrc/gradle/libs.versions.toml has the version added', () => {
    runResult.assertFileContent('buildSrc/gradle/libs.versions.toml', 'version-name = "version"');
  });
});
