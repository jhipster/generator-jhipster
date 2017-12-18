/*
 * Copyright 2016-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.github.jhipster.security;

import static javax.servlet.http.HttpServletResponse.SC_OK;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import javax.servlet.http.HttpServletResponse;

import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;

public class AjaxAuthenticationSuccessHandlerTest {

    private HttpServletResponse response;
    private AjaxAuthenticationSuccessHandler handler;

    @Captor
    private ArgumentCaptor<Integer> intCaptor;

    @Captor
    private ArgumentCaptor<String> stringCaptor;

    @Before
    public void setup() {
        response = spy(HttpServletResponse.class);
        handler = new AjaxAuthenticationSuccessHandler();
    }

    @Test
    public void testOnAuthenticationSuccess() {
        Throwable caughtException = catchThrowable(() -> {
            handler.onAuthenticationSuccess(null, response, null);
            verify(response).setStatus(SC_OK);
        });
        assertThat(caughtException).isNull();
    }
}
