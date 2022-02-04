package com.mycompany.myapp.service;

import com.mycompany.myapp.GeneratedByJHipster;

@GeneratedByJHipster
public class InvalidPasswordException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public InvalidPasswordException() {
        super("Incorrect password");
    }
}
