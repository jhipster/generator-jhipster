package <%=packageName%>.config;
<%_ if (hibernateCache == 'ehcache') { _%>

import io.github.jhipster.config.JHipsterProperties;
import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.ehcache.expiry.Duration;
import org.ehcache.expiry.Expirations;
import org.ehcache.jsr107.Eh107Configuration;

import java.util.concurrent.TimeUnit;
<%_ } _%>
<%_ if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { _%>

import io.github.jhipster.config.JHipsterConstants;
import io.github.jhipster.config.JHipsterProperties;

import com.hazelcast.config.Config;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.config.MapConfig;
import com.hazelcast.config.EvictionPolicy;
import com.hazelcast.config.MaxSizeConfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
<%_ } _%>

import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
<%_ if (hibernateCache == 'ehcache') { _%>
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
<%_ } _%>
<%_ if ((hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') && serviceDiscoveryType) { _%>
import org.springframework.boot.autoconfigure.web.ServerProperties;
<%_ } _%><%_ if (hibernateCache == 'hazelcast' || hibernateCache == 'no') { _%>
import org.springframework.cache.CacheManager;
<%_ } _%>
import org.springframework.cache.annotation.EnableCaching;
<%_ if (serviceDiscoveryType) { _%>
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
<%_ } _%>
import org.springframework.context.annotation.*;<% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
import org.springframework.core.env.Environment;<% } %>
<%_ if (clusteredHttpSession == 'hazelcast') { _%>
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
<%_ } _%>
<%_ if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { _%>

import javax.annotation.PreDestroy;
<%_ } _%>

