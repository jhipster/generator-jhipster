package <%=packageName%>.conf;

<% if (hibernateCache == 'ehcache') { %>import com.codahale.metrics.ehcache.InstrumentedEhcache;
import net.sf.ehcache.Cache;
import net.sf.ehcache.Ehcache; <% } %><% if (hibernateCache == 'hazelcast') { %>
import com.hazelcast.config.Config;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;<% } %>
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.annotation.PreDestroy;<% if (hibernateCache == 'no') { %>
import org.springframework.cache.support.NoOpCacheManager; <% } %><% if (hibernateCache == 'ehcache') { %>
import org.springframework.cache.ehcache.EhCacheCacheManager;<% } %>

@Configuration
@EnableCaching
public class CacheConfiguration {

    private static final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);
    <% if (hibernateCache == 'ehcache') { %>
    private net.sf.ehcache.CacheManager cacheManager; <% } else { %>
    private CacheManager cacheManager;
    <% } %>
    @PreDestroy
    public void destroy() {
        log.info("Closing Cache manager");<% if (hibernateCache == 'ehcache') { %>
        cacheManager.shutdown();<% } %><% if (hibernateCache == 'hazelcast') { %>
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
        Config config = new Config();
        config.setInstanceName("<%=baseName%>");
        config.getNetworkConfig().setPortAutoIncrement(true);
        final HazelcastInstance hazelcastInstance = Hazelcast.newHazelcastInstance(config);
        cacheManager = new com.hazelcast.spring.cache.HazelcastCacheManager(hazelcastInstance);
        return cacheManager;<% } else { %>
        log.debug("No cache");
        cacheManager = new NoOpCacheManager();
        return cacheManager;<% } %>
    }
}
