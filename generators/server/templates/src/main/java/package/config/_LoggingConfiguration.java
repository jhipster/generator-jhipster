<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.config;

import java.net.InetSocketAddress;
import java.util.Iterator;

import io.github.jhipster.config.JHipsterProperties;

import ch.qos.logback.classic.AsyncAppender;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.boolex.OnMarkerEvaluator;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.LoggerContextListener;
import ch.qos.logback.core.Appender;
import ch.qos.logback.core.filter.EvaluatorFilter;
import ch.qos.logback.core.spi.ContextAwareBase;
import ch.qos.logback.core.spi.FilterReply;
import net.logstash.logback.appender.LogstashTcpSocketAppender;
import net.logstash.logback.encoder.LogstashEncoder;
import net.logstash.logback.stacktrace.ShortenedThrowableConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
<%_ if (serviceDiscoveryType === "eureka") { _%>
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.netflix.eureka.EurekaInstanceConfigBean;
<%_ } _%>
<%_ if (serviceDiscoveryType === "consul") { _%>
import org.springframework.cloud.consul.ConditionalOnConsulEnabled;
import org.springframework.cloud.consul.serviceregistry.ConsulRegistration;
<%_ } _%>
import org.springframework.context.annotation.Configuration;

@Configuration
<%_ if (serviceDiscoveryType === "eureka") { _%>
@ConditionalOnProperty("eureka.client.enabled")
<%_ } _%>
<%_ if (serviceDiscoveryType === "consul") { _%>
@ConditionalOnConsulEnabled
<%_ } _%>
public class LoggingConfiguration {
    private static final String LOGSTASH_APPENDER_NAME = "LOGSTASH";
    private static final String ASYNC_LOGSTASH_APPENDER_NAME = "ASYNC_LOGSTASH";

    private final Logger log = LoggerFactory.getLogger(LoggingConfiguration.class);

    private LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();

    private final String appName;

    private final String serverPort;
    <%_ if (serviceDiscoveryType === "eureka") { _%>

    private final EurekaInstanceConfigBean eurekaInstanceConfigBean;
    <%_ } _%>
    <%_ if (serviceDiscoveryType === "consul") { _%>

    private final ConsulRegistration consulRegistration;
    <%_ } _%>

    private final String version;

    private final JHipsterProperties jHipsterProperties;

    public LoggingConfiguration(@Value("${spring.application.name}") String appName, @Value("${server.port}") String serverPort,
        <% if (serviceDiscoveryType === "eureka") { %>EurekaInstanceConfigBean eurekaInstanceConfigBean,<% } %><% if (serviceDiscoveryType === "consul") { %> ConsulRegistration consulRegistration,<% } %> JHipsterProperties jHipsterProperties, @Value("${info.project.version}") String version) {
        this.appName = appName;
        this.serverPort = serverPort;
        <%_ if (serviceDiscoveryType === 'eureka') { _%>
        this.eurekaInstanceConfigBean = eurekaInstanceConfigBean;
        <%_ } _%>
        <%_ if (serviceDiscoveryType === 'consul') { _%>
        this.consulRegistration = consulRegistration;
        <%_ } _%>
        this.jHipsterProperties = jHipsterProperties;
        this.version = version;
        if (jHipsterProperties.getLogging().getLogstash().isEnabled()) {
            addLogstashAppender(context);
            addContextListener(context);
        }
        if (jHipsterProperties.getMetrics().getLogs().isEnabled()) {
            setMetricsMarkerLogbackFilter(context);
        }
    }

    private void addContextListener(LoggerContext context) {
        LogbackLoggerContextListener loggerContextListener = new LogbackLoggerContextListener();
        loggerContextListener.setContext(context);
        context.addListener(loggerContextListener);
    }

