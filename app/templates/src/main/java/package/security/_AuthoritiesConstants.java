package <%=packageName%>.security;

/**
 * Constants for Spring Security authorities.
 */
public final class AuthoritiesConstants {

    private AuthoritiesConstants() {
    }
<% for (idx in roles) { %>
    public static final String <%= idx.toUpperCase() %> = "<%= roles[idx] %>";
<% } %>
    public static final String ANONYMOUS = "ROLE_ANONYMOUS";
}
