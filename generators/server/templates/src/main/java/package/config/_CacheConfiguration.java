package <%=packageName%>.config;
<% if (hibernateCache == 'ehcache' && databaseType == 'sql') { %>
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.ehcache.InstrumentedEhcache;<% } %><% if (hibernateCache == 'hazelcast') { %>
import com.hazelcast.config.Config;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.instance.HazelcastInstanceFactory;
import com.hazelcast.config.MapConfig;<% } %><% if (hibernateCache == 'hazelcast') { %>
import com.hazelcast.config.EvictionPolicy;
import com.hazelcast.config.MaxSizeConfig;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
<%_ if (hibernateCache == 'hazelcast' && serviceDiscoveryType && (applicationType == 'microservice' || applicationType == 'gateway')) { _%>
import org.springframework.boot.autoconfigure.web.ServerProperties;
<%_ } _%>
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
<%_ if (hibernateCache == 'hazelcast' && serviceDiscoveryType && (applicationType == 'microservice' || applicationType == 'gateway')) { _%>
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
<%_ } _%>
import org.springframework.context.annotation.*;<% if (hibernateCache == 'hazelcast') { %>
import org.springframework.core.env.Environment;<% } %><% if (hibernateCache == 'no') { %>
import org.springframework.cache.support.NoOpCacheManager; <% } %><% if (hibernateCache == 'ehcache') { %>
import org.springframework.cache.ehcache.EhCacheCacheManager;<% } %><% if (clusteredHttpSession == 'hazelcast') { %>
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;<% } %><% if (hibernateCache == 'ehcache' && databaseType == 'sql') { %>
import org.springframework.util.Assert;<% } %>

import javax.annotation.PreDestroy;
import javax.inject.Inject;
<%_ if (hibernateCache == 'ehcache' && databaseType == 'sql') { _%>
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.metamodel.EntityType;
import javax.persistence.metamodel.PluralAttribute;
import java.util.Set;
import java.util.SortedSet;
<%_ } _%>

@SuppressWarnings("unused")
@Configuration
@EnableCaching
@AutoConfigureAfter(value = { MetricsConfiguration.class<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>, DatabaseConfiguration.class<% } %> })
public class CacheConfiguration {

