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

import static com.codahale.metrics.MetricRegistry.name;

import java.lang.management.ManagementFactory;
import java.util.*;
import java.util.stream.Collectors;
import javax.cache.management.CacheStatisticsMXBean;
import javax.management.*;

import com.codahale.metrics.*;

/**
 * MetricSet retrieving JCache specific JMX metrics for every configured caches.
 */
public class JCacheGaugeSet implements MetricSet {

    private static final String M_BEAN_COORDINATES = "javax.cache:type=CacheStatistics,CacheManager=*,Cache=*";

    @Override
    public Map<String, Metric> getMetrics() {
        Set<ObjectInstance> objectInstances = getCacheMBeans();

        Map<String, Metric> gauges = new HashMap<String, Metric>();

        List<String> availableStatsNames = retrieveStatsNames();

        for (ObjectInstance objectInstance : objectInstances) {
            ObjectName objectName = objectInstance.getObjectName();
            String cacheName = objectName.getKeyProperty("Cache");

            for (String statsName : availableStatsNames) {
                JmxAttributeGauge jmxAttributeGauge = new JmxAttributeGauge(objectName, statsName);
                gauges.put(name(cacheName, toDashCase(statsName)), jmxAttributeGauge);
            }
        }

        return Collections.unmodifiableMap(gauges);
    }

    private Set<ObjectInstance> getCacheMBeans() {
        try {
            return ManagementFactory.getPlatformMBeanServer().queryMBeans(ObjectName.getInstance(M_BEAN_COORDINATES),
                null);
        } catch (MalformedObjectNameException e) {
            throw new InternalError("Shouldn't happen since the query is hardcoded", e);
        }
    }

    private List<String> retrieveStatsNames() {
        Class<?> c = CacheStatisticsMXBean.class;
        return Arrays.stream(c.getMethods())
            .filter(method -> method.getName().startsWith("get"))
            .map(method -> method.getName().substring(3))
            .collect(Collectors.toList());
    }

    private static String toDashCase(String camelCase) {
        return camelCase.replaceAll("(.)(\\p{Upper})", "$1-$2").toLowerCase();
    }
}
