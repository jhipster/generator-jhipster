import { before, describe, it } from 'esmocha';
import { defaultHelpers as helpers, result as runResult } from '../../lib/testing/index.ts';
import { GeneratorBaseApplication } from '../index.ts';
import { GENERATOR_SERVER } from '../generator-list.ts';

class mockBlueprintSubGen extends GeneratorBaseApplication {
  constructor(args, opts, features) {
    super(args, opts, features);

    this.sbsBlueprint = true;
  }

  get [GeneratorBaseApplication.POST_WRITING]() {
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

        source.addGradleDependencyCatalogLibraries?.([
          { libraryName: 'library-foo1', module: 'group-foo1:artifact-foo1', version: 'version1' },
          { libraryName: 'library-foo2', module: 'group-foo2:artifact-foo2', version: 'version2', scope: 'implementation' },
          { libraryName: 'library-foo3', module: 'group-foo3:artifact-foo3', version: 'version3', scope: 'implementation platform' },
          { libraryName: 'library-foo4', library: 'group-foo4:artifact-foo4:version4', scope: 'implementation' },
          { libraryName: 'library-foo5', group: 'group-foo5', name: 'artifact-foo5', version: 'version5', scope: 'implementation' },
        ]);
        source.addGradleDependencyCatalogPlugins?.([
          { pluginName: 'plugin-foo1', id: 'group-foo1:plugin-foo1', version: 'version1' },
          { pluginName: 'plugin-foo2', id: 'group-foo2:plugin-foo2', version: 'version2', addToBuild: true },
          { pluginName: 'plugin-foo3', plugin: 'group-foo3:plugin-foo3:version3', addToBuild: true },
        ]);
      },
    });
  }
}

describe('needle API server gradle: JHipster server generator with blueprint', () => {
  before(async () => {
    await helpers
      .runJHipster(GENERATOR_SERVER)
      .withJHipsterConfig({
        clientFramework: 'no',
        buildTool: 'gradle',
      })
      .withOptions({
        blueprint: ['myblueprint'],
      })
      .withGenerators([[mockBlueprintSubGen, { namespace: 'jhipster-myblueprint:server' }]]);
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

  it('Assert gradle/libs.versions.toml has the library added', () => {
    runResult.assertFileContent(
      'gradle/libs.versions.toml',
      'library-foo1 = { module = "group-foo1:artifact-foo1", version = "version1" }',
    );
    runResult.assertFileContent(
      'gradle/libs.versions.toml',
      'library-foo2 = { module = "group-foo2:artifact-foo2", version = "version2" }',
    );
    runResult.assertFileContent(
      'gradle/libs.versions.toml',
      'library-foo3 = { module = "group-foo3:artifact-foo3", version = "version3" }',
    );
    runResult.assertFileContent('gradle/libs.versions.toml', 'library-foo4 = "group-foo4:artifact-foo4:version4"');
    runResult.assertFileContent(
      'gradle/libs.versions.toml',
      'library-foo5 = { group = "group-foo5", name = "artifact-foo5", version = "version5" }',
    );

    runResult.assertFileContent('build.gradle', 'implementation libs.library.foo2');
    runResult.assertFileContent('build.gradle', 'implementation platform(libs.library.foo3)');
    runResult.assertFileContent('build.gradle', 'implementation libs.library.foo4');
    runResult.assertFileContent('build.gradle', 'implementation libs.library.foo5');
  });

  it('Assert gradle/libs.versions.toml has the plugin added', () => {
    runResult.assertFileContent('gradle/libs.versions.toml', 'plugin-foo1 = { id = "group-foo1:plugin-foo1", version = "version1" }');
    runResult.assertFileContent('gradle/libs.versions.toml', 'plugin-foo2 = { id = "group-foo2:plugin-foo2", version = "version2" }');
    runResult.assertFileContent('gradle/libs.versions.toml', 'plugin-foo3 = "group-foo3:plugin-foo3:version3"');

    runResult.assertFileContent('build.gradle', 'alias(libs.plugins.plugin.foo2)');
    runResult.assertFileContent('build.gradle', 'alias(libs.plugins.plugin.foo3)');
  });
});
