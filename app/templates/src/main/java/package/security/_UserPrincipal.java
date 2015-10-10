package <%=packageName%>.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;

/**
 * Custom implementation of Spring UserDetails.
 * Can be used by the application to store extra information.
 */
public final class UserPrincipal extends UserDetails {

    private  String login;
    private String password;
    private List<GrantedAuthority> grantedAuthorities;
    private <% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> userId;
    private boolean activated;

    /**
     * Instantiate a Custom UserPrincipal.
     */
     public UserPrincipal(String login, List<GrantedAuthority> grantedAuthorities ,  <% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %> userId , boolean activated) {
         this.login = login;
         this.grantedAuthorities = grantedAuthorities;
         this.userId = userId;
         this.activated = activated;
     }

     public String getLogin() {
        return login;
     }

     public List<GrantedAuthority> getGrantedAuthorities() {
          return grantedAuthorities;
     }

     public  <% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>String<% } %>  getUserId() {
         return userId;
     }

     public boolean isUserInRole(String authority) {
        return authorities.contains(new SimpleGrantedAuthority(authority));
    }

    public boolean isActivated() {
      return activated;
    }
}