@Configuration
@EnableCaching
@AutoConfigureAfter(value = { MetricsConfiguration.class })
@AutoConfigureBefore(value = { WebConfigurer.class<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>, DatabaseConfiguration.class<% } %> })
public class CacheConfiguration {
    <%_ if (hibernateCache == 'ehcache') { _%>

    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache =
            jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration = Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder.newCacheConfigurationBuilder(Object.class, Object.class,
                ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                .withExpiry(Expirations.timeToLiveExpiration(Duration.of(ehcache.getTimeToLiveSeconds(), TimeUnit.SECONDS)))
                .build());
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            <%_ if (!skipUserManagement) { _%>
            cm.createCache(<%=packageName%>.domain.User.class.getName(), jcacheConfiguration);
            cm.createCache(<%=packageName%>.domain.Authority.class.getName(), jcacheConfiguration);
            cm.createCache(<%=packageName%>.domain.User.class.getName() + ".authorities", jcacheConfiguration);
            <%_ if (authenticationType === 'session') { _%>
            cm.createCache(<%=packageName%>.domain.PersistentToken.class.getName(), jcacheConfiguration);
            cm.createCache(<%=packageName%>.domain.User.class.getName() + ".persistentTokens", jcacheConfiguration);
            <%_ } _%>
            <%_ if (enableSocialSignIn) { _%>
            cm.createCache(<%=packageName%>.domain.SocialUserConnection.class.getName(), jcacheConfiguration);
            <%_ } _%>
            <%_ } _%>
            // jhipster-needle-ehcache-add-entry
        };
    }
    <%_ } _%>
    <%_ if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { _%>

    private final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);

    private final Environment env;
        <%_ if (serviceDiscoveryType) { _%>

    private final DiscoveryClient discoveryClient;

    private final ServerProperties serverProperties;
        <%_ } _%>

    public CacheConfiguration(<% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>Environment env<% if (serviceDiscoveryType) { %>, DiscoveryClient discoveryClient, ServerProperties serverProperties<% } } %>) {
        this.env = env;
        <%_ if (serviceDiscoveryType) { _%>
        this.discoveryClient = discoveryClient;
        this.serverProperties = serverProperties;
        <%_ } _%>
    }

    @PreDestroy
    public void destroy() {
        log.info("Closing Cache Manager");
        Hazelcast.shutdownAll();
    }

    @Bean
    public CacheManager cacheManager(HazelcastInstance hazelcastInstance) {
        log.debug("Starting HazelcastCacheManager");
        CacheManager cacheManager = new com.hazelcast.spring.cache.HazelcastCacheManager(hazelcastInstance);
        return cacheManager;
    }

    @Bean
    public HazelcastInstance hazelcastInstance(JHipsterProperties jHipsterProperties) {
        log.debug("Configuring Hazelcast");
        Config config = new Config();
        config.setInstanceName("<%=baseName%>");
        <%_ if (serviceDiscoveryType) { _%>
        // The serviceId is by default the application's name, see Spring Boot's eureka.instance.appname property
        String serviceId = discoveryClient.getLocalServiceInstance().getServiceId();
        log.debug("Configuring Hazelcast clustering for instanceId: {}", serviceId);

        // In development, everything goes through 127.0.0.1, with a different port
        if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT)) {
            log.debug("Application is running with the \"dev\" profile, Hazelcast " +
                      "cluster will only work with localhost instances");

            System.setProperty("hazelcast.local.localAddress", "127.0.0.1");
            config.getNetworkConfig().setPort(serverProperties.getPort() + 5701);
            config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
            config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(true);
            for (ServiceInstance instance : discoveryClient.getInstances(serviceId)) {
                String clusterMember = "127.0.0.1:" + (instance.getPort() + 5701);
                log.debug("Adding Hazelcast (dev) cluster member " + clusterMember);
                config.getNetworkConfig().getJoin().getTcpIpConfig().addMember(clusterMember);
            }
        } else { // Production configuration, one host per instance all using port 5701
            config.getNetworkConfig().setPort(5701);
            config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
            config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(true);
            for (ServiceInstance instance : discoveryClient.getInstances(serviceId)) {
                String clusterMember = instance.getHost() + ":5701";
                log.debug("Adding Hazelcast (prod) cluster member " + clusterMember);
                config.getNetworkConfig().getJoin().getTcpIpConfig().addMember(clusterMember);
            }
        }
        <%_ } else { _%>
        config.getNetworkConfig().setPort(5701);
        config.getNetworkConfig().setPortAutoIncrement(true);

        // In development, remove multicast auto-configuration
        if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT)) {
            System.setProperty("hazelcast.local.localAddress", "127.0.0.1");

            config.getNetworkConfig().getJoin().getAwsConfig().setEnabled(false);
            config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
            config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(false);
        }
        <%_ } _%>
        config.getMapConfigs().put("default", initializeDefaultMapConfig());
        <%_ if (hibernateCache == 'hazelcast') { _%>
        config.getMapConfigs().put("<%=packageName%>.domain.*", initializeDomainMapConfig(jHipsterProperties));
        <%_ } _%>
        <%_ if (clusteredHttpSession == 'hazelcast') { _%>
        config.getMapConfigs().put("clustered-http-sessions", initializeClusteredSession(jHipsterProperties));
        <%_ } _%>
        return Hazelcast.newHazelcastInstance(config);
    }

    private MapConfig initializeDefaultMapConfig() {
        MapConfig mapConfig = new MapConfig();

    /*
        Number of backups. If 1 is set as the backup-count for example,
        then all entries of the map will be copied to another JVM for
        fail-safety. Valid numbers are 0 (no backup), 1, 2, 3.
     */
        mapConfig.setBackupCount(0);

    /*
        Valid values are:
        NONE (no eviction),
        LRU (Least Recently Used),
        LFU (Least Frequently Used).
        NONE is the default.
     */
        mapConfig.setEvictionPolicy(EvictionPolicy.LRU);

    /*
        Maximum size of the map. When max size is reached,
        map is evicted based on the policy defined.
        Any integer between 0 and Integer.MAX_VALUE. 0 means
        Integer.MAX_VALUE. Default is 0.
     */
        mapConfig.setMaxSizeConfig(new MaxSizeConfig(0, MaxSizeConfig.MaxSizePolicy.USED_HEAP_SIZE));

        return mapConfig;
    }
    <%_ if (hibernateCache == 'hazelcast') { _%>

    private MapConfig initializeDomainMapConfig(JHipsterProperties jHipsterProperties) {
        MapConfig mapConfig = new MapConfig();
        mapConfig.setTimeToLiveSeconds(jHipsterProperties.getCache().getHazelcast().getTimeToLiveSeconds());
        return mapConfig;
    }
    <%_ } _%>
    <%_ if (clusteredHttpSession == 'hazelcast') { _%>

    private MapConfig initializeClusteredSession(JHipsterProperties jHipsterProperties) {
        MapConfig mapConfig = new MapConfig();
        mapConfig.setBackupCount(jHipsterProperties.getCache().getHazelcast().getBackupCount());
        mapConfig.setTimeToLiveSeconds(jHipsterProperties.getCache().getHazelcast().getTimeToLiveSeconds());
        return mapConfig;
    }

    /**
     * Use by Spring Security, to get events from Hazelcast.
     *
     * @return the session registry
     */
    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }
    <%_ } _%>
    <%_ } _%>
}
