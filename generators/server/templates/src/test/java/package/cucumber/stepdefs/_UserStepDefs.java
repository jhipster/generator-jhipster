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
package <%=packageName%>.cucumber.stepdefs;

import cucumber.api.java.Before;
import cucumber.api.java.en.Then;
import cucumber.api.java.en.When;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import <%=packageName%>.web.rest.UserResource;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class UserStepDefs extends StepDefs {

    @Autowired
    private UserResource userResource;

    private MockMvc restUserMockMvc;

    @Before
    public void setup() {
        this.restUserMockMvc = MockMvcBuilders.standaloneSetup(userResource).build();
    }

    @When("^I search user '(.*)'$")
    public void i_search_user_admin(String userId) throws Throwable {
        actions = restUserMockMvc.perform(get("/api/users/" + userId)
                .accept(MediaType.APPLICATION_JSON));
    }

    @Then("^the user is found$")
    public void the_user_is_found() throws Throwable {
        actions
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE));
    }

    @Then("^his last name is '(.*)'$")
    public void his_last_name_is(String lastName) throws Throwable {
        actions.andExpect(jsonPath("$.lastName").value(lastName));
    }

}
