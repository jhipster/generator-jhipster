package <%=packageName%>.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;<% if (hibernateCache != 'no' && databaseType == 'sql') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %>
import org.hibernate.validator.constraints.Email;
<% if (databaseType == 'mongodb') { %>import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
<% } %><% if (databaseType == 'sql') { %>
import javax.persistence.*;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * A user.
 */<% if (databaseType == 'sql') { %>
@Entity
@Table(name = "T_USER")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'mongodb') { %>
@Document(collection = "T_USER")<% } %>
public class User extends AbstractAuditingEntity implements Serializable {

    @Id<% if (databaseType == 'sql') { %>
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    private String id;<% } %>

    @NotNull
    @Pattern(regexp = "^[a-z0-9]*$")
    @Size(min = 1, max = 50)<% if (databaseType == 'sql') { %>
    @Column(length = 50, unique = true, nullable = false)<% } %>
    private String login;

    @JsonIgnore
    @NotNull
    @Size(min = 6, max = 100)<% if (databaseType == 'sql') { %>
    @Column(length = 100)<% } %>
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
    @Column(nullable = false)<% } %>
    private boolean activated = false;

    @Size(min = 2, max = 5)<% if (databaseType == 'sql') { %>
    @Column(name = "lang_key", length = 5)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("lang_key")<% } %>
    private String langKey;

    @Size(max = 20)<% if (databaseType == 'sql') { %>
    @Column(name = "activation_key", length = 20)<% } %><% if (databaseType == 'mongodb') { %>
    @Field("activation_key")<% } %>
    private String activationKey;

    @JsonIgnore<% if (databaseType == 'sql') { %>
    @ManyToMany
    @JoinTable(
            name = "T_USER_AUTHORITY",
            joinColumns = {@JoinColumn(name = "user_id", referencedColumnName = "id")},
            inverseJoinColumns = {@JoinColumn(name = "authority_name", referencedColumnName = "name")})<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<Authority> authorities = new HashSet<>();<% if (authenticationType == 'cookie') { %><% if (databaseType == 'sql') { %>

    @JsonIgnore
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "user")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<PersistentToken> persistentTokens = new HashSet<>();<% } %>

    public <% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb') { %>String<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb') { %>String<% } %> id) {
        this.id = id;
    }

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
