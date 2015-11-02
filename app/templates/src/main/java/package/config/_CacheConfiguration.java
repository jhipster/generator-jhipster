package <%=packageName%>.config;
<% if (hibernateCache == 'ehcache' && databaseType == 'sql') { %>
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.ehcache.InstrumentedEhcache;<% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
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
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.*;<% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
import org.springframework.core.env.Environment;<% } %><% if (hibernateCache == 'no') { %>
import org.springframework.cache.support.NoOpCacheManager; <% } %><% if (hibernateCache == 'ehcache') { %>
import org.springframework.cache.ehcache.EhCacheCacheManager;<% } %><% if (hibernateCache == 'ehcache' && databaseType == 'sql') { %>
import org.springframework.util.Assert;<% } %>

import javax.annotation.PreDestroy;
import javax.inject.Inject;<% if (hibernateCache == 'ehcache' && databaseType == 'sql') { %>
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.metamodel.EntityType;
import java.util.Set;
import java.util.SortedSet;<% } %>

@Configuration
@EnableCaching
@AutoConfigureAfter(value = { MetricsConfiguration.class<% if (databaseType == 'sql' || databaseType == 'mongodb') { %>, DatabaseConfiguration.class<% } %> })<% if (hibernateCache != 'hazelcast' && clusteredHttpSession != 'hazelcast') { %>
@Profile("!" + Constants.SPRING_PROFILE_FAST)<% } %>
public class CacheConfiguration {

    private final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);<% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>

    private static HazelcastInstance hazelcastInstance;<% } if (hibernateCache == 'ehcache' && databaseType == 'sql') { %>

    @PersistenceContext
    private EntityManager entityManager;<% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>

    @Inject
    private Environment env;<% } %><% if (hibernateCache == 'ehcache') { %>

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
        cacheManager.shutdown();<% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
        Hazelcast.shutdownAll();<% } %>
    }

    @Bean<% if (hibernateCache == 'ehcache') { %>
    public CacheManager cacheManager(JHipsterProperties jHipsterProperties) {
        log.debug("Starting Ehcache");
        cacheManager = net.sf.ehcache.CacheManager.create();
        cacheManager.getConfiguration().setMaxBytesLocalHeap(jHipsterProperties.getCache().getEhcache().getMaxBytesLocalHeap());
        log.debug("Registering Ehcache Metrics gauges");<% if (databaseType == 'sql') { %>
        Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();
        for (EntityType<?> entity : entities) {

            String name = entity.getName();
            if (name == null || entity.getJavaType() != null) {
                name = entity.getJavaType().getName();
            }
            Assert.notNull(name, "entity cannot exist without a identifier");

            net.sf.ehcache.Cache cache = cacheManager.getCache(name);
            if (cache != null) {
                cache.getCacheConfiguration().setTimeToLiveSeconds(jHipsterProperties.getCache().getTimeToLiveSeconds());
                net.sf.ehcache.Ehcache decoratedCache = InstrumentedEhcache.instrument(metricRegistry, cache);
                cacheManager.replaceCacheWithDecoratedCache(cache, decoratedCache);
            }
        }<% } %>
        EhCacheCacheManager ehCacheManager = new EhCacheCacheManager();
        ehCacheManager.setCacheManager(cacheManager);
        return ehCacheManager;<% } else if (hibernateCache == 'hazelcast') { %>
    public CacheManager cacheManager(HazelcastInstance hazelcastInstance) {
        log.debug("Starting HazelcastCacheManager");
        cacheManager = new com.hazelcast.spring.cache.HazelcastCacheManager(hazelcastInstance);
        return cacheManager;<% } else { %>
    public CacheManager cacheManager() {
        log.debug("No cache");
        cacheManager = new NoOpCacheManager();
        return cacheManager;<% } %>
    }<% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>

    @Bean
    public HazelcastInstance hazelcastInstance(JHipsterProperties jHipsterProperties) {
        log.debug("Configuring Hazelcast");
        Config config = new Config();
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
        config.getMapConfigs().put("<%=packageName%>.domain.*", initializeDomainMapConfig(jHipsterProperties));<% } %><% if (clusteredHttpSession == 'hazelcast') { %>
        config.getMapConfigs().put("my-sessions", initializeClusteredSession(jHipsterProperties));<% } %>

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
    <% } %><% if (clusteredHttpSession == 'hazelcast') { %>

    private MapConfig initializeClusteredSession(JHipsterProperties jHipsterProperties) {
        MapConfig mapConfig = new MapConfig();

        mapConfig.setBackupCount(jHipsterProperties.getCache().getHazelcast().getBackupCount());
        mapConfig.setTimeToLiveSeconds(jHipsterProperties.getCache().getTimeToLiveSeconds());
        return mapConfig;
    }<% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>

    /**
    * @return the unique instance.
    */
    public static HazelcastInstance getHazelcastInstance() {
        return hazelcastInstance;
    }<% } %>
}
