package <%=packageName%>.config;

import io.github.jhipster.config.JHipsterConstants;
import io.github.jhipster.config.JHipsterProperties;<% if (!skipClient) { %>
import io.github.jhipster.web.filter.CachingHttpHeadersFilter;<% } %>

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.servlet.InstrumentedFilter;
import com.codahale.metrics.servlets.MetricsServlet;<% if (clusteredHttpSession == 'hazelcast' || hibernateCache == 'hazelcast') { %>
import com.hazelcast.core.HazelcastInstance;<% } %><% if (clusteredHttpSession == 'hazelcast') { %>
import com.hazelcast.web.SessionListener;
import com.hazelcast.web.spring.SpringAwareWebFilter;<% } %>

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.embedded.*;
import org.springframework.boot.context.embedded.undertow.UndertowEmbeddedServletContainerFactory;
import io.undertow.UndertowOptions;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
<% if (!skipClient) { %>
import java.io.File;
import java.nio.file.Paths;<% } %>
import java.util.*;
import javax.servlet.*;

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
public class WebConfigurer implements ServletContextInitializer, EmbeddedServletContainerCustomizer {

    private final Logger log = LoggerFactory.getLogger(WebConfigurer.class);

    private final Environment env;

    private final JHipsterProperties jHipsterProperties;<% if (clusteredHttpSession == 'hazelcast' || hibernateCache == 'hazelcast') { %>

    private final HazelcastInstance hazelcastInstance;<% } %>

    private MetricRegistry metricRegistry;

