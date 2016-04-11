package <%=packageName%>.web.rest.dto;
<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
import java.time.ZonedDateTime;<% } %>

import java.util.Set;

import <%=packageName%>.domain.User;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * A DTO extending the UserDTO, which is meant to be used in the user management UI.
 */
public class ManagedUserDTO extends UserDTO {

    public static final int PASSWORD_MIN_LENGTH = 4;
    public static final int PASSWORD_MAX_LENGTH = 100;

    private <% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id;<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>

    private ZonedDateTime createdDate;

    private String lastModifiedBy;

    private ZonedDateTime lastModifiedDate;<% } %>

    @NotNull
    @Size(min = PASSWORD_MIN_LENGTH, max = PASSWORD_MAX_LENGTH)
    private String password;

    public ManagedUserDTO() {
    }

    public ManagedUserDTO(User user) {
        super(user);
        this.id = user.getId();<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
        this.createdDate = user.getCreatedDate();
        this.lastModifiedBy = user.getLastModifiedBy();
        this.lastModifiedDate = user.getLastModifiedDate();<% } %>
        this.password = null;
    }

    public ManagedUserDTO(<% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id, String login, String password, String firstName, String lastName,
                          String email, boolean activated, String langKey, Set<String> authorities <% if (databaseType == 'mongodb' || databaseType == 'sql') { %>, ZonedDateTime createdDate, String lastModifiedBy, ZonedDateTime lastModifiedDate <% } %>) {
        super(login, firstName, lastName, email, activated, langKey, authorities);
        this.id = id;<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
        this.createdDate = createdDate;
        this.lastModifiedBy = lastModifiedBy;
        this.lastModifiedDate = lastModifiedDate;<% } %>
        this.password = password;
    }

    public <% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id) {
        this.id = id;
    }<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>

    public ZonedDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(ZonedDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public ZonedDateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(ZonedDateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }<% } %>

    public String getPassword() {
        return password;
    }

    @Override
    public String toString() {
        return "ManagedUserDTO{" +
            "id=" + id +<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
            ", createdDate=" + createdDate +
            ", lastModifiedBy='" + lastModifiedBy + '\'' +
            ", lastModifiedDate=" + lastModifiedDate +<% } %>
            "} " + super.toString();
    }
}
