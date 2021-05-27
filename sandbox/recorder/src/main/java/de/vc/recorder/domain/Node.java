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
 * A Node.
 */
@Entity
@Table(name = "node")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Node implements Serializable {

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

    @Column(name = "time_to_live")
    private Long timeToLive;

    @ManyToOne
    @JsonIgnoreProperties(value = { "parent", "channels", "userProfiles" }, allowSetters = true)
    private Node parent;

    @ManyToMany(mappedBy = "nodes")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "nodes" }, allowSetters = true)
    private Set<Channel> channels = new HashSet<>();

    @ManyToMany(mappedBy = "assignedNodes")
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

    public Node id(Long id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return this.name;
    }

    public Node name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return this.description;
    }

    public Node description(String description) {
        this.description = description;
        return this;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getTimeToLive() {
        return this.timeToLive;
    }

    public Node timeToLive(Long timeToLive) {
        this.timeToLive = timeToLive;
        return this;
    }

    public void setTimeToLive(Long timeToLive) {
        this.timeToLive = timeToLive;
    }

    public Node getParent() {
        return this.parent;
    }

    public Node parent(Node node) {
        this.setParent(node);
        return this;
    }

    public void setParent(Node node) {
        this.parent = node;
    }

    public Set<Channel> getChannels() {
        return this.channels;
    }

    public Node channels(Set<Channel> channels) {
        this.setChannels(channels);
        return this;
    }

    public Node addChannels(Channel channel) {
        this.channels.add(channel);
        channel.getNodes().add(this);
        return this;
    }

    public Node removeChannels(Channel channel) {
        this.channels.remove(channel);
        channel.getNodes().remove(this);
        return this;
    }

    public void setChannels(Set<Channel> channels) {
        if (this.channels != null) {
            this.channels.forEach(i -> i.removeNodes(this));
        }
        if (channels != null) {
            channels.forEach(i -> i.addNodes(this));
        }
        this.channels = channels;
    }

    public Set<UserProfile> getUserProfiles() {
        return this.userProfiles;
    }

    public Node userProfiles(Set<UserProfile> userProfiles) {
        this.setUserProfiles(userProfiles);
        return this;
    }

    public Node addUserProfiles(UserProfile userProfile) {
        this.userProfiles.add(userProfile);
        userProfile.getAssignedNodes().add(this);
        return this;
    }

    public Node removeUserProfiles(UserProfile userProfile) {
        this.userProfiles.remove(userProfile);
        userProfile.getAssignedNodes().remove(this);
        return this;
    }

    public void setUserProfiles(Set<UserProfile> userProfiles) {
        if (this.userProfiles != null) {
            this.userProfiles.forEach(i -> i.removeAssignedNodes(this));
        }
        if (userProfiles != null) {
            userProfiles.forEach(i -> i.addAssignedNodes(this));
        }
        this.userProfiles = userProfiles;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Node)) {
            return false;
        }
        return id != null && id.equals(((Node) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Node{" +
            "id=" + getId() +
            ", name='" + getName() + "'" +
            ", description='" + getDescription() + "'" +
            ", timeToLive=" + getTimeToLive() +
            "}";
    }
}
