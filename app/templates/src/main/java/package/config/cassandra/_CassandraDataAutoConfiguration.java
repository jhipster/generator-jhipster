package <%=packageName%>.config.cassandra;

import com.datastax.driver.core.Cluster;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfigurationPackages;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.cassandra.config.CassandraEntityClassScanner;
import org.springframework.data.cassandra.config.CassandraSessionFactoryBean;
import org.springframework.data.cassandra.convert.CassandraConverter;
import org.springframework.data.cassandra.convert.MappingCassandraConverter;
import org.springframework.data.cassandra.core.CassandraAdminOperations;
import org.springframework.data.cassandra.core.CassandraAdminTemplate;
import org.springframework.data.cassandra.mapping.BasicCassandraMappingContext;
import org.springframework.data.cassandra.mapping.CassandraMappingContext;

import javax.inject.Inject;

/**
 * {@link org.springframework.boot.autoconfigure.EnableAutoConfiguration Auto-configuration} for Spring Data's Cassandra support.
 * <p/>
 * Registers a {@link org.springframework.data.cassandra.config.CassandraSessionFactoryBean} a {@link org.springframework.data.cassandra.core.CassandraAdminOperations} a {@link org.springframework.data.cassandra.mapping.CassandraMappingContext} and a
 * {@link org.springframework.data.cassandra.convert.CassandraConverter} beans if no other beans of the same type are configured.
 * <p/>
 */
@Configuration
@ConditionalOnClass({Cluster.class, CassandraAdminOperations.class})
@EnableConfigurationProperties(CassandraProperties.class)
@AutoConfigureAfter(CassandraAutoConfiguration.class)
public class CassandraDataAutoConfiguration {

    @Inject
    BeanFactory beanFactory;

    @Inject
    private CassandraProperties properties;

    @Inject
    private Cluster cluster;

    @Bean
    @ConditionalOnMissingBean
    public CassandraSessionFactoryBean session() throws Exception {
        CassandraSessionFactoryBean session = new CassandraSessionFactoryBean();
        session.setCluster(this.cluster);
        session.setConverter(cassandraConverter());
        session.setKeyspaceName(properties.getKeyspaceName());
        return session;
    }

    @Bean
    @ConditionalOnMissingBean
    public CassandraAdminOperations cassandraTemplate() throws Exception {
        return new CassandraAdminTemplate(session().getObject(), cassandraConverter());
    }

    @Bean
    @ConditionalOnMissingBean
    public CassandraMappingContext cassandraMapping() throws ClassNotFoundException {
        BasicCassandraMappingContext bean = new BasicCassandraMappingContext();
        bean.setInitialEntitySet(CassandraEntityClassScanner.scan(AutoConfigurationPackages.get(beanFactory)));
        bean.setBeanClassLoader(beanFactory.getClass().getClassLoader());
        return bean;
    }

    @Bean
    @ConditionalOnMissingBean
    public CassandraConverter cassandraConverter() throws Exception {
        return new MappingCassandraConverter(cassandraMapping());
    }
}
