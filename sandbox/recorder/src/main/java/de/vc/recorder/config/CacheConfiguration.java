package de.vc.recorder.config;

import java.time.Duration;
import org.ehcache.config.builders.*;
import org.ehcache.jsr107.Eh107Configuration;
import org.hibernate.cache.jcache.ConfigSettings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.serviceregistry.Registration;
import org.springframework.context.annotation.*;
import tech.jhipster.config.JHipsterProperties;
import tech.jhipster.config.cache.PrefixedKeyGenerator;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private GitProperties gitProperties;
    private BuildProperties buildProperties;
    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache = jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration =
            Eh107Configuration.fromEhcacheCacheConfiguration(
                CacheConfigurationBuilder
                    .newCacheConfigurationBuilder(Object.class, Object.class, ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                    .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.ofSeconds(ehcache.getTimeToLiveSeconds())))
                    .build()
            );
    }

    @Bean
    public HibernatePropertiesCustomizer hibernatePropertiesCustomizer(javax.cache.CacheManager cacheManager) {
        return hibernateProperties -> hibernateProperties.put(ConfigSettings.CACHE_MANAGER, cacheManager);
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            createCache(cm, de.vc.recorder.domain.SearchLabel.class.getName());
            createCache(cm, de.vc.recorder.domain.SearchLabel.class.getName() + ".records");
            createCache(cm, de.vc.recorder.domain.UserGroup.class.getName());
            createCache(cm, de.vc.recorder.domain.UserGroup.class.getName() + ".userProfiles");
            createCache(cm, de.vc.recorder.domain.UserGroup.class.getName() + ".machineLabels");
            createCache(cm, de.vc.recorder.domain.MachineLabel.class.getName());
            createCache(cm, de.vc.recorder.domain.MachineLabel.class.getName() + ".records");
            createCache(cm, de.vc.recorder.domain.MachineLabel.class.getName() + ".userGroups");
            createCache(cm, de.vc.recorder.domain.MachineLabel.class.getName() + ".userProfiles");
            createCache(cm, de.vc.recorder.domain.Channel.class.getName());
            createCache(cm, de.vc.recorder.domain.Channel.class.getName() + ".nodes");
            createCache(cm, de.vc.recorder.domain.Node.class.getName());
            createCache(cm, de.vc.recorder.domain.Node.class.getName() + ".channels");
            createCache(cm, de.vc.recorder.domain.Node.class.getName() + ".userProfiles");
            createCache(cm, de.vc.recorder.domain.Record.class.getName());
            createCache(cm, de.vc.recorder.domain.Record.class.getName() + ".categoryLabels");
            createCache(cm, de.vc.recorder.domain.Record.class.getName() + ".searchLabels");
            createCache(cm, de.vc.recorder.domain.Record.class.getName() + ".machineLabels");
            createCache(cm, de.vc.recorder.domain.CategoryLabel.class.getName());
            createCache(cm, de.vc.recorder.domain.CategoryLabel.class.getName() + ".records");
            createCache(cm, de.vc.recorder.domain.CategoryLabel.class.getName() + ".userProfiles");
            createCache(cm, de.vc.recorder.domain.UserProfile.class.getName());
            createCache(cm, de.vc.recorder.domain.UserProfile.class.getName() + ".searchLabels");
            createCache(cm, de.vc.recorder.domain.UserProfile.class.getName() + ".assignedNodes");
            createCache(cm, de.vc.recorder.domain.UserProfile.class.getName() + ".assignedCategories");
            createCache(cm, de.vc.recorder.domain.UserProfile.class.getName() + ".machineLabels");
            createCache(cm, de.vc.recorder.domain.UserProfile.class.getName() + ".userGroups");
            // jhipster-needle-ehcache-add-entry
        };
    }

    private void createCache(javax.cache.CacheManager cm, String cacheName) {
        javax.cache.Cache<Object, Object> cache = cm.getCache(cacheName);
        if (cache != null) {
            cache.clear();
        } else {
            cm.createCache(cacheName, jcacheConfiguration);
        }
    }

    @Autowired(required = false)
    public void setGitProperties(GitProperties gitProperties) {
        this.gitProperties = gitProperties;
    }

    @Autowired(required = false)
    public void setBuildProperties(BuildProperties buildProperties) {
        this.buildProperties = buildProperties;
    }

    @Bean
    public KeyGenerator keyGenerator() {
        return new PrefixedKeyGenerator(this.gitProperties, this.buildProperties);
    }
}
