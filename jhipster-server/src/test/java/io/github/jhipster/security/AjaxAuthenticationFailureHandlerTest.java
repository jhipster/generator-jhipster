package io.github.jhipster.security;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;

import static io.github.jhipster.security.AjaxAuthenticationFailureHandler.UNAUTHORIZED_MESSAGE;

import static javax.servlet.http.HttpServletResponse.SC_UNAUTHORIZED;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Matchers.anyInt;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

public class AjaxAuthenticationFailureHandlerTest {

    private HttpServletResponse response;
    private AjaxAuthenticationFailureHandler handler;

    @Before
    public void setup() {
        response = spy(HttpServletResponse.class);
        handler = new AjaxAuthenticationFailureHandler();
    }

    @Test
    public void testOnAuthenticationFailure() {
        Throwable caught = catchThrowable(() -> {
            handler.onAuthenticationFailure(null, response, null);
            verify(response).sendError(SC_UNAUTHORIZED, UNAUTHORIZED_MESSAGE);
        });
        assertThat(caught).isNull();
    }

    @Test
    public void testOnAuthenticationFailureWithException() {
        IOException exception = new IOException("Eek");
        Throwable caught = catchThrowable(() -> {
            doThrow(exception).when(response).sendError(anyInt(), anyString());
            handler.onAuthenticationFailure(null, response, null);
        });
        assertThat(caught).isEqualTo(exception);
    }
}
