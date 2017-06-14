<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%= packageName %>.web.rest.errors;

<%_ if (databaseType === 'cassandra') { _%>
import <%= packageName %>.AbstractCassandraTest;
<%_ } _%>
import <%= packageName %>.<%= mainClass %>;
<%_ if (authenticationType === 'uaa') { _%>
import <%= packageName %>.config.SecurityBeanOverrideConfiguration;
<%_ } _%>
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test class for the ExceptionTranslator controller advice.
 *
 * @see ExceptionTranslator
 */
@RunWith(SpringRunner.class)
<%_ if (authenticationType === 'uaa' && applicationType !== 'uaa') { _%>
@SpringBootTest(classes = {<%= mainClass %>.class, SecurityBeanOverrideConfiguration.class})
<%_ } else { _%>
@SpringBootTest(classes = <%= mainClass %>.class)
<%_ } _%>
public class ExceptionTranslatorIntTest <% if (databaseType === 'cassandra') { %>extends AbstractCassandraTest <% } %>{

    @Autowired
    private ExceptionTranslatorTestController controller;

    @Autowired
    private ExceptionTranslator exceptionTranslator;

    private MockMvc mockMvc;

    @Before
    public void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
            .setControllerAdvice(exceptionTranslator)
            .build();
    }
    <%_ if (databaseType !== 'no' && databaseType !== 'cassandra') { _%>

    @Test
    public void testConcurrencyFailure() throws Exception {
        mockMvc.perform(get("/test/concurrency-failure"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message").value(ErrorConstants.ERR_CONCURRENCY_FAILURE));
    }
    <%_ } _%>

    @Test
    public void testMethodArgumentNotValid() throws Exception {
         mockMvc.perform(post("/test/method-argument").content("{}").contentType(MediaType.APPLICATION_JSON))
             .andExpect(status().isBadRequest())
             .andExpect(jsonPath("$.message").value(ErrorConstants.ERR_VALIDATION))
             .andExpect(jsonPath("$.fieldErrors.[0].objectName").value("testDTO"))
             .andExpect(jsonPath("$.fieldErrors.[0].field").value("test"))
             .andExpect(jsonPath("$.fieldErrors.[0].message").value("NotNull"));
    }

    @Test
    public void testParameterizedError() throws Exception {
        mockMvc.perform(get("/test/parameterized-error"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("test parameterized error"))
            .andExpect(jsonPath("$.params.param0").value("param0_value"))
            .andExpect(jsonPath("$.params.param1").value("param1_value"));
    }

    @Test
    public void testParameterizedError2() throws Exception {
        mockMvc.perform(get("/test/parameterized-error2"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("test parameterized error"))
            .andExpect(jsonPath("$.params.foo").value("foo_value"))
            .andExpect(jsonPath("$.params.bar").value("bar_value"));
    }

    @Test
    public void testAccessDenied() throws Exception {
        mockMvc.perform(get("/test/access-denied"))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.message").value(ErrorConstants.ERR_ACCESS_DENIED))
            .andExpect(jsonPath("$.description").value("test access denied!"));
    }

    @Test
    public void testMethodNotSupported() throws Exception {
        mockMvc.perform(post("/test/access-denied"))
            .andExpect(status().isMethodNotAllowed())
            .andExpect(jsonPath("$.message").value(ErrorConstants.ERR_METHOD_NOT_SUPPORTED))
            .andExpect(jsonPath("$.description").value("Request method 'POST' not supported"));
    }

    @Test
    public void testExceptionWithResponseStatus() throws Exception {
        mockMvc.perform(get("/test/response-status"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("error.400"))
            .andExpect(jsonPath("$.description").value("test response status"));
    }

    @Test
    public void testInternalServerError() throws Exception {
        mockMvc.perform(get("/test/internal-server-error"))
            .andExpect(status().isInternalServerError())
            .andExpect(jsonPath("$.message").value(ErrorConstants.ERR_INTERNAL_SERVER_ERROR))
            .andExpect(jsonPath("$.description").value("Internal server error"));
    }
}
