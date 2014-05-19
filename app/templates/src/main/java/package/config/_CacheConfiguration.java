package <%=packageName%>.config;

import com.codahale.metrics.MetricRegistry;<% if (hibernateCache == 'ehcache' && prodDatabaseType != 'none') { %>
import com.codahale.metrics.ehcache.InstrumentedEhcache;<% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
import com.hazelcast.config.Config;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.instance.HazelcastInstanceFactory;
import com.hazelcast.config.MapConfig;<% } %><% if (hibernateCache == 'hazelcast') { %>
import com.hazelcast.config.MaxSizeConfig;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;<% if (hibernateCache == 'no') { %>
import org.springframework.cache.support.NoOpCacheManager; <% } %><% if (hibernateCache == 'ehcache' && prodDatabaseType != 'none') { %>
import org.springframework.cache.ehcache.EhCacheCacheManager;<% } %><% if (hibernateCache == 'hazelcast' || hibernateCache == 'ehcache' || clusteredHttpSession == 'hazelcast') { %>
import org.springframework.core.env.Environment;<% } %><% if (hibernateCache == 'ehcache' && prodDatabaseType != 'none') { %>
import org.springframework.util.Assert;<% } %>
<% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
import javax.annotation.PostConstruct;<% } %>
import javax.annotation.PreDestroy;
import javax.inject.Inject;<% if (hibernateCache == 'ehcache' && prodDatabaseType != 'none') { %>
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.metamodel.EntityType;
import java.util.Set;<% } %>
import java.util.SortedSet;

@Configuration
@EnableCaching
@AutoConfigureAfter(value = {MetricsConfiguration.class<% if(prodDatabaseType != 'none') { %>, DatabaseConfigurationJPA.class <% } %><% if(nosqlDatabaseType == 'mongodb') { %>, DatabaseConfigurationMongodb.class <% } %>})
public class CacheConfiguration {

    private final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);<% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>  

    private static HazelcastInstance hazelcastInstance;<% } if (hibernateCache == 'ehcache') { %>

    @PersistenceContext
    private EntityManager entityManager;<% } %><% if ((hibernateCache == 'ehcache' && prodDatabaseType != 'none') || hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>

    @Inject
    private Environment env;<% } %>

    @Inject
    private MetricRegistry metricRegistry;

<% if (hibernateCache == 'ehcache') { %>    private net.sf.ehcache.CacheManager cacheManager;
<% } else { %>    private CacheManager cacheManager;
<% } %>
    @PreDestroy
    public void destroy() {
        log.info("Remove Cache Manager metrics");
        SortedSet<String> names = metricRegistry.getNames();
        for (String name : names) {
            metricRegistry.remove(name);
        }
        log.info("Closing Cache Manager");<% if (hibernateCache == 'ehcache') { %>
        cacheManager.shutdown();<% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
        Hazelcast.shutdownAll();<% } %>
    }

    @Bean
    public CacheManager cacheManager() {<% if (hibernateCache == 'ehcache') { %>
        log.debug("Starting Ehcache");
        cacheManager = net.sf.ehcache.CacheManager.create();
        cacheManager.getConfiguration().setMaxBytesLocalHeap(env.getProperty("cache.ehcache.maxBytesLocalHeap", String.class, "16M"));
        log.debug("Registring Ehcache Metrics gauges");<% if (prodDatabaseType != 'none') { %>
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();
        for (EntityType<?> entity : entities) {
            
            String name = entity.getName();
            if (name == null || entity.getJavaType() != null) {
                name = entity.getJavaType().getName();
            }
            Assert.notNull(name, "entity cannot exist without a identifier");
            
            net.sf.ehcache.Cache cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.getCacheConfiguration().setTimeToLiveSeconds(env.getProperty("cache.timeToLiveSeconds", Integer.class, 3600));
                net.sf.ehcache.Ehcache decoratedCache = InstrumentedEhcache.instrument(metricRegistry, cache);
                cacheManager.replaceCacheWithDecoratedCache(cache, decoratedCache);
            }
        }<% } %>
        EhCacheCacheManager ehCacheManager = new EhCacheCacheManager();
        ehCacheManager.setCacheManager(cacheManager);
        return ehCacheManager;<% } else if (hibernateCache == 'hazelcast') { %>
        log.debug("Starting HazelcastCacheManager");
        cacheManager = new com.hazelcast.spring.cache.HazelcastCacheManager(hazelcastInstance);
        return cacheManager;<% } else { %>
        log.debug("No cache");
        cacheManager = new NoOpCacheManager();
        return cacheManager;<% } %>
    }<% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>

    @PostConstruct
    private HazelcastInstance hazelcastInstance() {
        final Config config = new Config();
        config.setInstanceName("<%=baseName%>");
        config.getNetworkConfig().setPort(5701);
        config.getNetworkConfig().setPortAutoIncrement(true);

        if (env.acceptsProfiles(Constants.SPRING_PROFILE_DEVELOPMENT)) {
          System.setProperty("hazelcast.local.localAddress", "127.0.0.1");

          config.getNetworkConfig().getJoin().getAwsConfig().setEnabled(false);
          config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
          config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(false);
        }
        <% if (hibernateCache == 'hazelcast') { %>
        config.getMapConfigs().put("default", initializeDefaultMapConfig());
        config.getMapConfigs().put("<%=packageName%>.domain.*", initializeDomainMapConfig());<% } %><% if (clusteredHttpSession == 'hazelcast') { %>
        config.getMapConfigs().put("my-sessions", initializeClusteredSession());<% } %>

        hazelcastInstance = HazelcastInstanceFactory.newHazelcastInstance(config);

        return hazelcastInstance;
    }<% } %><% if (hibernateCache == 'hazelcast') { %>

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
        mapConfig.setEvictionPolicy(MapConfig.EvictionPolicy.LRU);

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

    private MapConfig initializeDomainMapConfig() {
        MapConfig mapConfig = new MapConfig();

        mapConfig.setTimeToLiveSeconds(env.getProperty("cache.timeToLiveSeconds", Integer.class, 3600));
        return mapConfig;
    }
    <% } %><% if (clusteredHttpSession == 'hazelcast') { %>

    private MapConfig initializeClusteredSession() {
        MapConfig mapConfig = new MapConfig();

        mapConfig.setBackupCount(env.getProperty("cache.hazelcast.backupCount", Integer.class, 1));
        mapConfig.setTimeToLiveSeconds(env.getProperty("cache.timeToLiveSeconds", Integer.class, 3600));
        return mapConfig;
    }<% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
    
    /**
    * @return the unique instance.
    */
    public static HazelcastInstance getHazelcastInstance() {
        return hazelcastInstance;
    }<% } %>
}
