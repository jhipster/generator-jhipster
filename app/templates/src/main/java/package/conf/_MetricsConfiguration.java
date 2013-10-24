package <%=packageName%>.conf;

import <%=packageName%>.conf.metrics.DatabaseHealthCheck;
import com.yammer.metrics.HealthChecks;
import com.yammer.metrics.reporting.GraphiteReporter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.concurrent.TimeUnit;

@Configuration
public class MetricsConfiguration {

    private static final Logger log = LoggerFactory.getLogger(MetricsConfiguration.class);

    @Inject
    private Environment env;

    @PersistenceContext
    private EntityManager em;

    @PostConstruct
    public void initMetrics() {
		log.debug("Initializing Metrics healthchecks");
        HealthChecks.register(new DatabaseHealthCheck(em));

		if (env.acceptsProfiles(Constants.SPRING_PROFILE_PRODUCTION)) {
			String graphiteHost = env.getProperty("metrics.graphite.host");
			if (graphiteHost != null) {
				log.info("Initializing Metrics Graphite reporting");
				Integer graphitePort = env.getProperty("metrics.graphite.port", Integer.class);
				GraphiteReporter.enable(1,
						TimeUnit.MINUTES,
						graphiteHost,
						graphitePort);
			} else {
				log.warn("Graphite server is not configured, unable to send any data to Graphite");
			}
		}
    }
}
