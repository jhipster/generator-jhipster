package <%=packageName%>.config;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.servlet.InstrumentedFilter;
import com.codahale.metrics.servlets.MetricsServlet;<% if (clusteredHttpSession == 'hazelcast') { %>
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.web.SessionListener;
import com.hazelcast.web.WebFilter;<% } %>
import <%=packageName%>.web.filter.CachingHttpHeadersFilter;
import <%=packageName%>.web.filter.StaticResourcesProductionFilter;
import <%=packageName%>.web.filter.gzip.GZipServletFilter;<% if (websocket == 'atmosphere') { %>
import org.atmosphere.cache.UUIDBroadcasterCache;
import org.atmosphere.cpr.AtmosphereFramework;
import org.atmosphere.cpr.AtmosphereServlet;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.context.embedded.ServletContextInitializer;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;<% if (websocket == 'atmosphere') { %>
import org.springframework.util.ReflectionUtils;<% } %><% if (clusteredHttpSession == 'hazelcast') { %>
import org.springframework.web.context.support.WebApplicationContextUtils;<% } %>

import javax.inject.Inject;
import javax.servlet.*;<% if (websocket == 'atmosphere') { %>
import java.lang.reflect.Field;<% } %>
import java.util.Arrays;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;<% if (clusteredHttpSession == 'hazelcast') { %>
import java.util.Properties;<% } %>

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
@AutoConfigureAfter(CacheConfiguration.class)
public class WebConfigurer implements ServletContextInitializer {

    private final Logger log = LoggerFactory.getLogger(WebConfigurer.class);

    @Inject
    private Environment env;

    @Inject
    private MetricRegistry metricRegistry;

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        log.info("Web application configuration, using profiles: {}", Arrays.toString(env.getActiveProfiles()));
        EnumSet<DispatcherType> disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD, DispatcherType.ASYNC);
<% if (clusteredHttpSession == 'hazelcast') { %>
        initClusteredHttpSessionFilter(servletContext, disps);<% } %>
        initMetrics(servletContext, disps);<% if (websocket == 'atmosphere') { %>
        initAtmosphereServlet(servletContext);<% } %>
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_PRODUCTION)) {
            initStaticResourcesProductionFilter(servletContext, disps);
            initCachingHttpHeadersFilter(servletContext, disps);
        }
        initCrossOriginResourceSharingFilter(servletContext, disps);
        initGzipFilter(servletContext, disps);<% if (devDatabaseType == 'h2Memory') { %>
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_DEVELOPMENT)) {
            initH2Console(servletContext);
        }<% } %>

        log.info("Web application fully configured");
    }<% if (clusteredHttpSession == 'hazelcast') { %>

    /**
     * Initializes the Clustered Http Session filter
     */
    private void initClusteredHttpSessionFilter(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering Clustered Http Session Filter");

        disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD, DispatcherType.ASYNC, DispatcherType.INCLUDE);
        servletContext.addListener(new SessionListener());

        WebFilter webFilter = new WebFilter() {
            @Override
            protected HazelcastInstance getInstance(Properties properties) throws ServletException {
                return CacheConfiguration.getHazelcastInstance();
            }
        };

        final FilterRegistration.Dynamic hazelcastWebFilter = servletContext.addFilter("hazelcastWebFilter", webFilter);

        Map<String, String> parameters = new HashMap<>();
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
        parameters.put("sticky-session", "false");

        // Name of session id cookie
        parameters.put("cookie-name", "hazelcast.sessionId");

        // Are you debugging? Default is false.
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_PRODUCTION)) {
            parameters.put("debug", "false");
        } else {
            parameters.put("debug", "true");
        }

        // Do you want to shutdown HazelcastInstance during
        // web application undeploy process?
        // Default is true.
        parameters.put("shutdown-on-destroy", "true");

        hazelcastWebFilter.setInitParameters(parameters);
        hazelcastWebFilter.addMappingForUrlPatterns(disps, false, "/*");
        hazelcastWebFilter.setAsyncSupported(true);
    }<% } %>

    /**
     * Initializes the GZip filter.
     */
    private void initGzipFilter(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering GZip Filter");

        FilterRegistration.Dynamic compressingFilter = servletContext.addFilter("gzipFilter", new GZipServletFilter());
        Map<String, String> parameters = new HashMap<>();

        compressingFilter.setInitParameters(parameters);

        compressingFilter.addMappingForUrlPatterns(disps, true, "*.css");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.json");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.html");
        compressingFilter.addMappingForUrlPatterns(disps, true, "*.js");
        compressingFilter.addMappingForUrlPatterns(disps, true, "/app/rest/*");
        compressingFilter.addMappingForUrlPatterns(disps, true, "/metrics/*");

        compressingFilter.setAsyncSupported(true);
    }

    /**
     * Initializes the Cross origin resource sharing filter
     */
    private void initCrossOriginResourceSharingFilter(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering Cross Origin Resource Sharing Filter");

        FilterRegistration.Dynamic crossOriginResourceSharingFilter = servletContext.addFilter("crossOriginResourceSharingFilter", new CrossOriginResourceSharingFilter());

        Map<String, String> parameters = new HashMap<>();
        crossOriginResourceSharingFilter.setInitParameters(parameters);

        crossOriginResourceSharingFilter.addMappingForUrlPatterns(disps, true, "/*");

        crossOriginResourceSharingFilter.setAsyncSupported(true);
    }

    /**
     * Initializes the static resources production Filter.
     */
    private void initStaticResourcesProductionFilter(ServletContext servletContext,
                                                     EnumSet<DispatcherType> disps) {

        log.debug("Registering static resources production Filter");
        FilterRegistration.Dynamic staticResourcesProductionFilter =
                servletContext.addFilter("staticResourcesProductionFilter",
                        new StaticResourcesProductionFilter());

        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/");
        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/index.html");
        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/images/*");
        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/fonts/*");
        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/scripts/*");
        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/styles/*");
        staticResourcesProductionFilter.addMappingForUrlPatterns(disps, true, "/views/*");
        staticResourcesProductionFilter.setAsyncSupported(true);
    }

    /**
     * Initializes the cachig HTTP Headers Filter.
     */
    private void initCachingHttpHeadersFilter(ServletContext servletContext,
                                              EnumSet<DispatcherType> disps) {
        log.debug("Registering Cachig HTTP Headers Filter");
        FilterRegistration.Dynamic cachingHttpHeadersFilter =
                servletContext.addFilter("cachingHttpHeadersFilter",
                        new CachingHttpHeadersFilter());

        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/images/*");
        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/fonts/*");
        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/scripts/*");
        cachingHttpHeadersFilter.addMappingForUrlPatterns(disps, true, "/styles/*");
        cachingHttpHeadersFilter.setAsyncSupported(true);
    }

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

        metricsAdminServlet.addMapping("/metrics/metrics/*");
        metricsAdminServlet.setAsyncSupported(true);
        metricsAdminServlet.setLoadOnStartup(2);
    }<% if (websocket == 'atmosphere') { %>

    /**
     * Initializes Atmosphere.
     */
    private void initAtmosphereServlet(ServletContext servletContext) {
        log.debug("Registering Atmosphere Servlet");
        AtmosphereServlet servlet = new AtmosphereServlet();
        Field frameworkField = ReflectionUtils.findField(AtmosphereServlet.class, "framework");
        ReflectionUtils.makeAccessible(frameworkField);
        ReflectionUtils.setField(frameworkField, servlet, new NoAnalyticsAtmosphereFramework());
        ServletRegistration.Dynamic atmosphereServlet =
                servletContext.addServlet("atmosphereServlet", servlet);

        atmosphereServlet.setInitParameter("org.atmosphere.cpr.packages", "<%=packageName%>.web.websocket");
        atmosphereServlet.setInitParameter("org.atmosphere.cpr.broadcasterCacheClass", UUIDBroadcasterCache.class.getName());
        atmosphereServlet.setInitParameter("org.atmosphere.cpr.broadcaster.shareableThreadPool", "true");
        atmosphereServlet.setInitParameter("org.atmosphere.cpr.broadcaster.maxProcessingThreads", "10");
        atmosphereServlet.setInitParameter("org.atmosphere.cpr.broadcaster.maxAsyncWriteThreads", "10");
        servletContext.addListener(new org.atmosphere.cpr.SessionSupport());

        atmosphereServlet.addMapping("/websocket/*");
        atmosphereServlet.setLoadOnStartup(3);
        atmosphereServlet.setAsyncSupported(true);
    }

    /**
     * Atmosphere sends tracking data to Google Analytics, which is a potential security issue.
     * <p>
     * If you want to send this data, please use directly the AtmosphereFramework class.
     * </p>
     */
    public class NoAnalyticsAtmosphereFramework extends AtmosphereFramework {

        public NoAnalyticsAtmosphereFramework() {
            super();
        }

        @Override
        protected void analytics() {
            // noop
        }
    }<% } %><% if (devDatabaseType == 'h2Memory') { %>
    /**
     * Initializes H2 console
     */
    private void initH2Console(ServletContext servletContext) {
        log.debug("Initialize H2 console");
        ServletRegistration.Dynamic h2ConsoleServlet = servletContext.addServlet("H2Console", new org.h2.server.web.WebServlet());
        h2ConsoleServlet.addMapping("/console/*");
        h2ConsoleServlet.setLoadOnStartup(1);
    }<% } %>


}
