package <%=packageName%>.cucumber;

import org.junit.runner.RunWith;

<% if (databaseType == 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import cucumber.api.CucumberOptions;
import cucumber.api.junit.Cucumber;

@RunWith(Cucumber.class)
@CucumberOptions(plugin = "pretty", features = "src/test/features")
public class CucumberTest <% if (databaseType == 'cassandra') { %>extends AbstractCassandraTest<% } %> {

}
