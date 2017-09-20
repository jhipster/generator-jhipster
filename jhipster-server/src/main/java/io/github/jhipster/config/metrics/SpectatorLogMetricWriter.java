/*
 * Copyright 2016-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.github.jhipster.config.metrics;

import org.slf4j.*;
import org.springframework.boot.actuate.metrics.Metric;
import org.springframework.boot.actuate.metrics.writer.Delta;
import org.springframework.boot.actuate.metrics.writer.MetricWriter;

/**
 * Log reporter for Spring Boot Metrics.
 *
 * Output Spring Boot metrics to logs, using the same format as Dropwizard's Sfl4jReporter.
 */
public class SpectatorLogMetricWriter implements MetricWriter {

    private final Logger log = LoggerFactory.getLogger("metrics");

    @Override
    public void set(Metric<?> metric) {
        String metricContent = metric.getName();
        String[] metricSplit = metricContent.split("\\.");

        String hystrixType = "";
        String serviceName = "";
        String methodName = "";
        String metricName = metricContent;

        // format different types of hystrix metrics
        if (metricSplit[2].equals("RibbonCommand")) {
            hystrixType = "hystrix.HystrixCommand.RibbonCommand";
            serviceName = metricSplit[3];
            // remove prefix
            metricName = metricContent.substring(37);
        } else {
            if (metricSplit[1].equals("HystrixCommand")) {
                hystrixType = "hystrix.HystrixCommand";
                serviceName = metricSplit[2];
                methodName = metricSplit[3];
                metricName = metricContent.substring(23);
            }
            if (metricSplit[1].equals("HystrixThreadPool")) {
                hystrixType = "hystrix.HystrixThreadPool";
                serviceName = metricSplit[2];
                methodName = metricSplit[3];
                metricName = metricContent.substring(26);
            }
        }

        log.info(MarkerFactory.getMarker("metrics"), "type=GAUGE, hystrix_type={}, service={}, method={}, name={}, " +
                "value={}", hystrixType, serviceName,
            methodName, metricName, metric.getValue());
    }

    @Override
    public void increment(Delta<?> metric) {
        log.info(MarkerFactory.getMarker("metrics"), "type=COUNTER, name={}, count={}", metric.getName(), metric
            .getValue());
    }

    @Override
    public void reset(String metricName) {
        // Not implemented
    }
}
