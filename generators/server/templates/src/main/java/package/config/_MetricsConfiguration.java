package <%=packageName%>.config;
<% if (hibernateCache == 'ehcache') { %>
import <%=packageName%>.config.jcache.JCacheGaugeSet;
<%_ } _%>
<%_ if (applicationType == 'microservice' || applicationType == 'gateway') { _%>
import <%=packageName%>.config.metrics.SpectatorLogMetricWriter;
import com.netflix.spectator.api.Registry;
import org.springframework.boot.actuate.autoconfigure.ExportMetricReader;
import org.springframework.boot.actuate.autoconfigure.ExportMetricWriter;
import org.springframework.boot.actuate.metrics.writer.MetricWriter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.netflix.metrics.spectator.SpectatorMetricReader;
<%_ } _%>

import com.codahale.metrics.JmxReporter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Slf4jReporter;
import com.codahale.metrics.graphite.Graphite;
import com.codahale.metrics.graphite.GraphiteReporter;
import com.codahale.metrics.health.HealthCheckRegistry;
import com.codahale.metrics.jvm.*;
import com.ryantenney.metrics.spring.config.annotation.EnableMetrics;
import com.ryantenney.metrics.spring.config.annotation.MetricsConfigurerAdapter;
<%_ if (databaseType == 'sql') { _%>
import com.zaxxer.hikari.HikariDataSource;
<%_ } _%>
import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.dropwizard.DropwizardExports;
import io.prometheus.client.exporter.MetricsServlet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
<%_ if (databaseType == 'sql') { _%>
import org.springframework.beans.factory.annotation.Autowired;
<%_ } _%>
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.*;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import java.lang.management.ManagementFactory;
import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableMetrics(proxyTargetClass = true)
public class MetricsConfiguration extends MetricsConfigurerAdapter {

    private static final String PROP_METRIC_REG_JVM_MEMORY = "jvm.memory";
    private static final String PROP_METRIC_REG_JVM_GARBAGE = "jvm.garbage";
    private static final String PROP_METRIC_REG_JVM_THREADS = "jvm.threads";
    private static final String PROP_METRIC_REG_JVM_FILES = "jvm.files";
    private static final String PROP_METRIC_REG_JVM_BUFFERS = "jvm.buffers";
<% if (hibernateCache == 'ehcache') { %>
    private static final String PROP_METRIC_REG_JCACHE_STATISTICS = "jcache.statistics";
<%_ } _%>
    private final Logger log = LoggerFactory.getLogger(MetricsConfiguration.class);

    private MetricRegistry metricRegistry = new MetricRegistry();

    private HealthCheckRegistry healthCheckRegistry = new HealthCheckRegistry();

    @Inject
    private JHipsterProperties jHipsterProperties;
<%_ if (databaseType == 'sql') { _%>

    @Autowired(required = false)
    private HikariDataSource hikariDataSource;
<%_ } _%>

    @Override
    @Bean
    public MetricRegistry getMetricRegistry() {
        return metricRegistry;
    }

    @Override
    @Bean
    public HealthCheckRegistry getHealthCheckRegistry() {
        return healthCheckRegistry;
    }

