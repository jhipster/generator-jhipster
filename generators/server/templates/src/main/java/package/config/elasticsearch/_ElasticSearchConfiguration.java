package <%=packageName%>.config.elasticsearch;

import java.io.IOException;

import <%=packageName%>.config.JacksonConfiguration;

import org.elasticsearch.client.Client;
<%_ if (databaseType == 'sql') { _%>
import org.springframework.beans.factory.BeanFactory;
<%_ } _%>
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@AutoConfigureAfter(value = { JacksonConfiguration.class })
public class ElasticSearchConfiguration {

    @Bean
    public ElasticsearchTemplate elasticsearchTemplate(Client client, Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder) {
        return new ElasticsearchTemplate(client, new CustomEntityMapper(jackson2ObjectMapperBuilder.createXmlMapper(false).build()));
    }

<%_ if (databaseType == 'sql') { _%>
    @Bean
    public static BeanFactoryHolder beanFactoryHolder(BeanFactory beanFactory) {
        BeanFactoryHolder.INSTANCE = new BeanFactoryHolder(beanFactory);
        return BeanFactoryHolder.INSTANCE;
    }

<%_ } _%>
    public class CustomEntityMapper implements EntityMapper {

        private ObjectMapper objectMapper;

        public CustomEntityMapper(ObjectMapper objectMapper) {
            this.objectMapper = objectMapper;
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            objectMapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
        }

        @Override
        public String mapToString(Object object) throws IOException {
            return objectMapper.writeValueAsString(object);
        }

        @Override
        public <T> T mapToObject(String source, Class<T> clazz) throws IOException {
            return objectMapper.readValue(source, clazz);
        }
    }
    <%_ if (databaseType == 'sql') { _%>

    public static class BeanFactoryHolder {

        private static BeanFactoryHolder INSTANCE;

        private BeanFactory beanFactory;

        private BeanFactoryHolder(BeanFactory beanFactory) {
            this.beanFactory = beanFactory;
        }

        public static BeanFactoryHolder beanFactoryHolder() {
            return INSTANCE;
        }

        public BeanFactory get() {
            return beanFactory;
        }
    }
<%_ } _%>
}
