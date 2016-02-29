package <%=packageName%>.web.rest.dto;
<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
import java.time.ZonedDateTime;<% } %>

import <%=packageName%>.domain.User;

/**
 * A DTO extending the UserDTO, which is meant to be used in the user management UI.
 */
public class ManagedUserDTO extends UserDTO {

    private <% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id;<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>

    private ZonedDateTime createdDate;

    private String lastModifiedBy;

    private ZonedDateTime lastModifiedDate;<% } %>

    public ManagedUserDTO() {
    }

    public ManagedUserDTO(User user) {
        super(user);
        this.id = user.getId();<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
        this.createdDate = user.getCreatedDate();
        this.lastModifiedBy = user.getLastModifiedBy();
        this.lastModifiedDate = user.getLastModifiedDate();<% } %>
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
