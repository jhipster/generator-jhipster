package <%=packageName%>.web.rest.dto;
<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
import <%=packageName%>.domain.Authority;<% } %>
import <%=packageName%>.domain.User;

import org.hibernate.validator.constraints.Email;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.Set;<% if (javaVersion == '8') { %>
import java.util.stream.Collectors;<% } else { %>
import java.util.HashSet;<% } %>

/**
 * A DTO representing a user, with his authorities.
 */
public class UserDTO {

    public static final int PASSWORD_MIN_LENGTH = 5;
    public static final int PASSWORD_MAX_LENGTH = 100;

    @Pattern(regexp = "^[a-z0-9]*$")
    @NotNull
    @Size(min = 1, max = 50)
    private String login;

    @NotNull
    @Size(min = PASSWORD_MIN_LENGTH, max = PASSWORD_MAX_LENGTH)
    private String password;

    @Size(max = 50)
    private String firstName;

    @Size(max = 50)
    private String lastName;

    @Email
    @Size(min = 5, max = 100)
    private String email;

    private boolean activated = false;

    @Size(min = 2, max = 5)
    private String langKey;

    private Set<String> authorities;

    public UserDTO() {
    }

    public UserDTO(User user) {<% if (javaVersion == '8') { %>
        this(user.getLogin(), null, user.getFirstName(), user.getLastName(),
            user.getEmail(), user.getActivated(), user.getLangKey(),<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
            user.getAuthorities().stream().map(Authority::getName)
                .collect(Collectors.toSet()));<% } else { %>
            user.getAuthorities());<% } %><% } else { %>
        this(user.getLogin(), null, user.getFirstName(), user.getLastName(),
            user.getEmail(), user.getActivated(), user.getLangKey(),
            null);
        Set<String> authorities = new HashSet<>();
        for (Authority authority : user.getAuthorities()) {
            authorities.add(authority.getName());
        }
        this.authorities = authorities;<% } %>
    }

    public UserDTO(String login, String password, String firstName, String lastName,
            String email, boolean activated, String langKey, Set<String> authorities) {

        this.login = login;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.activated = activated;
        this.langKey = langKey;
        this.authorities = authorities;
    }

    public String getPassword() {
        return password;
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

    public boolean isActivated() {
        return activated;
    }

    public String getLangKey() {
        return langKey;
    }

    public Set<String> getAuthorities() {
        return authorities;
    }

    @Override
    public String toString() {
        return "UserDTO{" +
        "login='" + login + '\'' +
        ", password='" + password + '\'' +
        ", firstName='" + firstName + '\'' +
        ", lastName='" + lastName + '\'' +
        ", email='" + email + '\'' +
        ", activated=" + activated +
        ", langKey='" + langKey + '\'' +
        ", authorities=" + authorities +
        '}';
    }
}
