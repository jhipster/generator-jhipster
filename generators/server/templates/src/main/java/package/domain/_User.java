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
package <%=packageName%>.domain;

<%_ if (authenticationType === 'oauth2' && applicationType !== 'monolith') { _%>
import java.util.Set;

public class User {

    private final String login;

    private final String firstName;

    private final String lastName;

    private final String email;

    private final String langKey;

    private final String imageUrl;

    private final boolean activated;

    private final Set<String> authorities;

    public User(String login, String firstName, String lastName, String email, String langKey,
        String imageUrl, boolean activated, Set<String> authorities) {

        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.langKey = langKey;
        this.imageUrl = imageUrl;
        this.activated = activated;
        this.authorities = authorities;
    }

    public String getLogin() {
        return login;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getLangKey() {
        return langKey;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public boolean isActivated() {
        return activated;
    }

    public Set<String> getAuthorities() {
        return authorities;
    }
}
<%_ } else { _%>
import <%=packageName%>.config.Constants;
<% if (databaseType === 'cassandra') { %>
import com.datastax.driver.mapping.annotations.*;<% } %>
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.StringUtils;<% if (databaseType === 'sql') { %>
import org.hibernate.annotations.BatchSize;<% } %><% if (enableHibernateCache) { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %>
import org.hibernate.validator.constraints.Email;
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Field;
<%_ } _%>
<%_ if (databaseType === 'couchbase') { _%>
import org.springframework.data.annotation.Id;
import com.couchbase.client.java.repository.annotation.Field;
import org.springframework.data.couchbase.core.mapping.Document;
import org.springframework.data.couchbase.core.mapping.id.GeneratedValue;
import org.springframework.data.couchbase.core.mapping.id.IdAttribute;
import org.springframework.data.couchbase.core.mapping.id.IdPrefix;
<%_ } _%>

<%_ if (databaseType === 'sql') { _%>
import javax.persistence.*;
<%_ } _%>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.time.Instant;

<%_ if (databaseType === 'couchbase') { _%>
import static <%=packageName%>.config.Constants.ID_DELIMITER;
import static org.springframework.data.couchbase.core.mapping.id.GenerationStrategy.USE_ATTRIBUTES;

<%_ } _%>
/**
 * A user.
 */<% if (databaseType === 'sql') { %>
@Entity
@Table(name = "<%= jhiTablePrefix %>_user")<% } %>
<%_ if (enableHibernateCache) { if (cacheProvider === 'infinispan') { _%>
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE) <%_ } else { _%>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE) <%_ } } _%><% if (databaseType === 'mongodb') { %>
@org.springframework.data.mongodb.core.mapping.Document(collection = "<%= jhiTablePrefix %>_user")<% } %><% if (databaseType === 'couchbase') { %>
@Document<% } %><% if (databaseType === 'cassandra') { %>
@Table(name = "user")<% } %><% if (searchEngine === 'elasticsearch') { %>
@org.springframework.data.elasticsearch.annotations.Document(indexName = "user")<% } %>
public class User<% if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase') { %> extends AbstractAuditingEntity<% } %> implements Serializable {

    private static final long serialVersionUID = 1L;
<% if (databaseType === 'sql') { %>
    @Id
    <%_ if (prodDatabaseType === 'mysql' || prodDatabaseType === 'mariadb') { _%>
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    <%_ }  else { _%>
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    <%_ } _%>
    private Long id;<% } else { %><% if (databaseType === 'couchbase') { %>
    public static final String PREFIX = "user";

    @SuppressWarnings("unused")
    @IdPrefix
    private String prefix = PREFIX;<% } %>
<% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
    @Id<% } %><% if (databaseType === 'couchbase') { %>
    @GeneratedValue(strategy = USE_ATTRIBUTES, delimiter = ID_DELIMITER)<% } %><% if (databaseType === 'cassandra') { %>
    @PartitionKey<% } %>
    private String id;<% } %>

    <%_ let columnMax = 50;
        if (enableSocialSignIn) {
            columnMax = 100;
        } _%>
    @NotNull
    @Pattern(regexp = Constants.LOGIN_REGEX)
    @Size(min = 1, max = <%=columnMax %>)<% if (databaseType === 'sql') { %>
    @Column(length = <%=columnMax %>, unique = true, nullable = false)<% } %><% if (databaseType === 'mongodb') { %>
    @Indexed<% } %><% if (databaseType === 'couchbase') { %>
    @IdAttribute<% } %>
    private String login;
<%_ if (authenticationType !== 'oauth2') { _%>

    @JsonIgnore
    @NotNull
    @Size(min = 60, max = 60)<% if (databaseType === 'sql') { %>
    @Column(name = "password_hash", length = 60)<% } %>
    private String password;
<%_ } _%>

    @Size(max = 50)<% if (databaseType === 'sql') { %>
    @Column(name = "first_name", length = 50)<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
    @Field("first_name")<% } %>
    private String firstName;

    @Size(max = 50)<% if (databaseType === 'sql') { %>
    @Column(name = "last_name", length = 50)<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
    @Field("last_name")<% } %>
    private String lastName;

    @Email
    @Size(min = 5, max = 100)<% if (databaseType === 'sql') { %>
    @Column(length = 100, unique = true)<% } %><% if (databaseType === 'mongodb') { %>
    @Indexed<% } %>
    private String email;

