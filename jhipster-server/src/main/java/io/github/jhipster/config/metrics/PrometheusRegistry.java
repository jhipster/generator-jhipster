package io.github.jhipster.config.metrics;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.web.servlet.ServletContextInitializer;
import org.springframework.context.annotation.Configuration;

import com.codahale.metrics.MetricRegistry;

import io.github.jhipster.config.JHipsterProperties;
import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.dropwizard.DropwizardExports;
import io.prometheus.client.exporter.MetricsServlet;

@Configuration
@ConditionalOnClass(CollectorRegistry.class)
public class PrometheusRegistry implements ServletContextInitializer {

    private final Logger log = LoggerFactory.getLogger(PrometheusRegistry.class);

    private final MetricRegistry metricRegistry;

    private final JHipsterProperties jHipsterProperties;

    public PrometheusRegistry(MetricRegistry metricRegistry, JHipsterProperties jHipsterProperties) {
        this.metricRegistry = metricRegistry;
        this.jHipsterProperties = jHipsterProperties;
    }

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
