package <%=packageName%>.conf;

import com.codahale.metrics.ehcache.InstrumentedEhcache;
import net.sf.ehcache.Cache;
import net.sf.ehcache.Ehcache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PreDestroy;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private static final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);

    private net.sf.ehcache.CacheManager cacheManager;

    @PreDestroy
    public void destroy() {
        log.info("Closing Ehcache");
        cacheManager.shutdown();
    }

    @Bean
    public CacheManager cacheManager() {
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
        return ehCacheManager;
    }
}
