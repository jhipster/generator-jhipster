<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
package <%=packageName%>.service;

<% if (useInterface === false) { %>import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;<% if (databaseType === 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>

@Service<% if (databaseType === 'sql') { %>
@Transactional<% } %>
public class <%= serviceClass %>Service {

    private final Logger log = LoggerFactory.getLogger(<%= serviceClass %>Service.class);

}<% } else  { %>public interface <%= serviceClass %>Service {

}<% } %>
