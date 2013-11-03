package <%=packageName%>.conf;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.ehcache.EhCacheCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.annotation.PreDestroy;
import javax.inject.Inject;

@Configuration
@EnableCaching
public class CacheConfiguration {

    private static final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);

    private net.sf.ehcache.CacheManager cacheManager;

    @Inject
    private Environment env;

    @PreDestroy
    public void destroy() {
        log.info("Closing Ehcache");
        cacheManager.shutdown();
    }

    @Bean
    public CacheManager cacheManager() {
		log.debug("Starting Ehcache");
        cacheManager = net.sf.ehcache.CacheManager.create();
        EhCacheCacheManager ehCacheManager = new EhCacheCacheManager();
        ehCacheManager.setCacheManager(cacheManager);
        return ehCacheManager;
    }
}
