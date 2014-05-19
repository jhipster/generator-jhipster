package <%=packageName%>.domain<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>;

import com.fasterxml.jackson.annotation.JsonIgnore;<% if (hibernateCache != 'no' && prodDatabaseType != 'none') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %>
import org.hibernate.validator.constraints.Email;
<% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
<% } %><% if (prodDatabaseType != 'none') { %>
import javax.persistence.*;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.Set;

/**
 * A user.
 */
<% if (prodDatabaseType != 'none') { %>@Entity
@Table(name = "T_USER")<% } %><% if (hibernateCache != 'no' && prodDatabaseType != 'none') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
@Document(collection = "T_USER")<% } %>
public class User implements Serializable {

    @NotNull
    @Size(min = 0, max = 50)<% if(prodDatabaseType != 'none' || nosqlDatabaseType != 'none') { %>
    @Id<% } %>
    private String login;

    @JsonIgnore
    @Size(min = 0, max = 100)
    private String password;

    @Size(min = 0, max = 50)<% if (prodDatabaseType != 'none') { %>
    @Column(name = "first_name")<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
    @Field("first_name")<% } %>
    private String firstName;

    @Size(min = 0, max = 50)<% if (prodDatabaseType != 'none') { %>
    @Column(name = "last_name")<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
    @Field("last_name")<% } %>
    private String lastName;

    @Email
    @Size(min = 0, max = 100)
    private String email;

    @JsonIgnore<% if (prodDatabaseType != 'none') { %>
    @ManyToMany
    @JoinTable(
            name = "T_USER_AUTHORITY",
            joinColumns = {@JoinColumn(name = "login", referencedColumnName = "login")},
            inverseJoinColumns = {@JoinColumn(name = "name", referencedColumnName = "name")})<% } %><% if (hibernateCache != 'no' && prodDatabaseType != 'none') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<Authority> authorities;

    <% if (prodDatabaseType != 'none') { %>@JsonIgnore
    @OneToMany(mappedBy = "user")<% } %><% if (hibernateCache != 'no' && prodDatabaseType != 'none') { %>
    @Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %>
    private Set<PersistentToken> persistentTokens;

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

    public Set<Authority> getAuthorities() {
        return authorities;
    }

    public void setAuthorities(Set<Authority> authorities) {
        this.authorities = authorities;
    }
    <% if (prodDatabaseType != 'none') { %>
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
                "}";
    }
}
