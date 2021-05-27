package de.vc.recorder.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A UserGroup.
 */
@Entity
@Table(name = "user_group")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class UserGroup implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_user_group__user_profile",
        joinColumns = @JoinColumn(name = "user_group_id"),
        inverseJoinColumns = @JoinColumn(name = "user_profile_id")
    )
    @JsonIgnoreProperties(
        value = { "searchLabels", "actualNode", "assignedNodes", "assignedCategories", "machineLabels", "userGroups" },
        allowSetters = true
    )
    private Set<UserProfile> userProfiles = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_user_group__machine_label",
        joinColumns = @JoinColumn(name = "user_group_id"),
        inverseJoinColumns = @JoinColumn(name = "machine_label_id")
    )
    @JsonIgnoreProperties(value = { "records", "userGroups", "userProfiles" }, allowSetters = true)
    private Set<MachineLabel> machineLabels = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserGroup id(Long id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return this.name;
    }

    public UserGroup name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public UserGroup description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<UserProfile> getUserProfiles() {
        return this.userProfiles;
    }

    public UserGroup userProfiles(Set<UserProfile> userProfiles) {
        this.setUserProfiles(userProfiles);
        return this;
    }

    public UserGroup addUserProfile(UserProfile userProfile) {
        this.userProfiles.add(userProfile);
        userProfile.getUserGroups().add(this);
        return this;
    }

    public UserGroup removeUserProfile(UserProfile userProfile) {
        this.userProfiles.remove(userProfile);
        userProfile.getUserGroups().remove(this);
        return this;
    }

    public void setUserProfiles(Set<UserProfile> userProfiles) {
        this.userProfiles = userProfiles;
    }

    public Set<MachineLabel> getMachineLabels() {
        return this.machineLabels;
    }

    public UserGroup machineLabels(Set<MachineLabel> machineLabels) {
        this.setMachineLabels(machineLabels);
        return this;
    }

    public UserGroup addMachineLabel(MachineLabel machineLabel) {
        this.machineLabels.add(machineLabel);
        machineLabel.getUserGroups().add(this);
        return this;
    }

    public UserGroup removeMachineLabel(MachineLabel machineLabel) {
        this.machineLabels.remove(machineLabel);
        machineLabel.getUserGroups().remove(this);
        return this;
    }

    public void setMachineLabels(Set<MachineLabel> machineLabels) {
        this.machineLabels = machineLabels;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserGroup)) {
            return false;
        }
        return id != null && id.equals(((UserGroup) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserGroup{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
