package tech.jhipster.sample.web.rest;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Resource to return information about OIDC properties
 */
@RestController
@RequestMapping("/api")
public class AuthInfoResource {

    @Value("${spring.security.oauth2.client.provider.oidc.issuer-uri:}")
    private String issuer;

    @Value("${spring.security.oauth2.client.registration.oidc.client-id:}")
    private String clientId;

    @GetMapping("/auth-info")
    public AuthInfoVM getAuthInfo() {
        return new AuthInfoVM(issuer, clientId);
    }

    class AuthInfoVM {

        private String issuer;
        private String clientId;

        AuthInfoVM(String issuer, String clientId) {
            this.issuer = issuer;
            this.clientId = clientId;
        }

        public String getIssuer() {
            return this.issuer;
        }

        public void setIssuer(String issuer) {
            this.issuer = issuer;
        }

        public String getClientId() {
            return clientId;
        }

        public void setClientId(String clientId) {
            this.clientId = clientId;
        }
    }
}
