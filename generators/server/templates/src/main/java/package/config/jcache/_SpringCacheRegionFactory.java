package <%=packageName%>.config.jcache;

import org.hibernate.boot.spi.SessionFactoryOptions;
import org.hibernate.cache.CacheException;
import org.hibernate.cache.jcache.JCacheRegionFactory;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.Properties;

/**
 * Special Hibernate region factory that will convert a Spring URI (e.g. classpath:ehcache.xml) to a real URI (e.g. file://ehcache.xml).
 */
public class SpringCacheRegionFactory extends JCacheRegionFactory {

    @Override
    public void start(SessionFactoryOptions options, Properties properties) throws CacheException {
        // Translate the Spring URI to a real URI
        String uri = properties.getProperty(CONFIG_URI);
        Resource resource = new DefaultResourceLoader().getResource(uri);
        try {
            properties.setProperty(CONFIG_URI, resource.getURI().toString());
        }
        catch(IOException e) {
            throw new CacheException(e);
        }
        super.start(options, properties);
    }
}
