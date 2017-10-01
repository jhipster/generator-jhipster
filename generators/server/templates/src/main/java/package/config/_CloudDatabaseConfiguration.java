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
<%_ if (databaseType === 'mongodb') { _%>

import com.github.mongobee.Mongobee;

import io.github.jhipster.config.JHipsterConstants;
import io.github.jhipster.domain.util.JSR310DateConverters.*;
<%_ } else { _%>

import io.github.jhipster.config.JHipsterConstants;
<%_ } _%>

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;<% if (hibernateCache === 'hazelcast') { %>
import org.springframework.cache.CacheManager;<% } %>
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.cloud.Cloud;
import org.springframework.cloud.CloudException;
<%_ } _%>
import org.springframework.cloud.config.java.AbstractCloudConfig;
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.cloud.service.ServiceInfo;
import org.springframework.cloud.service.common.MongoServiceInfo;
<%_ } _%>
import org.springframework.context.annotation.*;
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.CustomConversions;
import org.springframework.data.mongodb.core.mapping.event.ValidatingMongoEventListener;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
<%_ } _%>
<%_ if (databaseType === 'sql') { _%>

import javax.sql.DataSource;
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>

import java.util.ArrayList;
import java.util.List;
<%_ } _%>

@Configuration
<%_ if (databaseType === 'mongodb') { _%>
@EnableMongoRepositories("<%=packageName%>.repository")
<%_ } _%>
@Profile(JHipsterConstants.SPRING_PROFILE_CLOUD)
public class CloudDatabaseConfiguration extends AbstractCloudConfig {

    private final Logger log = LoggerFactory.getLogger(CloudDatabaseConfiguration.class);
    <%_ if (databaseType === 'sql') { _%>

    @Bean
    public DataSource dataSource(<% if (hibernateCache === 'hazelcast') { %>CacheManager cacheManager<% } %>) {
        log.info("Configuring JDBC datasource from a cloud provider");
        return connectionFactory().dataSource();
    }
    <%_ } _%>
    <%_ if (databaseType === 'mongodb') { _%>

    @Bean
    public MongoDbFactory mongoFactory() {
        return connectionFactory().mongoDbFactory();
    }

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }

    @Bean
    public ValidatingMongoEventListener validatingMongoEventListener() {
        return new ValidatingMongoEventListener(validator());
    }

    @Bean
    public CustomConversions customConversions() {
        List<Converter<?, ?>> converterList = new ArrayList<>();
        converterList.add(DateToZonedDateTimeConverter.INSTANCE);
        converterList.add(ZonedDateTimeToDateConverter.INSTANCE);
        return new CustomConversions(converterList);
    }

    @Bean
    public Mongobee mongobee(MongoDbFactory mongoDbFactory, MongoTemplate mongoTemplate, Cloud cloud) {
        log.debug("Configuring Cloud Mongobee");
        List<ServiceInfo> matchingServiceInfos = cloud.getServiceInfos(MongoDbFactory.class);

        if (matchingServiceInfos.size() != 1) {
            throw new CloudException("No unique service matching MongoDbFactory found. Expected 1, found "
                + matchingServiceInfos.size());
        }
        MongoServiceInfo info = (MongoServiceInfo) matchingServiceInfos.get(0);
        Mongobee mongobee = new Mongobee(info.getUri());
        mongobee.setDbName(mongoDbFactory.getDb().getName());
        mongobee.setMongoTemplate(mongoTemplate);
        // package to scan for migrations
        mongobee.setChangeLogsScanPackage("<%=packageName%>.config.dbmigrations");
        mongobee.setEnabled(true);
        return mongobee;
    }
    <%_ } _%>
}
