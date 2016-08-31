package <%=packageName%>.domain;

<%_ if (databaseType == 'mongodb') { _%>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
<%_ } _%>
<%_ if (databaseType == 'sql') { _%>
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import javax.persistence.*;
<%_ } _%>
import javax.validation.constraints.NotNull;
<%_ if (databaseType == 'mongodb') { _%>
import javax.validation.constraints.Size;
<%_ } _%>
import java.io.Serializable;
import java.util.Objects;

/**
 * A Social user.
 */<% if (databaseType == 'sql') { %>
@Entity
@Table(name = "jhi_social_user_connection")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% if (databaseType == 'mongodb') { %>
@Document(collection = "jhi_social_user_connection")<% } %>
public class SocialUserConnection implements Serializable {

    private static final long serialVersionUID = 1L;
<% if (databaseType == 'sql') { %>
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;<% } %><% if (databaseType == 'mongodb') { %>
    @Id
    private String id;<% } %>

    @NotNull<% if (databaseType == 'sql') { %>
    @Column(name = "user_id", length = 255, nullable = false)<% } %><% if (databaseType == 'mongodb') { %>
    @Size(max = 255)
    @Field("user_id")<% } %>
    private String userId;

    @NotNull<% if (databaseType == 'sql') { %>
    @Column(name = "provider_id", length = 255, nullable = false)<% } %><% if (databaseType == 'mongodb') { %>
    @Size(max = 255)
    @Field("provider_id")<% } %>
    private String providerId;

    @NotNull<% if (databaseType == 'sql') { %>
    @Column(name = "provider_user_id", length = 255, nullable = false)<% } %><% if (databaseType == 'mongodb') { %>
    @Size(max = 255)
    @Field("provider_user_id")<% } %>
    private String providerUserId;

    @NotNull<% if (databaseType == 'sql') { %>
    @Column(nullable = false)<% } %>
    private Long rank;
<% if (databaseType == 'sql') { %>
    @Column(name = "display_name", length = 255)<% } %><% if (databaseType == 'mongodb') { %>
    @Size(max = 255)
    @Field("display_name")<% } %>
    private String displayName;
<% if (databaseType == 'sql') { %>
    @Column(name = "profile_url", length = 255)<% } %><% if (databaseType == 'mongodb') { %>
    @Size(max = 255)
    @Field("profile_url")<% } %>
    private String profileURL;
<% if (databaseType == 'sql') { %>
    @Column(name = "image_url", length = 255)<% } %><% if (databaseType == 'mongodb') { %>
    @Size(max = 255)
    @Field("image_url")<% } %>
    private String imageURL;

    @NotNull<% if (databaseType == 'sql') { %>
    @Column(name = "access_token", length = 255, nullable = false)<% } %><% if (databaseType == 'mongodb') { %>
    @Size(max = 255)
    @Field("access_token")<% } %>
    private String accessToken;
<% if (databaseType == 'sql') { %>
    @Column(length = 255)<% } %><% if (databaseType == 'mongodb') { %>
    @Size(max = 255)<% } %>
    private String secret;
<% if (databaseType == 'sql') { %>
    @Column(name = "refresh_token", length = 255)<% } %><% if (databaseType == 'mongodb') { %>
    @Size(max = 255)
    @Field("refresh_token")<% } %>
    private String refreshToken;
<% if (databaseType == 'sql') { %>
    @Column(name = "expire_time")<% } %><% if (databaseType == 'mongodb') { %>
    @Field("expire_time")<% } %>
    private Long expireTime;

    public SocialUserConnection() {}
    public SocialUserConnection(String userId,
                                String providerId,
                                String providerUserId,
                                Long rank,
                                String displayName,
                                String profileURL,
                                String imageURL,
                                String accessToken,
                                String secret,
                                String refreshToken,
                                Long expireTime) {
        this.userId = userId;
        this.providerId = providerId;
        this.providerUserId = providerUserId;
        this.rank = rank;
        this.displayName = displayName;
        this.profileURL = profileURL;
        this.imageURL = imageURL;
        this.accessToken = accessToken;
        this.secret = secret;
        this.refreshToken = refreshToken;
        this.expireTime = expireTime;
    }

    public <% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb') { %>String<% } %> getId() {
        return id;
    }

    public void setId(<% if (databaseType == 'sql') { %>Long<% } else if (databaseType == 'mongodb') { %>String<% } %> id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProviderUserId() {
        return providerUserId;
    }

    public void setProviderUserId(String providerUserId) {
        this.providerUserId = providerUserId;
    }

    public Long getRank() {
        return rank;
    }

    public void setRank(Long rank) {
        this.rank = rank;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getProfileURL() {
        return profileURL;
    }

    public void setProfileURL(String profileURL) {
        this.profileURL = profileURL;
    }

    public String getImageURL() {
        return imageURL;
    }

    public void setImageURL(String imageURL) {
        this.imageURL = imageURL;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public Long getExpireTime() {
        return expireTime;
    }

    public void setExpireTime(Long expireTime) {
        this.expireTime = expireTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        SocialUserConnection user = (SocialUserConnection) o;

        if (!id.equals(user.id)) {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "SocialUserConnection{" +
            "id=" + id +
            ", userId=" + userId +
            ", providerId='" + providerId + '\'' +
            ", providerUserId='" + providerUserId + '\'' +
            ", rank=" + rank +
            ", displayName='" + displayName + '\'' +
            ", profileURL='" + profileURL + '\'' +
            ", imageURL='" + imageURL + '\'' +
            ", accessToken='" + accessToken + '\'' +
            ", secret='" + secret + '\'' +
            ", refreshToken='" + refreshToken + '\'' +
            ", expireTime=" + expireTime +
            '}';
    }
}
