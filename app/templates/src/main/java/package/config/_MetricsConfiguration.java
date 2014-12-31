package <%=packageName%>.config;

import com.codahale.metrics.JmxReporter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.graphite.Graphite;
import com.codahale.metrics.graphite.GraphiteReporter;
import com.codahale.metrics.health.HealthCheckRegistry;
import com.codahale.metrics.jvm.*;
import com.ryantenney.metrics.spring.config.annotation.EnableMetrics;
import com.ryantenney.metrics.spring.config.annotation.MetricsConfigurerAdapter;
import fr.ippon.spark.metrics.SparkReporter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.lang.management.ManagementFactory;
import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableMetrics(proxyTargetClass = true)
@Profile("!" + Constants.SPRING_PROFILE_FAST)
public class MetricsConfiguration extends MetricsConfigurerAdapter implements EnvironmentAware {

    private static final String ENV_METRICS = "metrics.";
    private static final String ENV_METRICS_GRAPHITE = "metrics.graphite.";
    private static final String ENV_METRICS_SPARK = "metrics.spark.";
    private static final String PROP_JMX_ENABLED = "jmx.enabled";
    private static final String PROP_GRAPHITE_ENABLED = "enabled";
    private static final String PROP_SPARK_ENABLED = "enabled";
    private static final String PROP_GRAPHITE_PREFIX = "";

    private static final String PROP_PORT = "port";
    private static final String PROP_HOST = "host";
    private static final String PROP_METRIC_REG_JVM_MEMORY = "jvm.memory";
    private static final String PROP_METRIC_REG_JVM_GARBAGE = "jvm.garbage";
    private static final String PROP_METRIC_REG_JVM_THREADS = "jvm.threads";
    private static final String PROP_METRIC_REG_JVM_FILES = "jvm.files";
    private static final String PROP_METRIC_REG_JVM_BUFFERS = "jvm.buffers";

    private final Logger log = LoggerFactory.getLogger(MetricsConfiguration.class);

    private static final MetricRegistry METRIC_REGISTRY = new MetricRegistry();

    private static final HealthCheckRegistry HEALTH_CHECK_REGISTRY = new HealthCheckRegistry();

    private RelaxedPropertyResolver propertyResolver;

    @Override
    public void setEnvironment(Environment environment) {
        this.propertyResolver = new RelaxedPropertyResolver(environment, ENV_METRICS);
    }

    @Override
    @Bean
    public MetricRegistry getMetricRegistry() {
        return METRIC_REGISTRY;
    }

    @Override
    @Bean
    public HealthCheckRegistry getHealthCheckRegistry() {
        return HEALTH_CHECK_REGISTRY;
    }

    @PostConstruct
    public void init() {
        log.debug("Registering JVM gauges");
        METRIC_REGISTRY.register(PROP_METRIC_REG_JVM_MEMORY, new MemoryUsageGaugeSet());
        METRIC_REGISTRY.register(PROP_METRIC_REG_JVM_GARBAGE, new GarbageCollectorMetricSet());
        METRIC_REGISTRY.register(PROP_METRIC_REG_JVM_THREADS, new ThreadStatesGaugeSet());
        METRIC_REGISTRY.register(PROP_METRIC_REG_JVM_FILES, new FileDescriptorRatioGauge());
        METRIC_REGISTRY.register(PROP_METRIC_REG_JVM_BUFFERS, new BufferPoolMetricSet(ManagementFactory.getPlatformMBeanServer()));
        if (propertyResolver.getProperty(PROP_JMX_ENABLED, Boolean.class, false)) {
            log.info("Initializing Metrics JMX reporting");
            JmxReporter jmxReporter = JmxReporter.forRegistry(METRIC_REGISTRY).build();
            jmxReporter.start();
        }
    }

    @Configuration
    @ConditionalOnClass(Graphite.class)
    @Profile("!" + Constants.SPRING_PROFILE_FAST)
    public static class GraphiteRegistry implements EnvironmentAware {

        private final Logger log = LoggerFactory.getLogger(GraphiteRegistry.class);

        @Inject
        private MetricRegistry metricRegistry;

        private RelaxedPropertyResolver propertyResolver;

        @Override
        public void setEnvironment(Environment environment) {
            this.propertyResolver = new RelaxedPropertyResolver(environment, ENV_METRICS_GRAPHITE);
        }

        @PostConstruct
        private void init() {
            Boolean graphiteEnabled = propertyResolver.getProperty(PROP_GRAPHITE_ENABLED, Boolean.class, false);
            if (graphiteEnabled) {
                log.info("Initializing Metrics Graphite reporting");
                String graphiteHost = propertyResolver.getRequiredProperty(PROP_HOST);
                Integer graphitePort = propertyResolver.getRequiredProperty(PROP_PORT, Integer.class);
                String graphitePrefix = propertyResolver.getProperty(PROP_GRAPHITE_PREFIX, String.class, "");

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
    @ConditionalOnClass(SparkReporter.class)
    @Profile("!" + Constants.SPRING_PROFILE_FAST)
    public static class SparkRegistry implements EnvironmentAware {

        private final Logger log = LoggerFactory.getLogger(SparkRegistry.class);

        @Inject
        private MetricRegistry metricRegistry;

        private RelaxedPropertyResolver propertyResolver;

        @Override
        public void setEnvironment(Environment environment) {
            this.propertyResolver = new RelaxedPropertyResolver(environment, ENV_METRICS_SPARK);
        }

        @PostConstruct
        private void init() {
            Boolean sparkEnabled = propertyResolver.getProperty(PROP_SPARK_ENABLED, Boolean.class, false);
            if (sparkEnabled) {
                log.info("Initializing Metrics Spark reporting");
                String sparkHost = propertyResolver.getRequiredProperty(PROP_HOST);
                Integer sparkPort = propertyResolver.getRequiredProperty(PROP_PORT, Integer.class);

                SparkReporter sparkReporter = SparkReporter.forRegistry(metricRegistry)
                        .convertRatesTo(TimeUnit.SECONDS)
                        .convertDurationsTo(TimeUnit.MILLISECONDS)
                        .build(sparkHost, sparkPort);
                sparkReporter.start(1, TimeUnit.MINUTES);
            }
        }
    }
}
