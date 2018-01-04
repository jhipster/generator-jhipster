<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.domain;

<%_ if (databaseType === 'cassandra') { _%>
import com.datastax.driver.mapping.annotations.*;
<%_ } _%>
import com.fasterxml.jackson.annotation.JsonIgnore;
<%_ if (enableHibernateCache) { _%>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
<%_ } _%>
import java.time.LocalDate;
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
<%_ } _%>
<%_ if (databaseType === 'couchbase') { _%>
import org.springframework.data.annotation.Id;
import org.springframework.data.couchbase.core.mapping.Document;
import org.springframework.data.couchbase.core.mapping.id.GeneratedValue;
import org.springframework.data.couchbase.core.mapping.id.IdAttribute;
import org.springframework.data.couchbase.core.mapping.id.IdPrefix;
<%_ } _%>

<%_ if (databaseType === 'sql') { _%>
import javax.persistence.*;
<%_ } _%>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;
<%_ if (databaseType === 'cassandra') { _%>
import java.util.Date;
<%_ } _%>

<%_ if (databaseType === 'couchbase') { _%>
import static <%=packageName%>.config.Constants.ID_DELIMITER;
import static org.springframework.data.couchbase.core.mapping.id.GenerationStrategy.USE_ATTRIBUTES;
<%_ } _%>

/**
 * Persistent tokens are used by Spring Security to automatically log in users.
 *
 * @see <%=packageName%>.security.PersistentTokenRememberMeServices
 */
<%_ if (databaseType === 'sql') { _%>
@Entity
@Table(name = "<%= jhiTablePrefix %>_persistent_token")
<%_ } _%>
<%_ if (enableHibernateCache) { if (cacheProvider === 'infinispan') { _%>
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
<%_ } else { _%>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
<%_ } } _%>
<%_ if (databaseType === 'mongodb') { _%>
@Document(collection = "<%= jhiTablePrefix %>_persistent_token")
<%_ } _%>
<%_ if (databaseType === 'couchbase') { _%>
@Document
<%_ } _%>
<%_ if (databaseType === 'cassandra') { _%>
@Table(name = "persistent_token")
<%_ } _%>
public class PersistentToken implements Serializable {

    private static final long serialVersionUID = 1L;

    private static final int MAX_USER_AGENT_LEN = 255;

<%_ if (databaseType === 'couchbase') { _%>
    public static final String PREFIX = "token";

    @SuppressWarnings("unused")
    @IdPrefix
    private String prefix = PREFIX;

    @Id
    @GeneratedValue(strategy = USE_ATTRIBUTES, delimiter = ID_DELIMITER)
    private String id;

    @IdAttribute
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb')  { _%>
    @Id
<%_ } _%>
<%_ if (databaseType === 'cassandra') { _%>
    @PartitionKey
<%_ } _%>
    private String series;

    @JsonIgnore
    @NotNull<% if (databaseType === 'sql') { %>
    @Column(name = "token_value", nullable = false)<% } %><% if (databaseType === 'cassandra') { %>
    @Column(name = "token_value")<% } %>
    private String tokenValue;
    <% if (databaseType === 'sql') { %>
    @Column(name = "token_date")
    private LocalDate tokenDate;<% } %><% if (databaseType === 'mongodb' || databaseType === 'couchbase') { %>
    private LocalDate tokenDate;<% } %><% if (databaseType === 'cassandra') { %>
    @Column(name = "token_date")
    private Date tokenDate;<% } %>

    //an IPV6 address max length is 39 characters
    @Size(min = 0, max = 39)<% if (databaseType === 'sql') { %>
    @Column(name = "ip_address", length = 39)<% } %><% if (databaseType === 'cassandra') { %>
    @Column(name = "ip_address")<% } %>
    private String ipAddress;

    <% if (databaseType === 'sql' || databaseType === 'cassandra') { %>@Column(name = "user_agent")<% } %>
    private String userAgent;
    <% if (databaseType === 'cassandra' || databaseType === 'couchbase') { %>
    private String login;<%_ } _%>
    <% if (databaseType === 'cassandra') { %>
    @Column(name = "user_id")
    private String userId;<% } %><% if (databaseType === 'sql' || databaseType === 'mongodb') { %>

    @JsonIgnore
    <% if (databaseType === 'sql') { %>@ManyToOne<% } %><% if (databaseType === 'mongodb') { %>
    @DBRef<% } %>
    private User user;<% } %>

    public String getSeries() {
        return series;
    }

    public void setSeries(String series) {
        this.series = series;
    }

    public String getTokenValue() {
        return tokenValue;
    }

    public void setTokenValue(String tokenValue) {
        this.tokenValue = tokenValue;
    }

    public <% if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')  { %>LocalDate<% } %><% if (databaseType === 'cassandra') { %>Date<% } %> getTokenDate() {
        return tokenDate;
    }

    public void setTokenDate(<% if (databaseType === 'sql' || databaseType === 'mongodb' || databaseType === 'couchbase')  { %>LocalDate<% } %><% if (databaseType === 'cassandra') { %>Date<% } %> tokenDate) {
        this.tokenDate = tokenDate;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        if (userAgent.length() >= MAX_USER_AGENT_LEN) {
            this.userAgent = userAgent.substring(0, MAX_USER_AGENT_LEN - 1);
        } else {
            this.userAgent = userAgent;
        }
    }<% if (databaseType === 'sql' || databaseType === 'mongodb')  { %>

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }<% } %><% if (databaseType === 'cassandra' || databaseType === 'couchbase') { %>

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }<% } %><% if (databaseType === 'cassandra') { %>

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }<% } %>

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        PersistentToken that = (PersistentToken) o;

        if (!series.equals(that.series)) {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode() {
        return series.hashCode();
    }

    @Override
    public String toString() {
        return "PersistentToken{" +
            "series='" + series + '\'' +
            ", tokenValue='" + tokenValue + '\'' +
            ", tokenDate=" + tokenDate +
            ", ipAddress='" + ipAddress + '\'' +
            ", userAgent='" + userAgent + '\'' +
            "}";
    }
}
