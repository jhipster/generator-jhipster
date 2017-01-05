package <%=packageName%>.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.PersistenceConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.security.oauth2.provider.OAuth2Authentication;

import java.io.Serializable;
import java.util.UUID;

@Document(collection = "OAUTH_AUTHENTICATION_CODE")
public class OAuth2AuthenticationCode implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    private String code;

    private OAuth2Authentication authentication;

    @PersistenceConstructor
    public OAuth2AuthenticationCode(String code, OAuth2Authentication authentication) {
        this.id = UUID.randomUUID().toString();
        this.code = code;
        this.authentication = authentication;
    }

    public String getCode() {
        return code;
    }

    public OAuth2Authentication getAuthentication() {
        return authentication;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) { return true; }
        if (o == null || getClass() != o.getClass()) { return false; }

        OAuth2AuthenticationCode that = (OAuth2AuthenticationCode) o;

        if (id != null ? !id.equals(that.id) : that.id != null) { return false; }

        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
