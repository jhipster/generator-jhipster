<% if (authenticationType == 'oauth2') { %>import java.nio.charset.StandardCharsets
import java.util.Base64

<% } %>import _root_.io.gatling.core.scenario.Simulation
import ch.qos.logback.classic.{Level, LoggerContext}
import io.gatling.core.Predef._
import io.gatling.http.Predef._
import org.slf4j.LoggerFactory

import scala.concurrent.duration._

/**
 * Performance test for the <%= entityClass %> entity.
 */
class <%= entityClass %>GatlingTest extends Simulation {

    val context: LoggerContext = LoggerFactory.getILoggerFactory.asInstanceOf[LoggerContext]
    // Log all HTTP requests
    //context.getLogger("io.gatling.http").setLevel(Level.valueOf("TRACE"))
    // Log failed HTTP requests
    //context.getLogger("io.gatling.http").setLevel(Level.valueOf("DEBUG"))

    val baseURL = Option(System.getProperty("baseURL")) getOrElse """http://127.0.0.1:8080"""

    val httpConf = http
        .baseURL(baseURL)
        .inferHtmlResources()
        .acceptHeader("*/*")
        .acceptEncodingHeader("gzip, deflate")
        .acceptLanguageHeader("fr,fr-fr;q=0.8,en-us;q=0.5,en;q=0.3")
        .connection("keep-alive")
        .userAgentHeader("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:33.0) Gecko/20100101 Firefox/33.0")

    val headers_http = Map(
        "Accept" -> """application/json"""
    )
<% if (authenticationType == 'session') { %>
    val headers_http_authenticated = Map(
        "Accept" -> """application/json""",
        "X-CSRF-TOKEN" -> "${csrf_token}"
    )<% } %><% if (authenticationType == 'oauth2') { %>
        val authorization_header = "Basic " + Base64.getEncoder.encodeToString("<%= baseName%>app:mySecretOAuthSecret".getBytes(StandardCharsets.UTF_8))

    val headers_http_authentication = Map(
        "Content-Type" -> """application/x-www-form-urlencoded""",
        "Accept" -> """application/json""",
        "Authorization"-> authorization_header
    )

    val headers_http_authenticated = Map(
        "Accept" -> """application/json""",
        "Authorization" -> "Bearer ${access_token}"
    )<% } %><% if (authenticationType == 'xauth') { %>

    val headers_http_authentication = Map(
        "Content-Type" -> """application/x-www-form-urlencoded""",
        "Accept" -> """application/json"""
    )

    val headers_http_authenticated = Map(
        "Accept" -> """application/json""",
        "x-auth-token" -> "${x_auth_token}"
    )<% } %>

    val scn = scenario("Test the <%= entityClass %> entity")
        .exec(http("First unauthenticated request")
        .get("/api/account")
        .headers(headers_http)
        .check(status.is(401))<% if (authenticationType == 'session') { %>
        .check(headerRegex("Set-Cookie", "CSRF-TOKEN=(.*); [P,p]ath=/").saveAs("csrf_token"))<% } %>)
        .pause(10)
        .exec(http("Authentication")<% if (authenticationType == 'session') { %>
        .post("/api/authentication")
        .headers(headers_http_authenticated)
        .formParam("j_username", "admin")
        .formParam("j_password", "admin")
        .formParam("remember-me", "true")
        .formParam("submit", "Login")<% } %><% if (authenticationType == 'oauth2') { %>
        .post("/oauth/token")
        .headers(headers_http_authentication)
        .formParam("username", "admin")
        .formParam("password", "admin")
        .formParam("grant_type", "password")
        .formParam("scope", "read write")
        .formParam("client_secret", "mySecretOAuthSecret")
        .formParam("client_id", "<%= baseName%>app")
        .formParam("submit", "Login")
        .check(jsonPath("$.access_token").saveAs("access_token"))<% } %><% if (authenticationType == 'xauth') { %>
        .post("/api/authenticate")
        .headers(headers_http_authentication)
        .formParam("username", "admin")
        .formParam("password", "admin")
        .check(jsonPath("$.token").saveAs("x_auth_token"))<% } %>)
        .pause(1)
        .exec(http("Authenticated request")
        .get("/api/account")
        .headers(headers_http_authenticated)
        .check(status.is(200))<% if (authenticationType == 'session') { %>
        .check(headerRegex("Set-Cookie", "CSRF-TOKEN=(.*); [P,p]ath=/").saveAs("csrf_token"))<% } %>)
        .pause(10)
        .repeat(2) {
            exec(http("Get all <%= entityInstance %>s")
            .get("/api/<%= entityInstance %>s")
            .headers(headers_http_authenticated)
            .check(status.is(200)))
            .pause(10 seconds, 20 seconds)
            .exec(http("Create new <%= entityInstance %>")
            .post("/api/<%= entityInstance %>s")
            .headers(headers_http_authenticated)
            .body(StringBody("""{"id":null<% for (fieldId in fields) { %>, "<%= fields[fieldId].fieldName %>":<% if (fields[fieldId].fieldType == 'String') { %>"SAMPLE_TEXT"<% } else if (fields[fieldId].fieldType == 'Integer') { %>"0"<% } else if (fields[fieldId].fieldType == 'ZonedDateTime' || fields[fieldId].fieldType == 'LocalDate') { %>"2020-01-01T00:00:00.000Z"<% } else { %>null<% } } %>}""")).asJSON
            .check(status.is(201))
            .check(headerRegex("Location", "(.*)").saveAs("new_<%= entityInstance %>_url")))
            .pause(10)
            .repeat(5) {
                exec(http("Get created <%= entityInstance %>")
                .get("${new_<%= entityInstance %>_url}")
                .headers(headers_http_authenticated))
                .pause(10)
            }
            .exec(http("Delete created <%= entityInstance %>")
            .delete("${new_<%= entityInstance %>_url}")
            .headers(headers_http_authenticated))
            .pause(10)
        }

    val users = scenario("Users").exec(scn)

    setUp(
        users.inject(rampUsers(100) over (1 minutes))
    ).protocols(httpConf)
}
