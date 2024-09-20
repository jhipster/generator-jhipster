/**
 * Copyright 2013-2024 the original author or authors from the JHipster project.
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
import { describe, expect } from 'esmocha';
import { sortPomFile } from './pom-file-sort.js';

describe('sortPomProject', () => {
  it('should sort a pom file', () => {
    const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project>
    <artifactId>test</artifactId>
    <version>1.0</version>

    <properties>
        <test.version>1.0</test.version>
    </properties>
</project>
`;
    const sorted = sortPomFile(pomContent);
    expect(sorted).toBe(pomContent);
  });

  it('should sort build.plugins', () => {
    const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project>

    <build>
        <plugins>
            <plugin>
                <groupId>b</groupId>
                <artifactId>b</artifactId>
            </plugin>
            <plugin>
                <groupId>a</groupId>
                <artifactId>a</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`;
    const sorted = sortPomFile(pomContent);
    expect(sorted).toBe(`<?xml version="1.0" encoding="UTF-8"?>
<project>

    <build>
        <plugins>
            <plugin>
                <groupId>a</groupId>
                <artifactId>a</artifactId>
            </plugin>
            <plugin>
                <groupId>b</groupId>
                <artifactId>b</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`);
  });

  it('should not sort profiles build.plugins', () => {
    const pomContent = `<?xml version="1.0" encoding="UTF-8"?>
<project>

    <profiles>
        <profile>
            <id>dev</id>
            <build>
                <plugins>
                    <plugin>
                        <groupId>b</groupId>
                        <artifactId>b</artifactId>
                    </plugin>
                    <plugin>
                        <groupId>a</groupId>
                        <artifactId>a</artifactId>
                    </plugin>
                </plugins>
            </build>
        </profile>
    </profiles>
</project>
`;
    const sorted = sortPomFile(pomContent);
    expect(sorted).toBe(pomContent);
  });
});
