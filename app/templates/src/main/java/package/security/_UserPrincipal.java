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
 * Custom implementation of Spring UserDetails
 */
public final class UserPrincipal extends UserDetails {

    private String login;
    private String password;
    private List<GrantedAuthority> grantedAuthorities;
    private String userId;

    /**
     * Instantiate a Custom UserPrincipal
     */
     public UserPrincipal(String login, String password, List<GrantedAuthority> grantedAuthorities , String userId) {
         this.login = login;
         this.password = password;
         this.grantedAuthorities = grantedAuthorities;
         this.userId = userId;
     }

     public String getLogin() {
        return login;
     }

     public String getPassword() {
       return password;
     }

     public List<GrantedAuthority> getGrantedAuthorities() {
          return grantedAuthorities;
     }

     public String getUserId() {
         return userId;
     }


}
