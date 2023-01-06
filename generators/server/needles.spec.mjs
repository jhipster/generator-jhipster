/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { jestExpect as expect } from 'mocha-expect-snapshot';
import { basename, dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { defaultHelpers as helpers } from '../../test/support/helpers.mjs';
import { insertContentIntoApplicationProperties } from './needles.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatorPath = join(__dirname, 'index.mjs');
const generator = basename(__dirname);

describe(`generator - ${generator} - needles`, () => {
  describe('generated project', () => {
    let runResult;
    before(async () => {
      runResult = await helpers.run(generatorPath).withMockedGenerators(['jhipster:common', 'jhipster:languages']);
    });

    it('should match state snapshot', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });

    describe('insertContentIntoApplicationProperties needle', () => {
      it('with a non existing needle', () => {
        const application = runResult.generator.sharedData.getApplication();
        expect(() => insertContentIntoApplicationProperties(runResult.generator, application, { foo: 'foo' })).toThrow(
          /Missing required jhipster-needle application-properties-foo not found at/
        );
      });

      it('without a needle', () => {
        const application = runResult.generator.sharedData.getApplication();
        expect(() => insertContentIntoApplicationProperties(runResult.generator, application, {})).toThrow(/At least 1 needle is required/);
      });

      describe('when applied', () => {
        const fileRegexp = /config\/ApplicationProperties.java/;
        const property = 'private Foo foo;';
        const propertyGetter = `
    private Foo getFoo() {
        return foo;
    };`;
        const propertyClass = `
        public static Foo{} {
            private String bar;

            public String getBar() {
              return bar;
            }
        };`;
        let snapshot;

        before(() => {
          const application = runResult.generator.sharedData.getApplication();
          insertContentIntoApplicationProperties(runResult.generator, application, {
            property,
            propertyGetter,
            propertyClass,
          });
          snapshot = runResult.getSnapshot(file => fileRegexp.test(file.path));
        });

        it('should match snapshot', () => {
          expect(snapshot).toMatchInlineSnapshot(`
{
  "src/main/java/com/mycompany/myapp/config/ApplicationProperties.java": {
    "contents": "package com.mycompany.myapp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to JHipster.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {
    private Foo foo;
    // jhipster-needle-application-properties-property

    private Foo getFoo() {
        return foo;
    };
    // jhipster-needle-application-properties-property-getter

    public static Foo{} {
        private String bar;

        public String getBar() {
          return bar;
        }
    };
    // jhipster-needle-application-properties-property-class
}
",
    "state": "modified",
    "stateCleared": "modified",
  },
}
`);
        });

        it('should not be add the content at second call', () => {
          const application = runResult.generator.sharedData.getApplication();
          insertContentIntoApplicationProperties(runResult.generator, application, {
            property,
            propertyGetter,
            propertyClass,
          });
          expect(runResult.getSnapshot(file => fileRegexp.test(file.path))).toEqual(snapshot);
        });

        it('should not be add new content with prettier differences', () => {
          const application = runResult.generator.sharedData.getApplication();
          insertContentIntoApplicationProperties(runResult.generator, application, {
            property: '  private   Foo   foo;',
          });
          expect(runResult.getSnapshot(file => fileRegexp.test(file.path))).toEqual(snapshot);
        });

        it('should not be add new content with prettier differences and new lines', () => {
          const application = runResult.generator.sharedData.getApplication();
          insertContentIntoApplicationProperties(runResult.generator, application, {
            property: `  private Foo getFoo() {

        return foo;

    };
`,
          });
          expect(runResult.getSnapshot(file => fileRegexp.test(file.path))).toEqual(snapshot);
        });
      });
    });
  });
});
