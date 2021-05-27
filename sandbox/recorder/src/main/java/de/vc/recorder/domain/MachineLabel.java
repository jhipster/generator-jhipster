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
 * A MachineLabel.
 */
@Entity
@Table(name = "machine_label")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class MachineLabel implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "value")
    private String value;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_machine_label__records",
        joinColumns = @JoinColumn(name = "machine_label_id"),
        inverseJoinColumns = @JoinColumn(name = "records_id")
    )
    @JsonIgnoreProperties(value = { "channel", "categoryLabels", "searchLabels", "machineLabels" }, allowSetters = true)
    private Set<Record> records = new HashSet<>();

    @ManyToMany(mappedBy = "machineLabels")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "userProfiles", "machineLabels" }, allowSetters = true)
    private Set<UserGroup> userGroups = new HashSet<>();

    @ManyToMany(mappedBy = "machineLabels")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(
        value = { "searchLabels", "actualNode", "assignedNodes", "assignedCategories", "machineLabels", "userGroups" },
        allowSetters = true
    )
    private Set<UserProfile> userProfiles = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MachineLabel id(Long id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return this.name;
    }

    public MachineLabel name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return this.value;
    }

    public MachineLabel value(String value) {
        this.value = value;
        return this;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Set<Record> getRecords() {
        return this.records;
    }

    public MachineLabel records(Set<Record> records) {
        this.setRecords(records);
        return this;
    }

    public MachineLabel addRecords(Record record) {
        this.records.add(record);
        record.getMachineLabels().add(this);
        return this;
    }

    public MachineLabel removeRecords(Record record) {
        this.records.remove(record);
        record.getMachineLabels().remove(this);
        return this;
    }

    public void setRecords(Set<Record> records) {
        this.records = records;
    }

    public Set<UserGroup> getUserGroups() {
        return this.userGroups;
    }

    public MachineLabel userGroups(Set<UserGroup> userGroups) {
        this.setUserGroups(userGroups);
        return this;
    }

    public MachineLabel addUserGroups(UserGroup userGroup) {
        this.userGroups.add(userGroup);
        userGroup.getMachineLabels().add(this);
        return this;
    }

    public MachineLabel removeUserGroups(UserGroup userGroup) {
        this.userGroups.remove(userGroup);
        userGroup.getMachineLabels().remove(this);
        return this;
    }

    public void setUserGroups(Set<UserGroup> userGroups) {
        if (this.userGroups != null) {
            this.userGroups.forEach(i -> i.removeMachineLabel(this));
        }
        if (userGroups != null) {
            userGroups.forEach(i -> i.addMachineLabel(this));
        }
        this.userGroups = userGroups;
    }

    public Set<UserProfile> getUserProfiles() {
        return this.userProfiles;
    }

    public MachineLabel userProfiles(Set<UserProfile> userProfiles) {
        this.setUserProfiles(userProfiles);
        return this;
    }

    public MachineLabel addUserProfiles(UserProfile userProfile) {
        this.userProfiles.add(userProfile);
        userProfile.getMachineLabels().add(this);
        return this;
    }

    public MachineLabel removeUserProfiles(UserProfile userProfile) {
        this.userProfiles.remove(userProfile);
        userProfile.getMachineLabels().remove(this);
        return this;
    }

    public void setUserProfiles(Set<UserProfile> userProfiles) {
        if (this.userProfiles != null) {
            this.userProfiles.forEach(i -> i.removeMachineLabel(this));
        }
        if (userProfiles != null) {
            userProfiles.forEach(i -> i.addMachineLabel(this));
        }
        this.userProfiles = userProfiles;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MachineLabel)) {
            return false;
        }
        return id != null && id.equals(((MachineLabel) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MachineLabel{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", value='" + getValue() + "'" +
            "}";
    }
}
