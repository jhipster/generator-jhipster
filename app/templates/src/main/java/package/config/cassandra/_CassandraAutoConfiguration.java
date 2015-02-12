package <%=packageName%>.config.cassandra;

import com.datastax.driver.core.Cluster;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.inject.Inject;

/**
 * {@link org.springframework.boot.autoconfigure.EnableAutoConfiguration Auto-configuration} for Cassandra.
 */
@Configuration
@ConditionalOnClass({Cluster.class})
@EnableConfigurationProperties(CassandraProperties.class)
public class CassandraAutoConfiguration {

    @Inject
    private CassandraProperties properties;

    private Cluster cluster;

    @Bean
    @ConditionalOnMissingBean
    public Cluster cluster() {
        this.cluster = this.properties.createCluster();
        return cluster;
    }
}
