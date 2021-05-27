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
 * A CategoryLabel.
 */
@Entity
@Table(name = "category_label")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class CategoryLabel implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @NotNull
    @Column(name = "description", nullable = false)
    private String description;

    @NotNull
    @Column(name = "authority_attach", nullable = false)
    private String authorityAttach;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_category_label__record",
        joinColumns = @JoinColumn(name = "category_label_id"),
        inverseJoinColumns = @JoinColumn(name = "record_id")
    )
    @JsonIgnoreProperties(value = { "channel", "categoryLabels", "searchLabels", "machineLabels" }, allowSetters = true)
    private Set<Record> records = new HashSet<>();

    @ManyToMany(mappedBy = "assignedCategories")
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

    public CategoryLabel id(Long id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return this.name;
    }

    public CategoryLabel name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public CategoryLabel description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAuthorityAttach() {
        return this.authorityAttach;
    }

    public CategoryLabel authorityAttach(String authorityAttach) {
        this.authorityAttach = authorityAttach;
        return this;
    }

    public void setAuthorityAttach(String authorityAttach) {
        this.authorityAttach = authorityAttach;
    }

    public Set<Record> getRecords() {
        return this.records;
    }

    public CategoryLabel records(Set<Record> records) {
        this.setRecords(records);
        return this;
    }

    public CategoryLabel addRecord(Record record) {
        this.records.add(record);
        record.getCategoryLabels().add(this);
        return this;
    }

    public CategoryLabel removeRecord(Record record) {
        this.records.remove(record);
        record.getCategoryLabels().remove(this);
        return this;
    }

    public void setRecords(Set<Record> records) {
        this.records = records;
    }

    public Set<UserProfile> getUserProfiles() {
        return this.userProfiles;
    }

    public CategoryLabel userProfiles(Set<UserProfile> userProfiles) {
        this.setUserProfiles(userProfiles);
        return this;
    }

    public CategoryLabel addUserProfiles(UserProfile userProfile) {
        this.userProfiles.add(userProfile);
        userProfile.getAssignedCategories().add(this);
        return this;
    }

    public CategoryLabel removeUserProfiles(UserProfile userProfile) {
        this.userProfiles.remove(userProfile);
        userProfile.getAssignedCategories().remove(this);
        return this;
    }

    public void setUserProfiles(Set<UserProfile> userProfiles) {
        if (this.userProfiles != null) {
            this.userProfiles.forEach(i -> i.removeAssignedCategories(this));
        }
        if (userProfiles != null) {
            userProfiles.forEach(i -> i.addAssignedCategories(this));
        }
        this.userProfiles = userProfiles;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CategoryLabel)) {
            return false;
        }
        return id != null && id.equals(((CategoryLabel) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CategoryLabel{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", authorityAttach='" + getAuthorityAttach() + "'" +
            "}";
    }
}
