package <%=packageName%>.web.rest;

import <%=packageName%>.Application;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import springfox.documentation.staticdocs.Swagger2MarkupResultHandler;

import javax.inject.Inject;
import java.io.File;
import java.io.IOException;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class Swagger2MarkupTest {

    private static final String API_URI = "/v2/api-docs";

    @Inject
    private WebApplicationContext context;

    private MockMvc mockMvc;

    private File projectDir;

    @Before
    public void setup() throws IOException {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(this.context).build();

        ClassPathResource pathfileRes = new ClassPathResource("config/application.yml");
        projectDir = pathfileRes.getFile().getParentFile().getParentFile().getParentFile().getParentFile();
    }

    @Test
    public void convertSwaggerToAsciiDoc() throws Exception {
        Swagger2MarkupResultHandler.Builder builder = Swagger2MarkupResultHandler
            .outputDirectory(outputDirForFormat("asciidoc"));
        mockMvc.perform(get(API_URI).accept(APPLICATION_JSON))
            .andDo(builder.build())
            .andExpect(status().isOk());

    }



    private String outputDirForFormat(String format) throws IOException {
        <% if (buildTool == 'gradle') { %>
        return new File(projectDir, "docs/" + format + "/generated").getAbsolutePath();<% } %><% if (buildTool == 'maven') { %>
        return new File(projectDir, "target/docs/" + format + "/generated").getAbsolutePath();<% }%>

    }
}