    @PostConstruct
    public void init() {
        log.debug("Registering JVM gauges");
        metricRegistry.register(PROP_METRIC_REG_JVM_MEMORY, new MemoryUsageGaugeSet());
        metricRegistry.register(PROP_METRIC_REG_JVM_GARBAGE, new GarbageCollectorMetricSet());
        metricRegistry.register(PROP_METRIC_REG_JVM_THREADS, new ThreadStatesGaugeSet());
        metricRegistry.register(PROP_METRIC_REG_JVM_FILES, new FileDescriptorRatioGauge());
        metricRegistry.register(PROP_METRIC_REG_JVM_BUFFERS, new BufferPoolMetricSet(ManagementFactory.getPlatformMBeanServer()));
<% if (hibernateCache == 'ehcache') { %>
        metricRegistry.register(PROP_METRIC_REG_JCACHE_STATISTICS, new JCacheGaugeSet());
<%_ } _%>
        <%_ if (databaseType == 'sql') { _%>
        if (hikariDataSource != null) {
            log.debug("Monitoring the datasource");
            hikariDataSource.setMetricRegistry(metricRegistry);
        }
        <%_ } _%>
        if (jHipsterProperties.getMetrics().getJmx().isEnabled()) {
            log.debug("Initializing Metrics JMX reporting");
            JmxReporter jmxReporter = JmxReporter.forRegistry(metricRegistry).build();
            jmxReporter.start();
        }

        if (jHipsterProperties.getMetrics().getLogs().isEnabled()) {
            log.info("Initializing Metrics Log reporting");
            final Slf4jReporter reporter = Slf4jReporter.forRegistry(metricRegistry)
                .outputTo(LoggerFactory.getLogger("metrics"))
                .convertRatesTo(TimeUnit.SECONDS)
                .convertDurationsTo(TimeUnit.MILLISECONDS)
                .build();
            reporter.start(jHipsterProperties.getMetrics().getLogs().getReportFrequency(), TimeUnit.SECONDS);
        }
    }

    @Configuration
    @ConditionalOnClass(Graphite.class)
    public static class GraphiteRegistry {

        private final Logger log = LoggerFactory.getLogger(GraphiteRegistry.class);

        @Inject
        private MetricRegistry metricRegistry;

        @Inject
        private JHipsterProperties jHipsterProperties;

        @PostConstruct
        private void init() {
            if (jHipsterProperties.getMetrics().getGraphite().isEnabled()) {
                log.info("Initializing Metrics Graphite reporting");
                String graphiteHost = jHipsterProperties.getMetrics().getGraphite().getHost();
                Integer graphitePort = jHipsterProperties.getMetrics().getGraphite().getPort();
                String graphitePrefix = jHipsterProperties.getMetrics().getGraphite().getPrefix();
                Graphite graphite = new Graphite(new InetSocketAddress(graphiteHost, graphitePort));
                GraphiteReporter graphiteReporter = GraphiteReporter.forRegistry(metricRegistry)
                    .convertRatesTo(TimeUnit.SECONDS)
                    .convertDurationsTo(TimeUnit.MILLISECONDS)
                    .prefixedWith(graphitePrefix)
                    .build(graphite);
                graphiteReporter.start(1, TimeUnit.MINUTES);
            }
        }
    }

    @Configuration
    @ConditionalOnClass(CollectorRegistry.class)
    public static class PrometheusRegistry implements ServletContextInitializer{

        private final Logger log = LoggerFactory.getLogger(PrometheusRegistry.class);

        @Inject
        private MetricRegistry metricRegistry;

        @Inject
        private JHipsterProperties jHipsterProperties;

        @Override
        public void onStartup(ServletContext servletContext) throws ServletException {
            if(jHipsterProperties.getMetrics().getPrometheus().isEnabled()) {
                String endpoint = jHipsterProperties.getMetrics().getPrometheus().getEndpoint();
                log.info("Initializing Metrics Prometheus endpoint at {}", endpoint);
                CollectorRegistry collectorRegistry = new CollectorRegistry();
                collectorRegistry.register(new DropwizardExports(metricRegistry));
                servletContext
                    .addServlet("prometheusMetrics", new MetricsServlet(collectorRegistry))
                    .addMapping(endpoint);
            }
        }
    }

    <%_ if (applicationType == 'microservice' || applicationType == 'gateway') { _%>
    /* Spectator metrics log reporting */
    @Bean
    @ConditionalOnProperty("jhipster.logging.spectator-metrics.enabled")
    @ExportMetricReader
    public SpectatorMetricReader SpectatorMetricReader(Registry registry) {
        log.info("Initializing Spectator Metrics Log reporting");
        return new SpectatorMetricReader(registry);
    }

    @Bean
    @ConditionalOnProperty("jhipster.logging.spectator-metrics.enabled")
    @ExportMetricWriter
    MetricWriter metricWriter() {
        return new SpectatorLogMetricWriter();
    }
    <%_ } _%>
}
