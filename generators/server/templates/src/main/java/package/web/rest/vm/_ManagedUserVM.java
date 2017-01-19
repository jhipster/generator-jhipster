package <%=packageName%>.web.rest.vm;

import <%=packageName%>.service.dto.UserDTO;
import javax.validation.constraints.Size;

<%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
import java.time.ZonedDateTime;
<%_ } _%>
import java.util.Set;

/**
 * View Model extending the UserDTO, which is meant to be used in the user management UI.
 */
public class ManagedUserVM extends UserDTO {

    public static final int PASSWORD_MIN_LENGTH = 4;

    public static final int PASSWORD_MAX_LENGTH = 100;

    @Size(min = PASSWORD_MIN_LENGTH, max = PASSWORD_MAX_LENGTH)
    private String password;

    public ManagedUserVM() {
        // Empty constructor needed for Jackson.
    }

    public ManagedUserVM(<% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id, String login, String password, String firstName, String lastName,
                         String email, boolean activated<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>, String imageUrl<% } %>, String langKey,
                         <% if (databaseType == 'mongodb' || databaseType == 'sql') { %>String createdBy, ZonedDateTime createdDate, String lastModifiedBy, ZonedDateTime lastModifiedDate,
                        <% } %>Set<String> authorities) {

        super(id, login, firstName, lastName, email, activated<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>,  imageUrl<% } %>, langKey,
            <% if (databaseType == 'mongodb' || databaseType == 'sql') { %>createdBy, createdDate, lastModifiedBy, lastModifiedDate,  <% } %>authorities);

        this.password = password;
    }

    public String getPassword() {
        return password;
    }

    @Override
    public String toString() {
        return "ManagedUserVM{" +
            "} " + super.toString();
    }
}
