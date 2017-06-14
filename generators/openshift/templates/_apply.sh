#!/usr/bin/env sh
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
# Use this script to run oc commands to create resources in the selected namespace. Files are ordered
# in proper order. 'oc process' processes the template as resources which is again piped to
# 'oc apply' to create those resources in OpenShift namespace
oc process -f <%-directoryPath%>/ocp/registry/scc-config.yml | oc apply -f -
<%_ if (serviceDiscoveryType === 'eureka') { _%>
oc process -f <%-directoryPath%>/ocp/registry/application-configmap.yml | oc apply -f -
oc process -f <%-directoryPath%>/ocp/registry/jhipster-registry.yml | oc apply -f -
<%_ } _%> <%_ if (serviceDiscoveryType === 'consul') {  _%>
oc process -f <%-directoryPath%>/ocp/registry/application-configmap.yml | oc apply -f -
oc process -f <%-directoryPath%>/ocp/registry/consul.yml | oc apply -f -
<%_ } _%> <%_ if (monitoring === 'elk') { _%>
oc process -f <%-directoryPath%>/ocp/monitoring/jhipster-monitoring.yml | oc apply -f -
<%_ } _%> <%_ if (monitoring === 'prometheus') { _%>
oc process -f <%-directoryPath%>/ocp/monitoring/jhipster-metrics.yml | oc apply -f -
<%_ } _%> <%_ for (var i = 0; i < appConfigs.length; i++) {
const appName = appConfigs[i].baseName.toLowerCase();
app = appConfigs[i];
if (app.prodDatabaseType !== 'no') { _%>
oc process -f <%-directoryPath%>/ocp/<%- appName %>/<%- appName %>-<%- app.prodDatabaseType %>.yml | oc apply -f -
<%_ } _%> <%_ if (app.searchEngine === 'elasticsearch') { _%>
oc process -f <%-directoryPath%>/ocp/<%- appName %>/<%- appName %>-elasticsearch.yml | oc apply -f -
<%_ } _%> <%_ if (app.messageBroker === 'kafka') { _%>
oc process -f <%-directoryPath%>/ocp/<%- appName %>/<%- appName %>-kafka.yml | oc apply -f -
<%_ } _%>
oc process -f <%-directoryPath%>/ocp/<%- appName %>/<%- appName %>-deployment.yml | oc apply -f -
<%_ } _%>
