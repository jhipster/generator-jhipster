package de.vc.recorder.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Record.
 */
@Entity
@Table(name = "record")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Record implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "date", nullable = false)
    private Instant date;

    @NotNull
    @Column(name = "length", nullable = false)
    private Long length;

    @Column(name = "throw_away")
    private Boolean throwAway;

    @Column(name = "threat")
    private Boolean threat;

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = { "nodes" }, allowSetters = true)
    private Channel channel;

    @ManyToMany(mappedBy = "records")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "records", "userProfiles" }, allowSetters = true)
    private Set<CategoryLabel> categoryLabels = new HashSet<>();

    @ManyToMany(mappedBy = "records")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "records", "userProfile" }, allowSetters = true)
    private Set<SearchLabel> searchLabels = new HashSet<>();

    @ManyToMany(mappedBy = "records")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "records", "userGroups", "userProfiles" }, allowSetters = true)
    private Set<MachineLabel> machineLabels = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Record id(Long id) {
        this.id = id;
        return this;
    }

    public Instant getDate() {
        return this.date;
    }

    public Record date(Instant date) {
        this.date = date;
        return this;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Long getLength() {
        return this.length;
    }

    public Record length(Long length) {
        this.length = length;
        return this;
    }

    public void setLength(Long length) {
        this.length = length;
    }

    public Boolean getThrowAway() {
        return this.throwAway;
    }

    public Record throwAway(Boolean throwAway) {
        this.throwAway = throwAway;
        return this;
    }

    public void setThrowAway(Boolean throwAway) {
        this.throwAway = throwAway;
    }

    public Boolean getThreat() {
        return this.threat;
    }

    public Record threat(Boolean threat) {
        this.threat = threat;
        return this;
    }

    public void setThreat(Boolean threat) {
        this.threat = threat;
    }

    public Channel getChannel() {
        return this.channel;
    }

    public Record channel(Channel channel) {
        this.setChannel(channel);
        return this;
    }

    public void setChannel(Channel channel) {
        this.channel = channel;
    }

    public Set<CategoryLabel> getCategoryLabels() {
        return this.categoryLabels;
    }

    public Record categoryLabels(Set<CategoryLabel> categoryLabels) {
        this.setCategoryLabels(categoryLabels);
        return this;
    }

    public Record addCategoryLabel(CategoryLabel categoryLabel) {
        this.categoryLabels.add(categoryLabel);
        categoryLabel.getRecords().add(this);
        return this;
    }

    public Record removeCategoryLabel(CategoryLabel categoryLabel) {
        this.categoryLabels.remove(categoryLabel);
        categoryLabel.getRecords().remove(this);
        return this;
    }

    public void setCategoryLabels(Set<CategoryLabel> categoryLabels) {
        if (this.categoryLabels != null) {
            this.categoryLabels.forEach(i -> i.removeRecord(this));
        }
        if (categoryLabels != null) {
            categoryLabels.forEach(i -> i.addRecord(this));
        }
        this.categoryLabels = categoryLabels;
    }

    public Set<SearchLabel> getSearchLabels() {
        return this.searchLabels;
    }

    public Record searchLabels(Set<SearchLabel> searchLabels) {
        this.setSearchLabels(searchLabels);
        return this;
    }

    public Record addSearchLabels(SearchLabel searchLabel) {
        this.searchLabels.add(searchLabel);
        searchLabel.getRecords().add(this);
        return this;
    }

    public Record removeSearchLabels(SearchLabel searchLabel) {
        this.searchLabels.remove(searchLabel);
        searchLabel.getRecords().remove(this);
        return this;
    }

    public void setSearchLabels(Set<SearchLabel> searchLabels) {
        if (this.searchLabels != null) {
            this.searchLabels.forEach(i -> i.removeRecords(this));
        }
        if (searchLabels != null) {
            searchLabels.forEach(i -> i.addRecords(this));
        }
        this.searchLabels = searchLabels;
    }

    public Set<MachineLabel> getMachineLabels() {
        return this.machineLabels;
    }

    public Record machineLabels(Set<MachineLabel> machineLabels) {
        this.setMachineLabels(machineLabels);
        return this;
    }

    public Record addMachineLabels(MachineLabel machineLabel) {
        this.machineLabels.add(machineLabel);
        machineLabel.getRecords().add(this);
        return this;
    }

    public Record removeMachineLabels(MachineLabel machineLabel) {
        this.machineLabels.remove(machineLabel);
        machineLabel.getRecords().remove(this);
        return this;
    }

    public void setMachineLabels(Set<MachineLabel> machineLabels) {
        if (this.machineLabels != null) {
            this.machineLabels.forEach(i -> i.removeRecords(this));
        }
        if (machineLabels != null) {
            machineLabels.forEach(i -> i.addRecords(this));
        }
        this.machineLabels = machineLabels;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Record)) {
            return false;
        }
        return id != null && id.equals(((Record) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Record{" +
            "id=" + getId() +
            ", date='" + getDate() + "'" +
            ", length=" + getLength() +
            ", throwAway='" + getThrowAway() + "'" +
            ", threat='" + getThreat() + "'" +
            "}";
    }
}
