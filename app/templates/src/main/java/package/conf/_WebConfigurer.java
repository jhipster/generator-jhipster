package <%=packageName%>.conf;

import com.yammer.metrics.reporting.AdminServlet;
import com.yammer.metrics.web.DefaultWebappMetricsFilter;
import net.sf.ehcache.constructs.web.filter.GzipFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;

import javax.servlet.*;
import java.util.EnumSet;

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
public class WebConfigurer implements ServletContextListener {

    private static final Logger log = LoggerFactory.getLogger(WebConfigurer.class);

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext servletContext = sce.getServletContext();
        log.info("Web application configuration");

        log.debug("Configuring Spring root application context");
        AnnotationConfigWebApplicationContext rootContext = new AnnotationConfigWebApplicationContext();
        rootContext.register(ApplicationConfiguration.class);
        rootContext.refresh();

        servletContext.setAttribute(WebApplicationContext.ROOT_WEB_APPLICATION_CONTEXT_ATTRIBUTE, rootContext);

        EnumSet<DispatcherType> disps = EnumSet.of(DispatcherType.REQUEST, DispatcherType.FORWARD, DispatcherType.ASYNC);

        ServletRegistration.Dynamic dispatcherServlet = initSpring(servletContext, rootContext);
        initSpringSecurity(servletContext, disps);
        initMetricsServlet(servletContext, disps, dispatcherServlet);
        initGzip(servletContext, disps);

        log.debug("Web application fully configured");
    }

    /**
     * Initializes the GZip filter.
     */
    private void initGzip(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering GZip Filter");
        FilterRegistration.Dynamic gzipFilter = servletContext.addFilter("gzipFilter",
                new GzipFilter());

        gzipFilter.addMappingForUrlPatterns(disps, true, "/app/*");
        gzipFilter.addMappingForUrlPatterns(disps, true, "/scripts/*");
        gzipFilter.addMappingForUrlPatterns(disps, true, "/styles/*");
        gzipFilter.addMappingForUrlPatterns(disps, true, "*.html");
        gzipFilter.setAsyncSupported(true);
    }

    /**
     * Initializes Spring and Spring MVC.
     */
    private ServletRegistration.Dynamic initSpring(ServletContext servletContext, AnnotationConfigWebApplicationContext rootContext) {
        log.debug("Configuring Spring Web application context");
        AnnotationConfigWebApplicationContext dispatcherServletConfiguration = new AnnotationConfigWebApplicationContext();
        dispatcherServletConfiguration.setParent(rootContext);
        dispatcherServletConfiguration.register(DispatcherServletConfiguration.class);

        log.debug("Registering Spring MVC Servlet");
        ServletRegistration.Dynamic dispatcherServlet = servletContext.addServlet("dispatcher", new DispatcherServlet(
                dispatcherServletConfiguration));
        dispatcherServlet.addMapping("/app/*");
        dispatcherServlet.setLoadOnStartup(1);
        dispatcherServlet.setAsyncSupported(true);
        return dispatcherServlet;
    }

    /**
     * Initializes Spring Security.
     */
    private void initSpringSecurity(ServletContext servletContext, EnumSet<DispatcherType> disps) {
        log.debug("Registering Spring Security Filter");
        FilterRegistration.Dynamic springSecurityFilter = servletContext.addFilter("springSecurityFilterChain",
                new DelegatingFilterProxy());

        springSecurityFilter.setAsyncSupported(true);
        springSecurityFilter.addMappingForUrlPatterns(disps, false, "/*");
        springSecurityFilter.setAsyncSupported(true);
    }

    /**
     * Initializes Yammer Metrics.
     */
    private void initMetricsServlet(ServletContext servletContext, EnumSet<DispatcherType> disps,
                                    ServletRegistration.Dynamic dispatcherServlet) {

        log.debug("Registering Yammer Metrics Filter");
        FilterRegistration.Dynamic metricsFilter = servletContext.addFilter("webappMetricsFilter",
                new DefaultWebappMetricsFilter());

        metricsFilter.addMappingForUrlPatterns(disps, true, "/*");

        log.debug("Registering Yammer Metrics Admin Servlet");
        ServletRegistration.Dynamic metricsAdminServlet =
                servletContext.addServlet("metricsAdminServlet", new AdminServlet());

        metricsAdminServlet.addMapping("/metrics/*");
        dispatcherServlet.setLoadOnStartup(2);
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        log.info("Destroying Web application");
        WebApplicationContext ac = WebApplicationContextUtils.getRequiredWebApplicationContext(sce.getServletContext());
        AnnotationConfigWebApplicationContext gwac = (AnnotationConfigWebApplicationContext) ac;
        gwac.close();
        log.debug("Web application destroyed");
    }
}
