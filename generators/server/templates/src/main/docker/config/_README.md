<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
# Central configuration sources details

<%_ if (serviceDiscoveryType === 'eureka') { _%>
The JHipster-Registry will use the following directories as its configuration source :
- localhost-config : when running the registry in docker with the jhipster-registry.yml docker-compose file
- docker-config : when running the registry and the app both in docker with the app.yml docker-compose file
<%_ } _%>
<%_ if (serviceDiscoveryType === 'consul') { _%>
When running the consul.yml or app.yml docker-compose files, files located in `central-server-config/`
will get automatically loaded in Consul's K/V store. Adding or editing files will trigger a reloading.
<%_ } _%>

For more info, refer to http://jhipster.github.io/microservices-architecture/#registry_app_configuration
