package br.com.logann.sgf.domain;

import java.io.Serializable;
import java.text.MessageFormat;
import java.util.Objects;
import java.util.UUID;<% if (databaseType == 'sql') { %>
import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;<% } %>
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.Version;

/**
 * Base abstract class for entities.
 */<% if (databaseType == 'sql') { %>
 @MappedSuperclass<% } %>
public abstract class AbstractEntity implements Serializable {

	private static final long serialVersionUID = <%= Math.floor(Math.random() * 0x10000000000000) %>L;

    @Id<% if (databaseType == 'sql') { %>
    @GeneratedValue(strategy = GenerationType.TABLE)
    private Long id;<% } %><% if (databaseType == 'nosql') { %>
    private String id;<% } %>

	@Version
	private Long version;
	<% if (databaseType == 'sql') { %>
	@Column(updatable = false, unique = true)<% } %>
	private UUID uid = UUID.randomUUID();

	public Long getId() {
		return id;
	}

	public Long getVersion() {
		return version;
	}

	public UUID getUid() {
		return uid;
	}

	@Override
	public boolean equals(Object obj) {
		return obj instanceof AbstractEntity && Objects.equals(uid, ((AbstractEntity)obj).uid);
	}
	
	@Override
	public int hashCode() {
		return uid.hashCode();
	}
	
	@Override
	public String toString() {
		return MessageFormat.format("{0} {1}", getClass().getName(), uid);
	}
}
