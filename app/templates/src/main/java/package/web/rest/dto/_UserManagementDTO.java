package <%=packageName%>.web.rest.dto;

import <%=packageName%>.domain.Authority;
import org.hibernate.validator.constraints.Email;
import org.joda.time.DateTime;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.HashSet;
import java.util.Set;

public class userManagementDTO {

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

    private String createdBy;
    private DateTime createdDate;
    private String lastModifiedBy;
    private DateTime lastModifiedDate;

    public userManagementDTO() {}
    public userManagementDTO(Long id, String login, String firstName,
            String lastName, String email, boolean activated, String langKey,
            Set<Authority> authorities, String createdBy, DateTime createdDate,
            String lastModifiedBy, DateTime lastModifiedDate) {
        super();
        this.id = id;
        this.login = login;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.activated = activated;
        this.langKey = langKey;
        this.authorities = authorities;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.lastModifiedBy = lastModifiedBy;
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

    public String getCreatedBy() {
        return createdBy;
    }

    public DateTime getCreatedDate() {
        return createdDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
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

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public void setLastModifiedDate(DateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    public void setCreatedBy(String createdBy) {

        this.createdBy = createdBy;
    }

    @Override
    public String toString() {
        return "userManagementDTO [id=" + id + ", login=" + login
                + ", firstName=" + firstName + ", lastName=" + lastName
                + ", email=" + email + ", activated=" + activated
                + ", langKey=" + langKey + ", authorities=" + authorities + ", createdBy="
                + createdBy + ", createdDate=" + createdDate
                + ", lastModifiedBy=" + lastModifiedBy + ", lastModifiedDate="
                + lastModifiedDate + "]";
    }

}
