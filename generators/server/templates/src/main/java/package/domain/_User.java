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
package <%=packageName%>.domain;

import <%=packageName%>.config.Constants;
<% if (databaseType == 'cassandra') { %>
import com.datastax.driver.mapping.annotations.*;<% } %>
import com.fasterxml.jackson.annotation.JsonIgnore;<% if (databaseType == 'sql') { %>
import org.hibernate.annotations.BatchSize;<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %>
import org.hibernate.validator.constraints.Email;
<%_ if (searchEngine == 'elasticsearch') { _%>
import org.springframework.data.elasticsearch.annotations.Document;
<%_ } _%>
<%_ if (databaseType == 'mongodb') { _%>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
<%_ } _%>

<%_ if (databaseType == 'sql') { _%>
import javax.persistence.*;
<%_ } _%>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import java.time.Instant;

/**
 * A user.
 */<% if (databaseType == 'sql') { %>
@Entity
@Table(name = "jhi_user")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'mongodb') { %>
@Document(collection = "jhi_user")<% } %><% if (databaseType == 'cassandra') { %>
@Table(name = "user")<% } %><% if (searchEngine == 'elasticsearch') { %>
@Document(indexName = "user")<% } %>
public class User<% if (databaseType == 'sql' || databaseType == 'mongodb') { %> extends AbstractAuditingEntity<% } %> implements Serializable {

    private static final long serialVersionUID = 1L;
<% if (databaseType == 'sql') { %>
    @Id
    <%_ if (prodDatabaseType == 'mysql' || prodDatabaseType == 'mariadb') { _%>
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    <%_ }  else { _%>
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    <%_ } _%>
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    @Id
    private String id;<% } %><% if (databaseType == 'cassandra') { %>
    @PartitionKey
    private String id;<% } %>

    <%_ let columnMax = 50;
        if (enableSocialSignIn) {
            columnMax = 100;
        } _%>
    @NotNull
    @Pattern(regexp = Constants.LOGIN_REGEX)
    @Size(min = 1, max = <%=columnMax %>)<% if (databaseType == 'sql') { %>
    @Column(length = <%=columnMax %>, unique = true, nullable = false)<% } %><% if (databaseType == 'mongodb') { %>
    @Indexed<% } %>
    private String login;

    @JsonIgnore
    @NotNull
    @Size(min = 60, max = 60)<% if (databaseType == 'sql') { %>
    @Column(name = "password_hash",length = 60)<% } %>
    private String password;

    @Size(max = 50)<% if (databaseType == 'sql') { %>
    @Column(name = "first_name", length = 50)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("first_name")<% } %>
    private String firstName;

    @Size(max = 50)<% if (databaseType == 'sql') { %>
    @Column(name = "last_name", length = 50)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("last_name")<% } %>
    private String lastName;

    @Email
    @Size(min = 5, max = 100)<% if (databaseType == 'sql') { %>
    @Column(length = 100, unique = true)<% } %><% if (databaseType == 'mongodb') { %>
    @Indexed<% } %>
    private String email;
<% if (databaseType == 'sql') { %>
    @NotNull
    @Column(nullable = false)<% } %>
    private boolean activated = false;

    @Size(min = 2, max = 5)<% if (databaseType == 'sql') { %>
    @Column(name = "lang_key", length = 5)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("lang_key")<% } %><% if (databaseType == 'cassandra') { %>
    @Column(name = "lang_key")<% } %>
    private String langKey;
    <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>

    @Size(max = 256)<% if (databaseType == 'sql') { %>
    @Column(name = "image_url", length = 256)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("image_url")<% } %>
    private String imageUrl;
    <%_ } _%>

    @Size(max = 20)<% if (databaseType == 'sql') { %>
    @Column(name = "activation_key", length = 20)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("activation_key")<% } %><% if (databaseType == 'cassandra') { %>
    @Column(name = "activation_key")<% } %>
    @JsonIgnore
    private String activationKey;

    @Size(max = 20)<% if (databaseType == 'sql') { %>
    @Column(name = "reset_key", length = 20)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("reset_key")<% } %><% if (databaseType == 'cassandra') { %>
    @Column(name = "reset_key")<% } %>
    @JsonIgnore
    private String resetKey;

    <%_ if (databaseType == 'sql' || databaseType == 'cassandra') { _%>
    @Column(name = "reset_date")<% } else if (databaseType == 'mongodb') {%>
    @Field("reset_date")<% }%>
    private Instant resetDate = null;

    @JsonIgnore<% if (databaseType == 'sql') { %>
    @ManyToMany
    @JoinTable(
        name = "jhi_user_authority",
        joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")},
        inverseJoinColumns = {@JoinColumn(name = "authority_name", referencedColumnName = "name")})<% if (hibernateCache != 'no') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'sql') { %>
    @BatchSize(size = 20)<% } %><% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
    private Set<Authority> authorities = new HashSet<>();<% } %><% if (databaseType == 'cassandra') { %>
    private Set<String> authorities = new HashSet<>();<% } %><% if (authenticationType == 'session' && databaseType == 'sql') { %>

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "user")<% if (hibernateCache != 'no') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<PersistentToken> persistentTokens = new HashSet<>();<% } %>

    public <% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    //Lowercase the login before saving it in database
    public void setLogin(String login) {
        this.login = login.toLowerCase(Locale.ENGLISH);
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
    <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    <%_ } _%>

    public boolean getActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public String getActivationKey() {
        return activationKey;
    }

    public void setActivationKey(String activationKey) {
        this.activationKey = activationKey;
    }

    public String getResetKey() {
        return resetKey;
    }

    public void setResetKey(String resetKey) {
        this.resetKey = resetKey;
    }

    public Instant getResetDate() {
       return resetDate;
    }

    public void setResetDate(Instant resetDate) {
       this.resetDate = resetDate;
    }
    public String getLangKey() {
        return langKey;
    }

    public void setLangKey(String langKey) {
        this.langKey = langKey;
    }

    public Set<<% if (databaseType == 'sql' || databaseType == 'mongodb')  { %>Authority<% } %><% if (databaseType == 'cassandra') { %>String<% } %>> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Set<<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>Authority<% } %><% if (databaseType == 'cassandra') { %>String<% } %>> authorities) {
        this.authorities = authorities;
    }<% if ((authenticationType == 'session') && (databaseType == 'sql')) { %>

    public Set<PersistentToken> getPersistentTokens() {
        return persistentTokens;
    }

    public void setPersistentTokens(Set<PersistentToken> persistentTokens) {
        this.persistentTokens = persistentTokens;
    }<% } %>

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        User user = (User) o;

        return login.equals(user.login);
    }

    @Override
    public int hashCode() {
        return login.hashCode();
    }

    @Override
    public String toString() {
        return "User{" +
            "login='" + login + '\'' +
            ", firstName='" + firstName + '\'' +
            ", lastName='" + lastName + '\'' +
            ", email='" + email + '\'' +<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
            ", imageUrl='" + imageUrl + '\'' +<% } %>
            ", activated='" + activated + '\'' +
            ", langKey='" + langKey + '\'' +
            ", activationKey='" + activationKey + '\'' +
            "}";
    }
}
