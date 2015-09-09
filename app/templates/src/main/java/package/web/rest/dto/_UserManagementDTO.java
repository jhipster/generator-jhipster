package <%=packageName%>.web.rest.dto;

import java.util.HashSet;
import java.util.Set;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.Email;
import org.joda.time.DateTime;
import <%=packageName%>.domain.Authority;

/**
 * DTO used for user management
 */
public class UserManagementDTO {

    private Long id;

    @Pattern(regexp = "^[a-z0-9]*$|(anonymousUser)")
    @NotNull
    @Size(min = 1, max = 50)
    private String login;

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

    private Set<Authority> authorities = new HashSet<>();

    private DateTime createdDate;
    private DateTime lastModifiedDate;

    private String password;
    private String confirmPassword;

    public UserManagementDTO() {}
    public UserManagementDTO(Long id, String login, String firstName,
            String lastName, String email, boolean activated, String langKey
            , Set<Authority> authorities, DateTime createdDate,
            DateTime lastModifiedDate) {
        super();
        this.id = id;
        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.activated = activated;
        this.langKey = langKey;
        this.authorities = authorities;
        this.createdDate = createdDate;
        this.lastModifiedDate = lastModifiedDate;
    }

    public Long getId() {
        return id;
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

    public Set<Authority> getAuthorities() {
        return authorities;
    }

    public DateTime getCreatedDate() {
        return createdDate;
    }

    public DateTime getLastModifiedDate() {
        return lastModifiedDate;
    }
    
    public void setId(Long id) {
        this.id = id;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public void setLangKey(String langKey) {
        this.langKey = langKey;
    }

    public void setAuthorities(Set<Authority> authorities) {
        this.authorities = authorities;
    }

    public void setCreatedDate(DateTime createdDate) {
        this.createdDate = createdDate;
    }

    public void setLastModifiedDate(DateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    @Override
    public String toString() {
        return "UserManagementDTO [id=" + id + ", login=" + login
                + ", firstName=" + firstName + ", lastName=" + lastName
                + ", email=" + email + ", activated=" + activated
                + ", langKey=" + langKey + ", authorities=" + authorities + ", createdDate=" + createdDate
                + ", lastModifiedDate=" + lastModifiedDate + "]";
    }

}
