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
 * A UserProfile.
 */
@Entity
@Table(name = "user_profile")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class UserProfile implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Column(name = "principal", nullable = false, unique = true)
    private String principal;

    @OneToMany(mappedBy = "userProfile")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "records", "userProfile" }, allowSetters = true)
    private Set<SearchLabel> searchLabels = new HashSet<>();

    @ManyToOne
    @JsonIgnoreProperties(value = { "parent", "channels", "userProfiles" }, allowSetters = true)
    private Node actualNode;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_user_profile__assigned_nodes",
        joinColumns = @JoinColumn(name = "user_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "assigned_nodes_id")
    )
    @JsonIgnoreProperties(value = { "parent", "channels", "userProfiles" }, allowSetters = true)
    private Set<Node> assignedNodes = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_user_profile__assigned_categories",
        joinColumns = @JoinColumn(name = "user_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "assigned_categories_id")
    )
    @JsonIgnoreProperties(value = { "records", "userProfiles" }, allowSetters = true)
    private Set<CategoryLabel> assignedCategories = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_user_profile__machine_label",
        joinColumns = @JoinColumn(name = "user_profile_id"),
        inverseJoinColumns = @JoinColumn(name = "machine_label_id")
    )
    @JsonIgnoreProperties(value = { "records", "userGroups", "userProfiles" }, allowSetters = true)
    private Set<MachineLabel> machineLabels = new HashSet<>();

    @ManyToMany(mappedBy = "userProfiles")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "userProfiles", "machineLabels" }, allowSetters = true)
    private Set<UserGroup> userGroups = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserProfile id(Long id) {
        this.id = id;
        return this;
    }

    public String getPrincipal() {
        return this.principal;
    }

    public UserProfile principal(String principal) {
        this.principal = principal;
        return this;
    }

    public void setPrincipal(String principal) {
        this.principal = principal;
    }

    public Set<SearchLabel> getSearchLabels() {
        return this.searchLabels;
    }

    public UserProfile searchLabels(Set<SearchLabel> searchLabels) {
        this.setSearchLabels(searchLabels);
        return this;
    }

    public UserProfile addSearchLabels(SearchLabel searchLabel) {
        this.searchLabels.add(searchLabel);
        searchLabel.setUserProfile(this);
        return this;
    }

    public UserProfile removeSearchLabels(SearchLabel searchLabel) {
        this.searchLabels.remove(searchLabel);
        searchLabel.setUserProfile(null);
        return this;
    }

    public void setSearchLabels(Set<SearchLabel> searchLabels) {
        if (this.searchLabels != null) {
            this.searchLabels.forEach(i -> i.setUserProfile(null));
        }
        if (searchLabels != null) {
            searchLabels.forEach(i -> i.setUserProfile(this));
        }
        this.searchLabels = searchLabels;
    }

    public Node getActualNode() {
        return this.actualNode;
    }

    public UserProfile actualNode(Node node) {
        this.setActualNode(node);
        return this;
    }

    public void setActualNode(Node node) {
        this.actualNode = node;
    }

    public Set<Node> getAssignedNodes() {
        return this.assignedNodes;
    }

    public UserProfile assignedNodes(Set<Node> nodes) {
        this.setAssignedNodes(nodes);
        return this;
    }

    public UserProfile addAssignedNodes(Node node) {
        this.assignedNodes.add(node);
        node.getUserProfiles().add(this);
        return this;
    }

    public UserProfile removeAssignedNodes(Node node) {
        this.assignedNodes.remove(node);
        node.getUserProfiles().remove(this);
        return this;
    }

    public void setAssignedNodes(Set<Node> nodes) {
        this.assignedNodes = nodes;
    }

    public Set<CategoryLabel> getAssignedCategories() {
        return this.assignedCategories;
    }

    public UserProfile assignedCategories(Set<CategoryLabel> categoryLabels) {
        this.setAssignedCategories(categoryLabels);
        return this;
    }

    public UserProfile addAssignedCategories(CategoryLabel categoryLabel) {
        this.assignedCategories.add(categoryLabel);
        categoryLabel.getUserProfiles().add(this);
        return this;
    }

    public UserProfile removeAssignedCategories(CategoryLabel categoryLabel) {
        this.assignedCategories.remove(categoryLabel);
        categoryLabel.getUserProfiles().remove(this);
        return this;
    }

    public void setAssignedCategories(Set<CategoryLabel> categoryLabels) {
        this.assignedCategories = categoryLabels;
    }

    public Set<MachineLabel> getMachineLabels() {
        return this.machineLabels;
    }

    public UserProfile machineLabels(Set<MachineLabel> machineLabels) {
        this.setMachineLabels(machineLabels);
        return this;
    }

    public UserProfile addMachineLabel(MachineLabel machineLabel) {
        this.machineLabels.add(machineLabel);
        machineLabel.getUserProfiles().add(this);
        return this;
    }

    public UserProfile removeMachineLabel(MachineLabel machineLabel) {
        this.machineLabels.remove(machineLabel);
        machineLabel.getUserProfiles().remove(this);
        return this;
    }

    public void setMachineLabels(Set<MachineLabel> machineLabels) {
        this.machineLabels = machineLabels;
    }

    public Set<UserGroup> getUserGroups() {
        return this.userGroups;
    }

    public UserProfile userGroups(Set<UserGroup> userGroups) {
        this.setUserGroups(userGroups);
        return this;
    }

    public UserProfile addUserGroups(UserGroup userGroup) {
        this.userGroups.add(userGroup);
        userGroup.getUserProfiles().add(this);
        return this;
    }

    public UserProfile removeUserGroups(UserGroup userGroup) {
        this.userGroups.remove(userGroup);
        userGroup.getUserProfiles().remove(this);
        return this;
    }

    public void setUserGroups(Set<UserGroup> userGroups) {
        if (this.userGroups != null) {
            this.userGroups.forEach(i -> i.removeUserProfile(this));
        }
        if (userGroups != null) {
            userGroups.forEach(i -> i.addUserProfile(this));
        }
        this.userGroups = userGroups;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UserProfile)) {
            return false;
        }
        return id != null && id.equals(((UserProfile) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UserProfile{" +
            "id=" + getId() +
            ", principal='" + getPrincipal() + "'" +
            "}";
    }
}
