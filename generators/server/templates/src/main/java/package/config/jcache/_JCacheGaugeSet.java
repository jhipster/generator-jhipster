package <%=packageName%>.config.jcache;

import com.codahale.metrics.JmxAttributeGauge;
import com.codahale.metrics.Metric;
import com.codahale.metrics.MetricSet;

import java.lang.management.ManagementFactory;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import javax.cache.management.CacheStatisticsMXBean;
import javax.management.MalformedObjectNameException;
import javax.management.ObjectInstance;
import javax.management.ObjectName;

import static com.codahale.metrics.MetricRegistry.name;

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
            return ManagementFactory.getPlatformMBeanServer().queryMBeans(ObjectName.getInstance(M_BEAN_COORDINATES), null);
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