    public WebConfigurer(Environment env, JHipsterProperties jHipsterProperties<% if (clusteredHttpSession == 'hazelcast' || hibernateCache == 'hazelcast') { %>, HazelcastInstance hazelcastInstance<% } %>) {

        this.env = env;
        this.jHipsterProperties = jHipsterProperties;
        <%_ if (clusteredHttpSession == 'hazelcast' || hibernateCache == 'hazelcast') { _%>
        this.hazelcastInstance = hazelcastInstance;
        <%_ } _%>
    }

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        if (env.getActiveProfiles().length != 0) {
            log.info("Web application configuration, using profiles: {}", (Object[]) env.getActiveProfiles());
        }
        EnumSet<DispatcherType> disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD, DispatcherType.ASYNC);<% if (clusteredHttpSession == 'hazelcast') { %>
        initClusteredHttpSessionFilter(servletContext, disps);<% } %>
        initMetrics(servletContext, disps);<% if (!skipClient) { %>
        if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_PRODUCTION)) {
            initCachingHttpHeadersFilter(servletContext, disps);
        }<% } %><% if (devDatabaseType == 'h2Disk' || devDatabaseType == 'h2Memory') { %>
        if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT)) {
            initH2Console(servletContext);
        }<% } %>
        log.info("Web application fully configured");
    }<% if (clusteredHttpSession == 'hazelcast') { %>

    /**
     * Initializes the Clustered Http Session filter
     */
    private void initClusteredHttpSessionFilter(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering Clustered Http Session Filter");
        servletContext.addListener(new SessionListener());

        FilterRegistration.Dynamic hazelcastWebFilter = servletContext.addFilter("hazelcastWebFilter", new SpringAwareWebFilter());
        Map<String, String> parameters = new HashMap<>();
        parameters.put("instance-name", hazelcastInstance.getName());
        // Name of the distributed map storing your web session objects
        parameters.put("map-name", "clustered-http-sessions");

        // How is your load-balancer configured?
        // Setting "sticky-session" to "true" means all requests of a session
        // are routed to the node where the session is first created.
        // This is excellent for performance.
        // If "sticky-session" is set to "false", then when a session is updated
        // on a node, entries for this session on all other nodes are invalidated.
        // You have to know how your load-balancer is configured before
        // setting this parameter. Default is true.
        parameters.put("sticky-session", "true");

        // Name of session id cookie
        parameters.put("cookie-name", "hazelcast.sessionId");

        // Are you debugging? Default is false.
        if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_PRODUCTION)) {
            parameters.put("debug", "false");
        } else {
            parameters.put("debug", "true");
        }

        // Do you want to shutdown HazelcastInstance during
        // web application undeploy process?
        // Default is true.
        parameters.put("shutdown-on-destroy", "true");

        hazelcastWebFilter.setInitParameters(parameters);
        hazelcastWebFilter.addMappingForUrlPatterns(disps, true, "/*");
        hazelcastWebFilter.setAsyncSupported(true);
    }<% } %>

    /**
     * Customize the Servlet engine: Mime types, the document root, the cache.
     */
    @Override
    public void customize(ConfigurableEmbeddedServletContainer container) {
        MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
        // IE issue, see https://github.com/jhipster/generator-jhipster/pull/711
        mappings.add("html", "text/html;charset=utf-8");
        // CloudFoundry issue, see https://github.com/cloudfoundry/gorouter/issues/64
        mappings.add("json", "text/html;charset=utf-8");
        container.setMimeMappings(mappings);
        <%_ if (!skipClient) { _%>
        // When running in an IDE or with <% if (buildTool == 'gradle') { %>./gradlew bootRun<% } else { %>./mvnw spring-boot:run<% } %>, set location of the static web assets.
        setLocationForStaticAssets(container);
        <%_ } _%>

        /*
         * Enable HTTP/2 for Undertow - https://twitter.com/ankinson/status/829256167700492288
         * HTTP/2 requires HTTPS, so HTTP requests will fallback to HTTP/1.1.
         * See the JHipsterProperties class and your application-*.yml configuration files
         * for more information.
         */
        if (jHipsterProperties.getHttp().getVersion().equals(JHipsterProperties.Http.Version.V_2_0) &&
            container instanceof UndertowEmbeddedServletContainerFactory) {

            ((UndertowEmbeddedServletContainerFactory) container)
                .addBuilderCustomizers(builder ->
                    builder.setServerOption(UndertowOptions.ENABLE_HTTP2, true));
        }
    }
    <%_ if (!skipClient) { _%>

    private void setLocationForStaticAssets(ConfigurableEmbeddedServletContainer container) {
        File root;
        String prefixPath = resolvePathPrefix();
        <%_ if (clientFramework !== 'angular1') { _%>
        root = new File(prefixPath + "<%= CLIENT_DIST_DIR %>");
        <%_ } else { _%>
        if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_PRODUCTION)) {
            root = new File(prefixPath + "<%= CLIENT_DIST_DIR %>");
        } else {
            root = new File(prefixPath + "<%= CLIENT_MAIN_SRC_DIR %>");
        }
        <%_ } _%>
        if (root.exists() && root.isDirectory()) {
            container.setDocumentRoot(root);
        }
    }

    /**
     *  Resolve path prefix to static resources.
     */
    private String resolvePathPrefix() {
        String fullExecutablePath = this.getClass().getResource("").getPath();
        String rootPath = Paths.get(".").toUri().normalize().getPath();
        String extractedPath = fullExecutablePath.replace(rootPath, "");
        int extractionEndIndex = extractedPath.indexOf("<%= BUILD_DIR %>");
        if(extractionEndIndex <= 0) {
            return "";
        }
        return extractedPath.substring(0, extractionEndIndex);
    }

    /**
     * Initializes the caching HTTP Headers Filter.
     */
    private void initCachingHttpHeadersFilter(ServletContext servletContext,
                                              EnumSet<DispatcherType> disps) {
        log.debug("Registering Caching HTTP Headers Filter");
        FilterRegistration.Dynamic cachingHttpHeadersFilter =
            servletContext.addFilter("cachingHttpHeadersFilter",
                new CachingHttpHeadersFilter(jHipsterProperties));

        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/content/*");
        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/app/*");
        cachingHttpHeadersFilter.setAsyncSupported(true);
    }
    <%_ } _%>

    /**
     * Initializes Metrics.
     */
    private void initMetrics(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Initializing Metrics registries");
        servletContext.setAttribute(InstrumentedFilter.REGISTRY_ATTRIBUTE,
            metricRegistry);
        servletContext.setAttribute(MetricsServlet.METRICS_REGISTRY,
            metricRegistry);

        log.debug("Registering Metrics Filter");
        FilterRegistration.Dynamic metricsFilter = servletContext.addFilter("webappMetricsFilter",
            new InstrumentedFilter());

        metricsFilter.addMappingForUrlPatterns(disps, true, "/*");
        metricsFilter.setAsyncSupported(true);

        log.debug("Registering Metrics Servlet");
        ServletRegistration.Dynamic metricsAdminServlet =
            servletContext.addServlet("metricsServlet", new MetricsServlet());

        metricsAdminServlet.addMapping("/management/metrics/*");
        metricsAdminServlet.setAsyncSupported(true);
        metricsAdminServlet.setLoadOnStartup(2);
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = jHipsterProperties.getCors();
        if (config.getAllowedOrigins() != null && !config.getAllowedOrigins().isEmpty()) {
            log.debug("Registering CORS filter");
            source.registerCorsConfiguration("/api/**", config);
            source.registerCorsConfiguration("/v2/api-docs", config);
            <%_ if (authenticationType === 'oauth2') { _%>
            source.registerCorsConfiguration("/oauth/**", config);
            <%_ } _%>
            <%_ if (applicationType === 'gateway') { _%>
            source.registerCorsConfiguration("/*/api/**", config);
            <%_ if (authenticationType === 'uaa') { _%>
            source.registerCorsConfiguration("/*/oauth/**", config);
            <%_ } _%>
            <%_ } _%>
        }
        return new CorsFilter(source);
    }<% if (devDatabaseType == 'h2Disk' || devDatabaseType == 'h2Memory') { %>

    /**
     * Initializes H2 console.
     */
    private void initH2Console(ServletContext servletContext) {
        log.debug("Initialize H2 console");
        ServletRegistration.Dynamic h2ConsoleServlet = servletContext.addServlet("H2Console", new org.h2.server.web.WebServlet());
        h2ConsoleServlet.addMapping("/h2-console/*");
        h2ConsoleServlet.setInitParameter("-properties", "<%= SERVER_MAIN_RES_DIR %>");
        h2ConsoleServlet.setLoadOnStartup(1);
    }<% } %>

    @Autowired(required = false)
    public void setMetricRegistry(MetricRegistry metricRegistry) {
        this.metricRegistry = metricRegistry;
    }
}
