package <%=packageName%>.config.metrics;

import <%=packageName%>.config.JHipsterProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.metrics.Metric;
import org.springframework.boot.actuate.metrics.writer.Delta;
import org.springframework.boot.actuate.metrics.writer.MetricWriter;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Log reporter for Spring Boot metrics
 *
 * Output Spring Boot metrics to logs, using the same format as Dropwizard's Sfl4jReporter
 */
public class LogMetricWriter implements MetricWriter {

    private final Logger log = LoggerFactory.getLogger("metrics");

    @Inject
    private JHipsterProperties jHipsterProperties;

    @Override
    public void set(Metric<?> metric) {
        String metricName = metric.getName();

        // Don't set a metric if its prefix is in the exclusion list
        for(String prefix : jHipsterProperties.getLogging().getActuatorMetrics().getPrefixExclusionList()){
            if(metricName.startsWith(prefix)){
                return;
            }
        }

        log.info("type=GAUGE, name={}, value={}", metric.getName(), metric.getValue());
    }

    @Override
    public void increment(Delta<?> metric) {
        log.info("type=COUNTER, name={}, count={}", metric.getName(), metric.getValue());
    }

    @Override
    public void reset(String metricName) {
        // Not implemented
    }
}
