/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        writeRancherCompose() {
            this.template('rancher-compose.yml.ejs', 'rancher-compose.yml');
        },

        writeDockerCompose() {
            this.template('docker-compose.yml.ejs', 'docker-compose.yml');
        },

        writeRegistrySidekickFiles() {
            if (this.serviceDiscoveryType === 'eureka' || this.serviceDiscoveryType === 'consul') {
                this.copy('registry-config-sidekick/Dockerfile', 'registry-config-sidekick/Dockerfile');
                this.template('registry-config-sidekick/application.yml.ejs', 'registry-config-sidekick/application.yml');
            }
        }
    };
}
