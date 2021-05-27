package de.vc.admin.cucumber.stepdefs;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.vc.admin.web.rest.UserResource;
import io.cucumber.java.Before;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

public class UserStepDefs extends StepDefs {

    @Autowired
    private UserResource userResource;

    private MockMvc restUserMockMvc;

    @Before
    public void setup() {
        this.restUserMockMvc = MockMvcBuilders.standaloneSetup(userResource).build();
    }

    @When("I search user {string}")
    public void i_search_user(String userId) throws Throwable {
        actions = restUserMockMvc.perform(get("/api/users/" + userId).accept(MediaType.APPLICATION_JSON));
    }

    @Then("the user is found")
    public void the_user_is_found() throws Throwable {
        actions.andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE));
    }

    @Then("his last name is {string}")
    public void his_last_name_is(String lastName) throws Throwable {
        actions.andExpect(jsonPath("$.lastName").value(lastName));
    }
}
