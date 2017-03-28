package <%=packageName%>.service.dto;

import <%=packageName%>.config.Constants;
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% } %>
import <%=packageName%>.domain.User;

import org.hibernate.validator.constraints.Email;

import javax.validation.constraints.*;
<%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
import java.time.ZonedDateTime;
<%_ } _%>
import java.util.Set;
import java.util.stream.Collectors;

/**
 * A DTO representing a user, with his authorities.
 */
public class UserDTO {

    private <% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id;

    <%_ let columnMax = 50;
        if (enableSocialSignIn) {
            columnMax = 100;
        } _%>
    @Pattern(regexp = Constants.LOGIN_REGEX)
    @Size(min = 1, max = <%=columnMax %>)
    private String login;

    @Size(max = 50)
    private String firstName;

    @Size(max = 50)
    private String lastName;

    @Email
    @Size(min = 5, max = 100)
    private String email;
    <%_ if (databaseType == 'sql' || databaseType == 'mongodb') { _%>

    @Size(max = 256)
    private String imageUrl;
    <%_ } _%>

    private boolean activated = false;

    @Size(min = 2, max = 5)
    private String langKey;
    <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>

    private String createdBy;

    private ZonedDateTime createdDate;

    private String lastModifiedBy;

    private ZonedDateTime lastModifiedDate;
    <%_ } _%>

    private Set<String> authorities;

    public UserDTO() {
        // Empty constructor needed for MapStruct.
    }

    public UserDTO(User user) {
        this(user.getId(), user.getLogin(), user.getFirstName(), user.getLastName(),
            user.getEmail(), user.getActivated(),<% if (databaseType == 'sql' || databaseType == 'mongodb') { %> user.getImageUrl(), <% } %>user.getLangKey(),<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
            user.getCreatedBy(), user.getCreatedDate(), user.getLastModifiedBy(), user.getLastModifiedDate(),
            user.getAuthorities().stream().map(Authority::getName)
                .collect(Collectors.toSet()));<% } else { %>
            user.getAuthorities());<% } %>
    }

    public UserDTO(<% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id, String login, String firstName, String lastName,
        String email, boolean activated,<% if (databaseType == 'sql' || databaseType == 'mongodb') { %> String imageUrl, <% } %>String langKey,<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
        String createdBy, ZonedDateTime createdDate, String lastModifiedBy, ZonedDateTime lastModifiedDate,
        <% } %>Set<String> authorities) {

        this.id = id;
        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.activated = activated;
        <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
        this.imageUrl = imageUrl;
        <%_ } _%>
        this.langKey = langKey;
        <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.lastModifiedBy = lastModifiedBy;
        this.lastModifiedDate = lastModifiedDate;
        <%_ } _%>
        this.authorities = authorities;
    }

    public <% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } else { %>Long<% } %> id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
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
    <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>

    public String getImageUrl() {
        return imageUrl;
    }
    <%_ } _%>

    public boolean isActivated() {
        return activated;
    }

    public String getLangKey() {
        return langKey;
    }
    <%_ if (databaseType == 'mongodb' || databaseType == 'sql') { _%>

    public String getCreatedBy() {
        return createdBy;
    }

    public ZonedDateTime getCreatedDate() {
        return createdDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public ZonedDateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(ZonedDateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }
    <%_ } _%>

    public Set<String> getAuthorities() {
        return authorities;
    }

    @Override
    public String toString() {
        return "UserDTO{" +
            "login='" + login + '\'' +
            ", firstName='" + firstName + '\'' +
            ", lastName='" + lastName + '\'' +
            ", email='" + email + '\'' +<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
            ", imageUrl='" + imageUrl + '\'' +<% } %>
            ", activated=" + activated +
            ", langKey='" + langKey + '\'' +<% if (databaseType == 'mongodb' || databaseType == 'sql') { %>
            ", createdBy=" + createdBy +
            ", createdDate=" + createdDate +
            ", lastModifiedBy='" + lastModifiedBy + '\'' +
            ", lastModifiedDate=" + lastModifiedDate +<% } %>
            ", authorities=" + authorities +
            "}";
    }
}
