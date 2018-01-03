<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
package <%=packageName%>.security.oauth2;

import org.springframework.boot.autoconfigure.security.oauth2.resource.PrincipalExtractor;

import java.util.Map;

public class SimplePrincipalExtractor implements PrincipalExtractor {

    private final String oauth2PrincipalAttribute;

    public SimplePrincipalExtractor(String oauth2PrincipalAttribute) {
        this.oauth2PrincipalAttribute = oauth2PrincipalAttribute;
    }

    @Override
    public Object extractPrincipal(Map<String, Object> map) {
        return map.getOrDefault(oauth2PrincipalAttribute, "unknown");
    }
}
