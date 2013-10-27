package <%=packageName%>.security;

/**
 * Constants for Spring Security authorities.
 */
public class AuthoritiesConstants {

    private AuthoritiesConstants() {
    }

    public static final String ADMIN = "ROLE_ADMIN";

    public static final String USER = "ROLE_USER";
}