    private void addLogstashAppender(LoggerContext context) {
        log.info("Initializing Logstash logging");

        LogstashTcpSocketAppender logstashAppender = new LogstashTcpSocketAppender();
        logstashAppender.setName("LOGSTASH");
        logstashAppender.setContext(context);
        <%_ if (serviceDiscoveryType && (applicationType === 'microservice' || applicationType === 'gateway' || applicationType === 'uaa')) { _%>
        String customFields = "{\"app_name\":\"" + appName + "\",\"app_port\":\"" + serverPort + "\"," +
            "\"instance_id\":\"" + <% if (serviceDiscoveryType === "eureka") { %>eurekaInstanceConfigBean.getInstanceId()<% } %><% if (serviceDiscoveryType === "consul") { %>consulRegistration.getInstanceId()<% } %> + "\"," + "\"version\":\"" + version + "\"}";
        <%_ } else { _%>
        String customFields = "{\"app_name\":\"" + appName + "\",\"app_port\":\"" + serverPort + "\"}";
        <%_ } _%>

        // More documentation is available at: https://github.com/logstash/logstash-logback-encoder
        LogstashEncoder logstashEncoder=new LogstashEncoder();
        // Set the Logstash appender config from JHipster properties
        logstashEncoder.setCustomFields(customFields);
        // Set the Logstash appender config from JHipster properties
        logstashAppender.addDestinations(new InetSocketAddress(jHipsterProperties.getLogging().getLogstash().getHost(),jHipsterProperties.getLogging().getLogstash().getPort()));

        ShortenedThrowableConverter throwableConverter = new ShortenedThrowableConverter();
        throwableConverter.setRootCauseFirst(true);
        logstashEncoder.setThrowableConverter(throwableConverter);
        logstashEncoder.setCustomFields(customFields);

        logstashAppender.setEncoder(logstashEncoder);
        logstashAppender.start();

        // Wrap the appender in an Async appender for performance
        AsyncAppender asyncLogstashAppender = new AsyncAppender();
        asyncLogstashAppender.setContext(context);
        asyncLogstashAppender.setName("ASYNC_LOGSTASH");
        asyncLogstashAppender.setQueueSize(jHipsterProperties.getLogging().getLogstash().getQueueSize());
        asyncLogstashAppender.addAppender(logstashAppender);
        asyncLogstashAppender.start();

        context.getLogger("ROOT").addAppender(asyncLogstashAppender);
    }

    // Configure a log filter to remove "metrics" logs from all appenders except the "LOGSTASH" appender
    private void setMetricsMarkerLogbackFilter(LoggerContext context) {
        log.info("Filtering metrics logs from all appenders except the {} appender", LOGSTASH_APPENDER_NAME);
        OnMarkerEvaluator onMarkerMetricsEvaluator = new OnMarkerEvaluator();
        onMarkerMetricsEvaluator.setContext(context);
        onMarkerMetricsEvaluator.addMarker("metrics");
        onMarkerMetricsEvaluator.start();
        EvaluatorFilter<ILoggingEvent> metricsFilter = new EvaluatorFilter<>();
        metricsFilter.setContext(context);
        metricsFilter.setEvaluator(onMarkerMetricsEvaluator);
        metricsFilter.setOnMatch(FilterReply.DENY);
        metricsFilter.start();

        for (ch.qos.logback.classic.Logger logger : context.getLoggerList()) {
            for (Iterator<Appender<ILoggingEvent>> it = logger.iteratorForAppenders(); it.hasNext(); ) {
                Appender<ILoggingEvent> appender = it.next();
                if (!appender.getName().equals(ASYNC_LOGSTASH_APPENDER_NAME)) {
                    log.debug("Filter metrics logs from the {} appender", appender.getName());
                    appender.setContext(context);
                    appender.addFilter(metricsFilter);
                    appender.start();
                }
            }
        }
    }

    /**
     * Logback configuration is achieved by configuration file and API.
     * When configuration file change is detected, the configuration is reset.
     * This listener ensures that the programmatic configuration is also re-applied after reset.
     */
    class LogbackLoggerContextListener extends ContextAwareBase implements LoggerContextListener {

        @Override
        public boolean isResetResistant() {
            return true;
        }

        @Override
        public void onStart(LoggerContext context) {
            addLogstashAppender(context);
        }

        @Override
        public void onReset(LoggerContext context) {
            addLogstashAppender(context);
        }

        @Override
        public void onStop(LoggerContext context) {
            // Nothing to do.
        }

        @Override
        public void onLevelChange(ch.qos.logback.classic.Logger logger, Level level) {
            // Nothing to do.
        }
    }

}
