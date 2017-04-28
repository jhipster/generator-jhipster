<%#
 Copyright 2013-2017 the original author or authors.

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
package <%=packageName%>.web.rest.vm;

import <%=packageName%>.service.dto.UserDTO;
import javax.validation.constraints.Size;

<%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
import java.time.Instant;
<%_ } _%>
import java.util.Set;

/**
 * View Model extending the UserDTO, which is meant to be used in the user management UI.
 */
public class ManagedUserVM extends UserDTO {

    public static final int PASSWORD_MIN_LENGTH = 4;

    public static final int PASSWORD_MAX_LENGTH = 100;

    @Size(min = PASSWORD_MIN_LENGTH, max = PASSWORD_MAX_LENGTH)
    private String password;

    public ManagedUserVM() {
        // Empty constructor needed for Jackson.
    }

    public ManagedUserVM(<% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id, String login, String password, String firstName, String lastName,
                         String email, boolean activated<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>, String imageUrl<% } %>, String langKey,
                         <% if (databaseType == 'mongodb' || databaseType == 'sql') { %>String createdBy, Instant createdDate, String lastModifiedBy, Instant lastModifiedDate,
                        <% } %>Set<String> authorities) {

        super(id, login, firstName, lastName, email, activated<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>, imageUrl<% } %>, langKey,
            <% if (databaseType == 'mongodb' || databaseType == 'sql') { %>createdBy, createdDate, lastModifiedBy, lastModifiedDate,  <% } %>authorities);

        this.password = password;
    }

    public String getPassword() {
        return password;
    }

    @Override
    public String toString() {
        return "ManagedUserVM{" +
            "} " + super.toString();
    }
}
