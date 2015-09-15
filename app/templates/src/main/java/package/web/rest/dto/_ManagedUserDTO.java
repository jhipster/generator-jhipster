package <%=packageName%>.web.rest.dto;

import org.joda.time.DateTime;

import <%=packageName%>.domain.User;

public class ManagedUserDTO extends UserDTO {

    private Long id;

    private DateTime createdDate;

    private String lastModifiedBy;

    private DateTime lastModifiedDate;

    public ManagedUserDTO() {
    }

    public ManagedUserDTO(User user) {
        super(user);
        this.id = user.getId();
        this.createdDate = user.getCreatedDate();
        this.lastModifiedBy = user.getLastModifiedBy();
        this.lastModifiedDate = user.getLastModifiedDate();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(DateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public DateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(DateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    @Override
    public String toString() {
        return "ManagedUserDTO{" +
            "id=" + id +
            ", createdDate=" + createdDate +
            ", lastModifiedBy='" + lastModifiedBy + '\'' +
            ", lastModifiedDate=" + lastModifiedDate +
            "} " + super.toString();
    }
}
