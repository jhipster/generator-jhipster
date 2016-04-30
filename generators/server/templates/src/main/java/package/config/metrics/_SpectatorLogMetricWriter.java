package <%=packageName%>.config.metrics;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.actuate.metrics.Metric;
import org.springframework.boot.actuate.metrics.writer.Delta;
import org.springframework.boot.actuate.metrics.writer.MetricWriter;

/**
 * Log reporter for Spring Boot metrics
 *
 * Output Spring Boot metrics to logs, using the same format as Dropwizard's Sfl4jReporter
 */
public class SpectatorLogMetricWriter implements MetricWriter {

    private final Logger log = LoggerFactory.getLogger("metrics");

    @Override
    public void set(Metric<?> metric) {
        String metricContent = metric.getName();
        String[] metricSplit = metricContent.split("\\.");

        String hystrixType="";
        String serviceName="";
        String methodName="";
        String metricName=metricContent;

        // format different types of hystrix metrics
        if(metricSplit[2].equals("RibbonCommand")){
            hystrixType = "hystrix.HystrixCommand.RibbonCommand";
            serviceName = metricSplit[3];
            // remove prefix
            metricName = metricContent.substring(37);
        }
        else{
            if(metricSplit[1].equals("HystrixCommand")){
                hystrixType = "hystrix.HystrixCommand";
                serviceName = metricSplit[2];
                methodName= metricSplit[3];
                metricName= metricContent.substring(23);
            }
            if(metricSplit[1].equals("HystrixThreadPool")){
                hystrixType = "hystrix.HystrixThreadPool";
                serviceName = metricSplit[2];
                methodName= metricSplit[3];
                metricName= metricContent.substring(26);
            }
        }

        log.info("type=GAUGE, hystrix_type={}, service={}, method={}, name={}, value={}", hystrixType, serviceName, methodName, metricName, metric.getValue());
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
