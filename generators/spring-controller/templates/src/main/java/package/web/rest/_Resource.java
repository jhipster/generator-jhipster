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
package <%=packageName%>.web.rest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
<%_ if (mappingImports.length > 2) { _%>
import org.springframework.web.bind.annotation.*;
<%_ } else { _%>
<%_ for(let idx in mappingImports) { _%>
import <%= mappingImports[idx] %>;
<%_ } _%>
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
<%_ } _%>

/**
 * <%= controllerClass %> controller
 */
@RestController
@RequestMapping("/api/<%= apiPrefix %>")
public class <%= controllerClass %>Resource {

    private final Logger log = LoggerFactory.getLogger(<%= controllerClass %>Resource.class);

    <%_ for(let idx in controllerActions) { _%>
    /**
    * <%= controllerActions[idx].actionMethod.toUpperCase() %> <%= controllerActions[idx].actionName %>
    */
    @<%= controllerActions[idx].actionMethod %>Mapping("/<%= (controllerActions[idx].actionPath) %>")
    public String <%= controllerActions[idx].actionName %>() {
        return "<%= controllerActions[idx].actionName %>";
    }

    <%_ } _%>
}
