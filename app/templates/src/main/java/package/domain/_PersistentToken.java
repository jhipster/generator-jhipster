package <%=packageName%>.domain;
<% if (databaseType == 'cassandra') { %>
import com.datastax.driver.mapping.annotations.*;<% } %>
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;<% if (hibernateCache != 'no' && databaseType == 'sql') { %>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %>
import java.time.LocalDate;<% if (databaseType == 'cassandra') { %>
import java.time.ZonedDateTime;<% } %>
import java.time.format.DateTimeFormatter;<% if (databaseType == 'mongodb') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;<% } %>

<% if (databaseType == 'sql') { %>import javax.persistence.*;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;<% if (databaseType == 'cassandra') { %>
import java.util.Date;
import java.text.SimpleDateFormat;<% } %>

/**
 * Persistent tokens are used by Spring Security to automatically log in users.
 *
 * @see <%=packageName%>.security.CustomPersistentRememberMeServices
 */<% if (databaseType == 'sql') { %>
@Entity
@Table(name = "jhi_persistent_token")<% } %><% if (hibernateCache != 'no' && databaseType == 'sql') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'mongodb') { %>
@Document(collection = "jhi_persistent_token")<% } %><% if (databaseType == 'cassandra') { %>
@Table(name = "persistent_token")<% } %>
public class PersistentToken implements Serializable {

    <% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("d MMMM yyyy");
    <% } %>
    <% if (databaseType == 'cassandra') { %>
    private static final SimpleDateFormat DATE_TIME_FORMATTER = new SimpleDateFormat("d MMMM yyyy");
    <% } %>

    private static final int MAX_USER_AGENT_LEN = 255;
<% if (databaseType == 'sql' || databaseType == 'mongodb')  { %>
    @Id<% } %><% if (databaseType == 'cassandra') { %>
    @PartitionKey<% } %>
    private String series;

    @JsonIgnore
    @NotNull<% if (databaseType == 'sql') { %>
    @Column(name = "token_value", nullable = false)<% } %><% if (databaseType == 'cassandra') { %>
    @Column(name = "token_value")<% } %>
    private String tokenValue;

    @JsonIgnore<% if (databaseType == 'sql') { %>
    @Column(name = "token_date")
    private LocalDate tokenDate;<% } %><% if (databaseType == 'mongodb') { %>
    private LocalDate tokenDate;<% } %><% if (databaseType == 'cassandra') { %>
    @Column(name = "token_date")
    private Date tokenDate;<% } %>

    //an IPV6 address max length is 39 characters
    @Size(min = 0, max = 39)<% if (databaseType == 'sql') { %>
    @Column(name = "ip_address", length = 39)<% } %><% if (databaseType == 'cassandra') { %>
    @Column(name = "ip_address")<% } %>
    private String ipAddress;

    <% if (databaseType == 'sql' || databaseType == 'cassandra') { %>@Column(name = "user_agent")<% } %>
    private String userAgent;<% if (databaseType == 'cassandra') { %>

    private String login;

    @Column(name = "user_id")
    private String userId;<% } %><% if (databaseType == 'sql' || databaseType == 'mongodb') { %>

    @JsonIgnore
    <% if (databaseType == 'sql') { %>@ManyToOne<% } %><% if (databaseType == 'mongodb') { %>
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

    public <% if (databaseType == 'sql' || databaseType == 'mongodb')  { %>LocalDate<% } %><% if (databaseType == 'cassandra') { %>Date<% } %> getTokenDate() {
        return tokenDate;
    }

    public void setTokenDate(<% if (databaseType == 'sql' || databaseType == 'mongodb')  { %>LocalDate<% } %><% if (databaseType == 'cassandra') { %>Date<% } %> tokenDate) {
        this.tokenDate = tokenDate;
    }

    @JsonGetter
    public String getFormattedTokenDate() {
        <% if (databaseType == 'sql' || databaseType == 'mongodb')  { %>return DATE_TIME_FORMATTER.format(this.tokenDate);<% } %><% if (databaseType == 'cassandra') { %>return DATE_TIME_FORMATTER.format(this.tokenDate);<% } %>
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
    }<% if (databaseType == 'sql' || databaseType == 'mongodb')  { %>

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }<% } %><% if (databaseType == 'cassandra') { %>

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

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
