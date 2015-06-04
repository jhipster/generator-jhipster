package <%=packageName%>.domain;
<% if (databaseType == 'cassandra') { %>
import java.util.Date;
import com.datastax.driver.mapping.annotations.*;<% } %>
import com.fasterxml.jackson.annotation.JsonIgnore;<% if (hibernateCache != 'no' && databaseType == 'sql') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %>
import org.hibernate.validator.constraints.Email;
<% if (searchEngine == 'elasticsearch') { %>
import org.springframework.data.elasticsearch.annotations.Document;<% } %><% if (databaseType == 'mongodb') { %>
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import <%=packageName%>.domain.util.CustomDateTimeDeserializer;
import <%=packageName%>.domain.util.CustomDateTimeSerializer;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
<% } %><% if (databaseType == 'sql') { %>
import javax.persistence.*;
import org.hibernate.annotations.Type;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>

import org.joda.time.DateTime;<% } %>

/**
 * A user.
 */<% if (databaseType == 'sql') { %>
@Entity
@Table(name = "JHI_USER")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'mongodb') { %>
@Document(collection = "JHI_USER")<% } %><% if (databaseType == 'cassandra') { %>
@Table(name = "user")<% } %><% if (searchEngine == 'elasticsearch') { %>
@Document(indexName="user")<% } %>
public class User<% if (databaseType == 'sql' || databaseType == 'mongodb') { %> extends AbstractAuditingEntity<% } %> implements Serializable {
<% if (databaseType == 'sql') { %>
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    @Id
    private String id;<% } %><% if (databaseType == 'cassandra') { %>
    @PartitionKey
    private String id;<% } %>

    @NotNull
    @Pattern(regexp = "^[a-z0-9]*$")
    @Size(min = 1, max = 50)<% if (databaseType == 'sql') { %>
    @Column(length = 50, unique = true, nullable = false)<% } %>
    private String login;

    @JsonIgnore
    @NotNull
    @Size(min = 60, max = 60) <% if (databaseType == 'sql') { %>
    @Column(length = 60)<% } %>
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

    @Type(type = "org.jadira.usertype.dateandtime.joda.PersistentDateTime")
    @Column(name = "reset_date", nullable = true)
    private DateTime resetDate = null;<% }%><%if (databaseType == 'mongodb') {%>

    @JsonSerialize(using = CustomDateTimeSerializer.class)
    @JsonDeserialize(using = CustomDateTimeDeserializer.class)
    @Field("reset_date")
    private DateTime resetDate = null;<% }%><% if (databaseType == 'cassandra') { %>

    @Column(name = "reset_date")
    private Date resetDate;<% }%>

    @JsonIgnore<% if (databaseType == 'sql') { %>
    @ManyToMany
    @JoinTable(
            name = "JHI_USER_AUTHORITY",
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

    public String getResetKey() {
        return resetKey;
    }

    public void setResetKey(String resetKey) {
        this.resetKey = resetKey;
    }<% if (databaseType == 'sql' || databaseType == 'mongodb') {%>

    public DateTime getResetDate() {
       return resetDate;
    }

    public void setResetDate(DateTime resetDate) {
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
