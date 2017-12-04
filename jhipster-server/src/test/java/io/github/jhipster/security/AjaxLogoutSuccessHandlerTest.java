package io.github.jhipster.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;

public class AjaxLogoutSuccessHandlerTest {

    private HttpServletResponse response;
    private AjaxLogoutSuccessHandler handler;

    @Before
    public void setup() {
        response = spy(HttpServletResponse.class);
        handler = new AjaxLogoutSuccessHandler();
    }

    @Test
    public void testOnAuthenticationSuccess() {
        Throwable caughtException = catchThrowable(() -> {
            handler.onLogoutSuccess(null, response, null);
            verify(response).setStatus(HttpServletResponse.SC_OK);
        });
        assertThat(caughtException).isNull();
    }
}
