package com.mycompany.myapp.security;

import com.mycompany.myapp.GeneratedByJHipster;
import org.springframework.security.core.AuthenticationException;

/**
 * This exception is thrown in case of a not activated user trying to authenticate.
 */
@GeneratedByJHipster
public class UserNotActivatedException extends AuthenticationException {
    private static final long serialVersionUID = 1L;

    public UserNotActivatedException(String message) {
        super(message);
    }

    public UserNotActivatedException(String message, Throwable t) {
        super(message, t);
    }
}
