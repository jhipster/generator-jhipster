<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
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
package <%=packageName%>.service.dto;

import <%=packageName%>.config.Constants;
<% if (databaseType === 'sql' || databaseType === 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% } %>
import <%=packageName%>.domain.User;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

import javax.validation.constraints.*;
<%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { _%>
import java.time.Instant;
<%_ } _%>
import java.util.Set;
<%_ if (databaseType === 'mongodb' || databaseType === 'sql') { _%>
import java.util.stream.Collectors;
<%_ } _%>

/**
 * A DTO representing a user, with his authorities.
 */
public class UserDTO {

    private <% if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'cassandra' || authenticationType === 'oauth2') { %>String<% } else { %>Long<% } %> id;

    @NotBlank
    @Pattern(regexp = Constants.LOGIN_REGEX)
    @Size(min = 1, max = 50)
    private String login;

    @Size(max = 50)
    private String firstName;

    @Size(max = 50)
    private String lastName;

    @Email
    @Size(min = 5, max = 254)
    private String email;
    <%_ if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { _%>

    @Size(max = 256)
    private String imageUrl;
    <%_ } _%>

    private boolean activated = false;

    @Size(min = 2, max = 6)
    private String langKey;
    <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { _%>

    private String createdBy;

    private Instant createdDate;

    private String lastModifiedBy;

    private Instant lastModifiedDate;
    <%_ } _%>

    private Set<String> authorities;

    public UserDTO() {
        // Empty constructor needed for Jackson.
    }

    public UserDTO(User user) {
        this.id = user.getId();
        this.login = user.getLogin();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.email = user.getEmail();
        this.activated = user.getActivated();
        <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { _%>
        this.imageUrl = user.getImageUrl();
        <%_ } _%>
        this.langKey = user.getLangKey();
        <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { _%>
        this.createdBy = user.getCreatedBy();
        this.createdDate = user.getCreatedDate();
        this.lastModifiedBy = user.getLastModifiedBy();
        this.lastModifiedDate = user.getLastModifiedDate();
        <%_ } _%>
        <%_ if (databaseType === 'mongodb' || databaseType === 'sql') { _%>
        this.authorities = user.getAuthorities().stream()
            .map(Authority::getName)
            .collect(Collectors.toSet());
        <%_ } else { _%>
        this.authorities = user.getAuthorities();
        <%_ } _%>
    }

    public <% if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'cassandra' || authenticationType === 'oauth2') { %>String<% } else { %>Long<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'cassandra' || authenticationType === 'oauth2') { %>String<% } else { %>Long<% } %> id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { _%>

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    <%_ } _%>

    public boolean isActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public String getLangKey() {
        return langKey;
    }

    public void setLangKey(String langKey) {
        this.langKey = langKey;
    }
    <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { _%>

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public Instant getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(Instant lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }
    <%_ } _%>

    public Set<String> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Set<String> authorities) {
        this.authorities = authorities;
    }

    @Override
    public String toString() {
        return "UserDTO{" +
            "login='" + login + '\'' +
            ", firstName='" + firstName + '\'' +
            ", lastName='" + lastName + '\'' +
            ", email='" + email + '\'' +<% if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { %>
            ", imageUrl='" + imageUrl + '\'' +<% } %>
            ", activated=" + activated +
            ", langKey='" + langKey + '\'' +<% if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { %>
            ", createdBy=" + createdBy +
            ", createdDate=" + createdDate +
            ", lastModifiedBy='" + lastModifiedBy + '\'' +
            ", lastModifiedDate=" + lastModifiedDate +<% } %>
            ", authorities=" + authorities +
            "}";
    }
}
