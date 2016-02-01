package <%=packageName%>.security.jwt;

import <%=packageName%>.config.JHipsterProperties;

import javax.annotation.PostConstruct;
import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;

@Component
public class TokenProvider {

    private final Logger log = LoggerFactory.getLogger(TokenProvider.class);

    private String secretKey;

    @Inject
    private JHipsterProperties jHipsterProperties;

    @PostConstruct
    public void init() {
        this.secretKey = jHipsterProperties.getSecurity().getAuthentication().getJwt().getSecret();
    }

    public String createTokenForUser(String username) {
        return Jwts.builder()
            .setSubject(username)
            .signWith(SignatureAlgorithm.HS512, secretKey)
            .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(secretKey)
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(secretKey).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            log.info("Invalid JWT signature: " + e.getMessage());
            return false;
        }
    }
}