<%_ if (databaseType === 'sql') { _%>
    @NotNull
    @Column(nullable = false)
<%_ } _%>
    private boolean activated = false;

    @Size(min = 2, max = 6)<% if (databaseType === 'sql') { %>
    @Column(name = "lang_key", length = 6)<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
    @Field("lang_key")<% } %><% if (databaseType === 'cassandra') { %>
    @Column(name = "lang_key")<% } %>
    private String langKey;
    <%_ if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { _%>

    @Size(max = 256)<% if (databaseType === 'sql') { %>
    @Column(name = "image_url", length = 256)<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
    @Field("image_url")<% } %>
    private String imageUrl;
    <%_ } _%>
<%_ if (authenticationType !== 'oauth2') { _%>

    @Size(max = 20)<% if (databaseType === 'sql') { %>
    @Column(name = "activation_key", length = 20)<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
    @Field("activation_key")<% } %><% if (databaseType === 'cassandra') { %>
    @Column(name = "activation_key")<% } %>
    @JsonIgnore
    private String activationKey;

    @Size(max = 20)<% if (databaseType === 'sql') { %>
    @Column(name = "reset_key", length = 20)<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
    @Field("reset_key")<% } %><% if (databaseType === 'cassandra') { %>
    @Column(name = "reset_key")<% } %>
    @JsonIgnore
    private String resetKey;

    <%_ if (databaseType === 'sql' || databaseType === 'cassandra') { _%>
    @Column(name = "reset_date")
    <%_ } else if (databaseType === 'mongodb' || databaseType === 'couchbase') { _%>
    @Field("reset_date")
    <%_ } _%>
    private Instant resetDate = null;
<%_ } _%>

    @JsonIgnore<% if (databaseType === 'sql') { %>
    @ManyToMany
    @JoinTable(
        name = "<%= jhiTablePrefix %>_user_authority",
        joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")},
        inverseJoinColumns = {@JoinColumn(name = "authority_name", referencedColumnName = "name")})
    <%_ if (enableHibernateCache) { if (cacheProvider === 'infinispan') { _%>
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE) <%_ } else { _%>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE) <%_ } } _%><% if (databaseType === 'sql') { %>
    @BatchSize(size = 20)<% } %><% } %><% if (databaseType === 'sql' || databaseType === 'mongodb') { %>
    private Set<Authority> authorities = new HashSet<>();<% } %><% if (databaseType === 'cassandra' || databaseType === 'couchbase') { %>
    private Set<String> authorities = new HashSet<>();<% } %><% if (authenticationType === 'session' && databaseType === 'sql') { %>

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "user")
    <%_ if (enableHibernateCache) { if (cacheProvider === 'infinispan') { _%>
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    <%_ } else { _%>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
    <%_ } } _%>
    private Set<PersistentToken> persistentTokens = new HashSet<>();<% } %>

    public <% if (databaseType === 'sql') { %>Long<% } else { %>String<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType === 'sql') { %>Long<% } else { %>String<% } %> id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    // Lowercase the login before saving it in database
    public void setLogin(String login) {
        this.login = StringUtils.lowerCase(login, Locale.ENGLISH);
    }
<%_ if (authenticationType !== 'oauth2') { _%>

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
<%_ } _%>

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

    public boolean getActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }
<%_ if (authenticationType !== 'oauth2') { _%>

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
<%_ } _%>

    public String getLangKey() {
        return langKey;
    }

    public void setLangKey(String langKey) {
        this.langKey = langKey;
    }

    public Set<<% if (databaseType === 'sql' || databaseType === 'mongodb')  { %>Authority<% } %><% if (databaseType === 'cassandra' || databaseType === 'couchbase') { %>String<% } %>> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Set<<% if (databaseType === 'sql' || databaseType === 'mongodb') { %>Authority<% } %><% if (databaseType === 'cassandra' || databaseType === 'couchbase') { %>String<% } %>> authorities) {
        this.authorities = authorities;
    }<% if ((authenticationType === 'session') && (databaseType === 'sql')) { %>

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
        return !(user.getId() == null || getId() == null) && Objects.equals(getId(), user.getId());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

    @Override
    public String toString() {
        return "User{" +
            "login='" + login + '\'' +
            ", firstName='" + firstName + '\'' +
            ", lastName='" + lastName + '\'' +
            ", email='" + email + '\'' +<% if (databaseType === 'mongodb' || databaseType === 'couchbase' || databaseType === 'sql') { %>
            ", imageUrl='" + imageUrl + '\'' +<% } %>
            ", activated='" + activated + '\'' +
            ", langKey='" + langKey + '\'' +
            <%_ if (authenticationType !== 'oauth2') { _%>
            ", activationKey='" + activationKey + '\'' +
            <%_ } _%>
            "}";
    }
}
<%_ } _%>
