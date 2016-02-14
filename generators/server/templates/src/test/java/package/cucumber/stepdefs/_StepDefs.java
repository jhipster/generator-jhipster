package <%=packageName%>.cucumber.stepdefs;

import <%=packageName%>.Application;

import org.springframework.boot.test.SpringApplicationContextLoader;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.ResultActions;

import <%=packageName%>.<%= mainClass %>;

@WebAppConfiguration
@ContextConfiguration(classes = <%= mainClass %>.class, loader = SpringApplicationContextLoader.class)
public abstract class StepDefs {

    protected ResultActions actions;

}
