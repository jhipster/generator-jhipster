package de.vc.recorder.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import de.vc.recorder.domain.enumeration.MediaType;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Channel.
 */
@Entity
@Table(name = "channel")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Channel implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false)
    private MediaType mediaType;

    @NotNull
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "throw_away_allowed")
    private Boolean throwAwayAllowed;

    @Column(name = "threat_allowed")
    private Boolean threatAllowed;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_channel__nodes",
        joinColumns = @JoinColumn(name = "channel_id"),
        inverseJoinColumns = @JoinColumn(name = "nodes_id")
    )
    @JsonIgnoreProperties(value = { "parent", "channels", "userProfiles" }, allowSetters = true)
    private Set<Node> nodes = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Channel id(Long id) {
        this.id = id;
        return this;
    }

    public MediaType getMediaType() {
        return this.mediaType;
    }

    public Channel mediaType(MediaType mediaType) {
        this.mediaType = mediaType;
        return this;
    }

    public void setMediaType(MediaType mediaType) {
        this.mediaType = mediaType;
    }

    public String getName() {
        return this.name;
    }

    public Channel name(String name) {
        this.name = name;
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getThrowAwayAllowed() {
        return this.throwAwayAllowed;
    }

    public Channel throwAwayAllowed(Boolean throwAwayAllowed) {
        this.throwAwayAllowed = throwAwayAllowed;
        return this;
    }

    public void setThrowAwayAllowed(Boolean throwAwayAllowed) {
        this.throwAwayAllowed = throwAwayAllowed;
    }

    public Boolean getThreatAllowed() {
        return this.threatAllowed;
    }

    public Channel threatAllowed(Boolean threatAllowed) {
        this.threatAllowed = threatAllowed;
        return this;
    }

    public void setThreatAllowed(Boolean threatAllowed) {
        this.threatAllowed = threatAllowed;
    }

    public Set<Node> getNodes() {
        return this.nodes;
    }

    public Channel nodes(Set<Node> nodes) {
        this.setNodes(nodes);
        return this;
    }

    public Channel addNodes(Node node) {
        this.nodes.add(node);
        node.getChannels().add(this);
        return this;
    }

    public Channel removeNodes(Node node) {
        this.nodes.remove(node);
        node.getChannels().remove(this);
        return this;
    }

    public void setNodes(Set<Node> nodes) {
        this.nodes = nodes;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Channel)) {
            return false;
        }
        return id != null && id.equals(((Channel) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Channel{" +
            "id=" + getId() +
            ", mediaType='" + getMediaType() + "'" +
            ", name='" + getName() + "'" +
            ", throwAwayAllowed='" + getThrowAwayAllowed() + "'" +
            ", threatAllowed='" + getThreatAllowed() + "'" +
            "}";
    }
}
