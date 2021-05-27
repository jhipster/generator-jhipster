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
 * A SearchLabel.
 */
@Entity
@Table(name = "search_label")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class SearchLabel implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_search_label__records",
        joinColumns = @JoinColumn(name = "search_label_id"),
        inverseJoinColumns = @JoinColumn(name = "records_id")
    )
    @JsonIgnoreProperties(value = { "channel", "categoryLabels", "searchLabels", "machineLabels" }, allowSetters = true)
    private Set<Record> records = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(
        value = { "searchLabels", "actualNode", "assignedNodes", "assignedCategories", "machineLabels", "userGroups" },
        allowSetters = true
    )
    private UserProfile userProfile;

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public SearchLabel id(Long id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return this.name;
    }

    public SearchLabel name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public SearchLabel description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Record> getRecords() {
        return this.records;
    }

    public SearchLabel records(Set<Record> records) {
        this.setRecords(records);
        return this;
    }

    public SearchLabel addRecords(Record record) {
        this.records.add(record);
        record.getSearchLabels().add(this);
        return this;
    }

    public SearchLabel removeRecords(Record record) {
        this.records.remove(record);
        record.getSearchLabels().remove(this);
        return this;
    }

    public void setRecords(Set<Record> records) {
        this.records = records;
    }

    public UserProfile getUserProfile() {
        return this.userProfile;
    }

    public SearchLabel userProfile(UserProfile userProfile) {
        this.setUserProfile(userProfile);
        return this;
    }

    public void setUserProfile(UserProfile userProfile) {
        this.userProfile = userProfile;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SearchLabel)) {
            return false;
        }
        return id != null && id.equals(((SearchLabel) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "SearchLabel{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            "}";
    }
}
