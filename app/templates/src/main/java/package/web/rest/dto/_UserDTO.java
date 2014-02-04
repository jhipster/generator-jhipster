package <%=packageName%>.web.rest.dto;

import java.util.Map;

public class UserDTO {

    private final String login;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final Map<String, Boolean> roles;

    public UserDTO(String login, String firstName, String lastName, String email, Map<String, Boolean> roles) {
        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.roles = roles;
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

    public Map<String, Boolean> getRoles() {
        return roles;
    }
}


