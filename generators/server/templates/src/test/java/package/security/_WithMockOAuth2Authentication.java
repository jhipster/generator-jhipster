package <%=packageName%>.security;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockedOAuthUserSecurityContextFactory.class)
public @interface WithMockOAuth2Authentication {
    String username() default "TestUser";
    String password() default "TestUser";

    String clientId() default "testClient";
    String[] scope() default {"default.read", "default.write"};

    String[] roles() default {"USER", "ADMIN"};


}
