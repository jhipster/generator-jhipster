package <%=packageName%>.conf;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.graphite.Graphite;
import com.codahale.metrics.graphite.GraphiteReporter;
import com.codahale.metrics.health.HealthCheckRegistry;
import <%=packageName%>.conf.metrics.DatabaseHealthCheck;
import com.ryantenney.metrics.spring.config.annotation.EnableMetrics;
import com.ryantenney.metrics.spring.config.annotation.MetricsConfigurerAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.inject.Inject;
import javax.sql.DataSource;
import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;

import static <%=packageName%>.conf.WebConfigurer.HEALTH_CHECK_REGISTRY;
import static <%=packageName%>.conf.WebConfigurer.METRIC_REGISTRY;

@Configuration
@EnableMetrics(proxyTargetClass = true)
public class MetricsConfiguration extends MetricsConfigurerAdapter {

    private static final Logger log = LoggerFactory.getLogger(MetricsConfiguration.class);

    @Inject
    private Environment env;

    @Inject
    private DataSource dataSource;

    @Override
    public MetricRegistry getMetricRegistry() {
        return METRIC_REGISTRY;
    }

    @Override
    public HealthCheckRegistry getHealthCheckRegistry() {
        return HEALTH_CHECK_REGISTRY;
    }

    @Override
    public void configureReporters(MetricRegistry metricRegistry) {
        log.debug("Initializing Metrics healthchecks");
        HEALTH_CHECK_REGISTRY.register("database", new DatabaseHealthCheck(dataSource));

        if (env.acceptsProfiles(Constants.SPRING_PROFILE_PRODUCTION)) {
            String graphiteHost = env.getProperty("metrics.graphite.host");
            if (graphiteHost != null) {
                log.info("Initializing Metrics Graphite reporting");
                Integer graphitePort = env.getProperty("metrics.graphite.port", Integer.class);
                Graphite graphite = new Graphite(new InetSocketAddress(graphiteHost, graphitePort));
                GraphiteReporter reporter = GraphiteReporter.forRegistry(METRIC_REGISTRY)
                        .convertRatesTo(TimeUnit.SECONDS)
                        .convertDurationsTo(TimeUnit.MILLISECONDS)
                        .build(graphite);
                reporter.start(1, TimeUnit.MINUTES);
            } else {
                log.warn("Graphite server is not configured, unable to send any data to Graphite");
            }
        }
    }
}
