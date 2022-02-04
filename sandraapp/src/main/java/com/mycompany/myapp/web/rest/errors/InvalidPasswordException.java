package com.mycompany.myapp.web.rest.errors;

import com.mycompany.myapp.GeneratedByJHipster;
import org.zalando.problem.AbstractThrowableProblem;
import org.zalando.problem.Status;

@GeneratedByJHipster
public class InvalidPasswordException extends AbstractThrowableProblem {
    private static final long serialVersionUID = 1L;

    public InvalidPasswordException() {
        super(ErrorConstants.INVALID_PASSWORD_TYPE, "Incorrect password", Status.BAD_REQUEST);
    }
}
