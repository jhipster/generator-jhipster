package <%=packageName%>.domain;

import <%=packageName%>.config.Constants;
<% if (databaseType == 'cassandra') { %>
import java.util.Date;
import com.datastax.driver.mapping.annotations.*;<% } %>
import com.fasterxml.jackson.annotation.JsonIgnore;<% if (hibernateCache != 'no' && databaseType == 'sql') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %>
import org.hibernate.validator.constraints.Email;
<% if (searchEngine == 'elasticsearch') { %>
import org.springframework.data.elasticsearch.annotations.Document;<% } %><% if (databaseType == 'mongodb') { %>

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
<% } %><% if (databaseType == 'sql') { %>
import javax.persistence.*;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import java.time.ZonedDateTime;<% } %>

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
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    @Id
    private String id;<% } %><% if (databaseType == 'cassandra') { %>
    @PartitionKey
    private String id;<% } %>

    <%_ var columnMax = 50;
        if (enableSocialSignIn) {
            columnMax = 100;
        } _%>
    @NotNull
    @Pattern(regexp = Constants.LOGIN_REGEX)
    @Size(min = 1, max = <%=columnMax %>)<% if (databaseType == 'sql') { %>
    @Column(length = <%=columnMax %>, unique = true, nullable = false)<% } %>
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
    @Size(max = 100)<% if (databaseType == 'sql') { %>
    @Column(length = 100, unique = true)<% } %>
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
    private String resetKey;<%if (databaseType == 'sql') {%>

    @Column(name = "reset_date", nullable = true)
    private ZonedDateTime resetDate = null;<% }%><%if (databaseType == 'mongodb') {%>

    @Field("reset_date")
    private ZonedDateTime resetDate = null;<% }%><% if (databaseType == 'cassandra') { %>

    @Column(name = "reset_date")
    private Date resetDate;<% }%>

    @JsonIgnore<% if (databaseType == 'sql') { %>
    @ManyToMany
    @JoinTable(
        name = "jhi_user_authority",
        joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")},
        inverseJoinColumns = {@JoinColumn(name = "authority_name", referencedColumnName = "name")})<% if (hibernateCache != 'no') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
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
    }<% if (databaseType == 'sql' || databaseType == 'mongodb') {%>

    public ZonedDateTime getResetDate() {
       return resetDate;
    }

    public void setResetDate(ZonedDateTime resetDate) {
       this.resetDate = resetDate;
    }<% }%><% if (databaseType == 'cassandra') { %>

    public Date getResetDate() {
        return resetDate;
    }

    public void setResetDate(Date resetDate) {
        this.resetDate = resetDate;
    }<% }%>

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

        if (!login.equals(user.login)) {
            return false;
        }

        return true;
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
            ", email='" + email + '\'' +
            ", activated='" + activated + '\'' +
            ", langKey='" + langKey + '\'' +
            ", activationKey='" + activationKey + '\'' +
            "}";
    }
}
