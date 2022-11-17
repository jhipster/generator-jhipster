package tech.jhipster.sample.web.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Unit tests for the {@link ClientForwardController} REST controller.
 */
class ClientForwardControllerTest {

    private MockMvc restMockMvc;

    @BeforeEach
    public void setup() {
        ClientForwardController clientForwardController = new ClientForwardController();
        this.restMockMvc = MockMvcBuilders.standaloneSetup(clientForwardController, new TestController()).build();
    }

    @Test
    void getBackendEndpoint() throws Exception {
        restMockMvc
            .perform(get("/test"))
            .andExpect(status().isOk())
            .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN_VALUE))
            .andExpect(content().string("test"));
    }

    @Test
    void forwardUnmappedFirstLevelMapping() throws Exception {
        ResultActions perform = restMockMvc.perform(get("/first-level"));
        perform.andExpect(status().isOk()).andExpect(forwardedUrl("/"));
    }

    @Test
    void forwardUnmappedDottedFirstLevelWithTraillingSeparator() throws Exception {
        ResultActions perform = restMockMvc.perform(get("/first.level/"));
        perform.andExpect(status().isOk()).andExpect(forwardedUrl("/"));
    }

    @Test
    void forwardUnmappedSecondLevelMapping() throws Exception {
        ResultActions perform = restMockMvc.perform(get("/first-level/second-level"));
        perform.andExpect(status().isOk()).andExpect(forwardedUrl("/"));
    }

    @Test
    void forwardUnmappedDottedSecondLevelWithTraillingSeparator() throws Exception {
        ResultActions perform = restMockMvc.perform(get("/first.level/second.level/"));
        perform.andExpect(status().isOk()).andExpect(forwardedUrl("/"));
    }

    @Test
    void forwardUnmappedThirdLevelMapping() throws Exception {
        ResultActions perform = restMockMvc.perform(get("/first-level/second-level/third-level"));
        perform.andExpect(status().isOk()).andExpect(forwardedUrl("/"));
    }

    @Test
    void forwardUnmappedDottedThirdLevelWithTraillingSeparator() throws Exception {
        ResultActions perform = restMockMvc.perform(get("/first.level/second.level/third.level/"));
        perform.andExpect(status().isOk()).andExpect(forwardedUrl("/"));
    }

    @Test
    void forwardUnmappedDeepMapping() throws Exception {
        restMockMvc.perform(get("/1/2/3/4/5/6/7/8/9/10")).andExpect(forwardedUrl("/"));
    }

    @Test
    void getUnmappedFirstLevelFile() throws Exception {
        restMockMvc.perform(get("/foo.js")).andExpect(status().isNotFound());
    }

    @Test
    void getUnmappedSecondLevelFile() throws Exception {
        restMockMvc.perform(get("/foo/bar.js")).andExpect(status().isNotFound());
    }

    @Test
    void getUnmappedThirdLevelFile() throws Exception {
        restMockMvc.perform(get("/foo/another/bar.js")).andExpect(status().isNotFound());
    }

    @Test
    void forwardUnmappedFourthLevelFile() throws Exception {
        restMockMvc.perform(get("/first/second/third/bar.js")).andExpect(forwardedUrl("/"));
    }

    @RestController
    public static class TestController {

        @RequestMapping(value = "/test")
        public String test() {
            return "test";
        }
    }
}
