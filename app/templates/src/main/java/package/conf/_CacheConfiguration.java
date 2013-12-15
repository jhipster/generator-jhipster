package <%=packageName%>.conf;

<% if (hibernateCache == 'ehcache') { %>import com.codahale.metrics.ehcache.InstrumentedEhcache;
import net.sf.ehcache.Cache;
import net.sf.ehcache.Ehcache; <% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
import com.hazelcast.config.Config;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.instance.HazelcastInstanceFactory;
import com.hazelcast.config.MapConfig;<%} %><% if (hibernateCache == 'hazelcast') { %>
import com.hazelcast.config.MaxSizeConfig;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;<% if (hibernateCache == 'no') { %>
import org.springframework.cache.support.NoOpCacheManager; <% } %><% if (hibernateCache == 'ehcache') { %>
import org.springframework.cache.ehcache.EhCacheCacheManager;<% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
import org.springframework.core.env.Environment;
import javax.inject.Inject;
import javax.annotation.PostConstruct;<% } %>
import javax.annotation.PreDestroy;
import java.util.SortedSet;

@Configuration
@EnableCaching
public class CacheConfiguration {
    <% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
    private static HazelcastInstance hazelcastInstance;

    @Inject
    private Environment env;
    <% } %>

    private static final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);
    <% if (hibernateCache == 'ehcache') { %>
    private net.sf.ehcache.CacheManager cacheManager; <% } else { %>
    private CacheManager cacheManager;
    <% } %>
    @PreDestroy
    public void destroy() {
        log.info("Remove caching metrics");
        final SortedSet<String> names = WebConfigurer.METRIC_REGISTRY.getNames();
        for (String name : names) {
            WebConfigurer.METRIC_REGISTRY.remove(name);
        }

        log.info("Closing Cache manager");<% if (hibernateCache == 'ehcache') { %>
        cacheManager.shutdown();<% } %><% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
        Hazelcast.shutdownAll();<% } %>
    }

    @Bean
    public CacheManager cacheManager() {<% if (hibernateCache == 'ehcache') { %>
        log.debug("Starting Ehcache");
        cacheManager = net.sf.ehcache.CacheManager.create();

        log.debug("Registring Ehcache Metrics gauges");
        Cache userCache = cacheManager.getCache("<%=packageName%>.domain.User");
        Ehcache decoratedStatusCache = InstrumentedEhcache.instrument(WebConfigurer.METRIC_REGISTRY, userCache);
        cacheManager.replaceCacheWithDecoratedCache(userCache, decoratedStatusCache);

        Cache authoritiesCache = cacheManager.getCache("<%=packageName%>.domain.Authority");
        Ehcache decoratedAuthoritiesCache = InstrumentedEhcache.instrument(WebConfigurer.METRIC_REGISTRY, authoritiesCache);
        cacheManager.replaceCacheWithDecoratedCache(authoritiesCache, decoratedAuthoritiesCache);

        Cache persistentTokenCache = cacheManager.getCache("<%=packageName%>.domain.PersistentToken");
        Ehcache decoratedPersistentTokenCache = InstrumentedEhcache.instrument(WebConfigurer.METRIC_REGISTRY, persistentTokenCache);
        cacheManager.replaceCacheWithDecoratedCache(persistentTokenCache, decoratedPersistentTokenCache);

        EhCacheCacheManager ehCacheManager = new EhCacheCacheManager();
        ehCacheManager.setCacheManager(cacheManager);
        return ehCacheManager;<% } else if (hibernateCache == 'hazelcast') { %>
        log.debug("Starting HazelcastCacheManager");
        cacheManager = new com.hazelcast.spring.cache.HazelcastCacheManager(hazelcastInstance);
        return cacheManager;<% } else { %>
        log.debug("No cache");
        cacheManager = new NoOpCacheManager();
        return cacheManager;<% } %>
    }

    <% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
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
    }<% } %>
    <% if (hibernateCache == 'hazelcast') { %>
    private MapConfig initializeDefaultMapConfig() {
        final MapConfig mapConfig = new MapConfig();

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
        mapConfig.setMaxSizeConfig(new MaxSizeConfig(Integer.parseInt(env.getProperty("hazelcastcache.maxBytesLocalHeap"))
            , MaxSizeConfig.MaxSizePolicy.USED_HEAP_SIZE));

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

        mapConfig.setTimeToLiveSeconds(3600);
        return mapConfig;
    }<% } %>
    <% if (clusteredHttpSession == 'hazelcast') { %>
    private MapConfig initializeClusteredSession() {
        MapConfig mapConfig = new MapConfig();

        mapConfig.setBackupCount(1);
        mapConfig.setTimeToLiveSeconds(3600);
        return mapConfig;
    }
    <% } %>
    <% if (hibernateCache == 'hazelcast' || clusteredHttpSession == 'hazelcast') { %>
    /**
    * @return the unique instance
    */
    public static HazelcastInstance getHazelcastInstance() {
        return hazelcastInstance;
    }
    <% } %>

}
