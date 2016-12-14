/*
 * Copyright 2016 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.github.jhipster.config.jcache;

import java.io.IOException;
import java.util.Properties;

import org.hibernate.boot.spi.SessionFactoryOptions;
import org.hibernate.cache.CacheException;
import org.hibernate.cache.jcache.JCacheRegionFactory;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;

/**
 * Special Hibernate region factory that will convert a Spring URI (e.g. classpath:ehcache.xml) to a real URI (e.g.
 * file://ehcache.xml).
 */
public class SpringCacheRegionFactory extends JCacheRegionFactory {

    @Override
    public void start(SessionFactoryOptions options, Properties properties) throws CacheException {
        // Translate the Spring URI to a real URI
        String uri = properties.getProperty(CONFIG_URI);
        Resource resource = new DefaultResourceLoader().getResource(uri);
        try {
            properties.setProperty(CONFIG_URI, resource.getURI().toString());
        } catch (IOException e) {
            throw new CacheException(e);
        }
        super.start(options, properties);
    }
}
