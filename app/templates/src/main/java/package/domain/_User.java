package <%=packageName%>.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;<% if (hibernateCache != 'no' && databaseType == 'sql') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %>
import org.hibernate.validator.constraints.Email;
<% if (databaseType == 'nosql') { %>import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
<% } %><% if (databaseType == 'sql') { %>
import javax.persistence.*;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A user.
 */
<% if (databaseType == 'sql') { %>@Entity
@Table(name = "T_USER")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'nosql') { %>
@Document(collection = "T_USER")<% } %>
public class User extends AbstractAuditingEntity implements Serializable {

    @NotNull
    @Size(min = 0, max = 50)
    @Id<% if (databaseType == 'sql') { %>
    @Column(length = 50)<% } %>
    private String login;

    @JsonIgnore
    @Size(min = 0, max = 100)<% if (databaseType == 'sql') { %>
    @Column(length = 100)<% } %>
    private String password;

    @Size(min = 0, max = 50)<% if (databaseType == 'sql') { %>
    @Column(name = "first_name", length = 50)<% } %><% if (databaseType == 'nosql') { %>
    @Field("first_name")<% } %>
    private String firstName;

    @Size(min = 0, max = 50)<% if (databaseType == 'sql') { %>
    @Column(name = "last_name", length = 50)<% } %><% if (databaseType == 'nosql') { %>
    @Field("last_name")<% } %>
    private String lastName;

    @Email
    @Size(min = 0, max = 100)<% if (databaseType == 'sql') { %>
    @Column(length = 100)<% } %>
    private String email;

    private boolean activated = false;

    @Size(min = 2, max = 5)<% if (databaseType == 'sql') { %>
    @Column(name = "lang_key", length = 5)<% } %><% if (databaseType == 'nosql') { %>
    @Field("lang_key")<% } %>
    private String langKey;

    @Size(min = 0, max = 20)<% if (databaseType == 'sql') { %>
    @Column(name = "activation_key", length = 20)<% } %><% if (databaseType == 'nosql') { %>
    @Field("activation_key")<% } %>
    private String activationKey;

    @JsonIgnore<% if (databaseType == 'sql') { %>
    @ManyToMany
    @JoinTable(
            name = "T_USER_AUTHORITY",
            joinColumns = {@JoinColumn(name = "login", referencedColumnName = "login")},
            inverseJoinColumns = {@JoinColumn(name = "name", referencedColumnName = "name")})<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<Authority> authorities = new HashSet<>();<% if (authenticationType == 'cookie') { %><% if (databaseType == 'sql') { %>

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "user")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<PersistentToken> persistentTokens = new HashSet<>();<% } %>

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
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

    public String getLangKey() {
        return langKey;
    }

    public void setLangKey(String langKey) {
        this.langKey = langKey;
    }

    public Set<Authority> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Set<Authority> authorities) {
        this.authorities = authorities;
    }<% if ((authenticationType == 'cookie') && (databaseType == 'sql')) { %>

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
                ", password='" + password + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", activated='" + activated + '\'' +
                ", langKey='" + langKey + '\'' +
                ", activationKey='" + activationKey + '\'' +
                "}";
    }
}