    private final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);<% if (hibernateCache == 'hazelcast') { %>

    private static HazelcastInstance hazelcastInstance;<% } if (hibernateCache == 'ehcache' && databaseType == 'sql') { %>

    @PersistenceContext
    private EntityManager entityManager;<% } %><% if (hibernateCache == 'hazelcast') { %>

    @Inject
    private Environment env;<% } %><% if (hibernateCache == 'hazelcast' && serviceDiscoveryType && (applicationType == 'microservice' || applicationType == 'gateway')) { %>

    @Inject
    private DiscoveryClient discoveryClient;

    @Inject
    private ServerProperties serverProperties;<% } %><% if (hibernateCache == 'ehcache') { %>

    @Inject
    private MetricRegistry metricRegistry;

    private net.sf.ehcache.CacheManager cacheManager;<% } else { %>

    private CacheManager cacheManager;<% } %>

    @PreDestroy
    public void destroy() {<% if (hibernateCache == 'ehcache') { %>
        log.info("Remove Cache Manager metrics");
        SortedSet<String> names = metricRegistry.getNames();
        names.forEach(metricRegistry::remove);<% } %>
        log.info("Closing Cache Manager");<% if (hibernateCache == 'ehcache') { %>
        cacheManager.shutdown();<% } %><% if (hibernateCache == 'hazelcast') { %>
        Hazelcast.shutdownAll();<% } %>
    }

    @Bean
    <%_ if (hibernateCache == 'ehcache') { _%>
    public CacheManager cacheManager(JHipsterProperties jHipsterProperties) {
        log.debug("Starting Ehcache");
        cacheManager = net.sf.ehcache.CacheManager.create();
        cacheManager.getConfiguration().setMaxBytesLocalHeap(jHipsterProperties.getCache().getEhcache().getMaxBytesLocalHeap());
        log.debug("Registering Ehcache Metrics gauges");
        <%_ if (databaseType == 'sql') { _%>
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();
        for (EntityType<?> entity : entities) {
            String name = entity.getName();
            if (name == null || entity.getJavaType() != null) {
                name = entity.getJavaType().getName();
            }
            Assert.notNull(name, "entity cannot exist without an identifier");
            reconfigureCache(name, jHipsterProperties);
            for (PluralAttribute pluralAttribute : entity.getPluralAttributes()) {
                reconfigureCache(name + "." + pluralAttribute.getName(), jHipsterProperties);
            }
        }
        <%_ } _%>
        EhCacheCacheManager ehCacheManager = new EhCacheCacheManager();
        ehCacheManager.setCacheManager(cacheManager);
        return ehCacheManager;
    <%_ } else if (hibernateCache == 'hazelcast') { _%>
    public CacheManager cacheManager(HazelcastInstance hazelcastInstance) {
        log.debug("Starting HazelcastCacheManager");
        cacheManager = new com.hazelcast.spring.cache.HazelcastCacheManager(hazelcastInstance);
        return cacheManager;
    <%_ } else { _%>
    public CacheManager cacheManager() {
        log.debug("No cache");
        cacheManager = new NoOpCacheManager();
        return cacheManager;
    <%_ } _%>
    }
    <%_ if (hibernateCache == 'ehcache' && databaseType == 'sql') { _%>

    private void reconfigureCache(String name, JHipsterProperties jHipsterProperties) {
        net.sf.ehcache.Cache cache = cacheManager.getCache(name);
        if (cache != null) {
            cache.getCacheConfiguration().setTimeToLiveSeconds(jHipsterProperties.getCache().getTimeToLiveSeconds());
            net.sf.ehcache.Ehcache decoratedCache = InstrumentedEhcache.instrument(metricRegistry, cache);
            cacheManager.replaceCacheWithDecoratedCache(cache, decoratedCache);
        }
    }
    <%_ } _%>
    <%_ if (hibernateCache == 'hazelcast') { _%>

    @Bean
    public HazelcastInstance hazelcastInstance(JHipsterProperties jHipsterProperties) {
        log.debug("Configuring Hazelcast");
        Config config = new Config();
        config.setInstanceName("<%=baseName%>");
        <%_ if (serviceDiscoveryType && (applicationType == 'microservice' || applicationType == 'gateway')) { _%>
        // The serviceId is by default the application's name, see Spring Boot's eureka.instance.appname property
        String serviceId = discoveryClient.getLocalServiceInstance().getServiceId();
        log.debug("Configuring Hazelcast clustering for instanceId: {}", serviceId);

        // In development, everything goes through 127.0.0.1, with a different port
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_DEVELOPMENT)) {
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
        <% } else { %>
        config.getNetworkConfig().setPort(5701);
        config.getNetworkConfig().setPortAutoIncrement(true);

        // In development, remove multicast auto-configuration
        if (env.acceptsProfiles(Constants.SPRING_PROFILE_DEVELOPMENT)) {
            System.setProperty("hazelcast.local.localAddress", "127.0.0.1");

            config.getNetworkConfig().getJoin().getAwsConfig().setEnabled(false);
            config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
            config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(false);
        }
        <% } %>
        <% if (hibernateCache == 'hazelcast') { %>
        config.getMapConfigs().put("default", initializeDefaultMapConfig());
        config.getMapConfigs().put("<%=packageName%>.domain.*", initializeDomainMapConfig(jHipsterProperties));<% } %><% if (clusteredHttpSession == 'hazelcast') { %>
        config.getMapConfigs().put("clustered-http-sessions", initializeClusteredSession(jHipsterProperties));<% } %>

        hazelcastInstance = HazelcastInstanceFactory.newHazelcastInstance(config);

        return hazelcastInstance;
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

        /*
            When max. size is reached, specified percentage of
            the map will be evicted. Any integer between 0 and 100.
            If 25 is set for example, 25% of the entries will
            get evicted.
         */
        mapConfig.setEvictionPercentage(25);

        return mapConfig;
    }

    private MapConfig initializeDomainMapConfig(JHipsterProperties jHipsterProperties) {
        MapConfig mapConfig = new MapConfig();

        mapConfig.setTimeToLiveSeconds(jHipsterProperties.getCache().getTimeToLiveSeconds());
        return mapConfig;
    }

    /**
    * @return the unique instance.
    */
    public static HazelcastInstance getHazelcastInstance() {
        return hazelcastInstance;
    }<% if (clusteredHttpSession == 'hazelcast') { %>

    private MapConfig initializeClusteredSession(JHipsterProperties jHipsterProperties) {
        MapConfig mapConfig = new MapConfig();

        mapConfig.setBackupCount(jHipsterProperties.getCache().getHazelcast().getBackupCount());
        mapConfig.setTimeToLiveSeconds(jHipsterProperties.getCache().getTimeToLiveSeconds());
        return mapConfig;
    }<% } %><% } %><% if (clusteredHttpSession == 'hazelcast') { %>

    /**
     * Use by Spring Security, to get events from Hazelcast.
     *
     * @return the session registry
     */
    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }<% } %>
}
