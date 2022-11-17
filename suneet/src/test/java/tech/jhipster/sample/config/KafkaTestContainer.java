package tech.jhipster.sample.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.output.Slf4jLogConsumer;
import org.testcontainers.utility.DockerImageName;

public class KafkaTestContainer implements InitializingBean, DisposableBean {

    private KafkaContainer kafkaContainer;
    private static final Logger log = LoggerFactory.getLogger(KafkaTestContainer.class);

    @Override
    public void destroy() {
        if (null != kafkaContainer && kafkaContainer.isRunning()) {
            kafkaContainer.close();
        }
    }

    @Override
    public void afterPropertiesSet() {
        if (null == kafkaContainer) {
            kafkaContainer =
                new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.3.0"))
                    .withLogConsumer(new Slf4jLogConsumer(log))
                    .withReuse(true);
        }
        if (!kafkaContainer.isRunning()) {
            kafkaContainer.start();
        }
    }

    public KafkaContainer getKafkaContainer() {
        return kafkaContainer;
    }
}
