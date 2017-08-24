<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.config;
<%_ if (hibernateCache === 'ehcache') { _%>

import io.github.jhipster.config.JHipsterProperties;
import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.ehcache.expiry.Duration;
import org.ehcache.expiry.Expirations;
import org.ehcache.jsr107.Eh107Configuration;

import java.util.concurrent.TimeUnit;

<%_ } _%>
<%_ if (hibernateCache === 'hazelcast' || clusteredHttpSession === 'hazelcast') { _%>

import io.github.jhipster.config.JHipsterConstants;
import io.github.jhipster.config.JHipsterProperties;

import com.hazelcast.config.Config;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.config.MapConfig;
import com.hazelcast.config.EvictionPolicy;
import com.hazelcast.config.MaxSizeConfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
    <%_ if (serviceDiscoveryType === 'eureka') { _%>
import org.springframework.beans.factory.annotation.Autowired;
    <%_ } _%>
<%_ } _%>
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
<%_ if (hibernateCache === 'ehcache') { _%>
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
<%_ } _%>
<%_ if (hibernateCache === 'hazelcast' || clusteredHttpSession === 'hazelcast') { _%>
    <%_ if (serviceDiscoveryType === 'eureka') { _%>
import org.springframework.boot.autoconfigure.web.ServerProperties;
    <%_ } _%>

import org.springframework.cache.CacheManager;
<%_ } _%>
import org.springframework.cache.annotation.EnableCaching;
<%_ if (serviceDiscoveryType === 'eureka') { _%>
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.serviceregistry.Registration;
<%_ } _%>
import org.springframework.context.annotation.*;<% if (hibernateCache === 'hazelcast' || clusteredHttpSession === 'hazelcast') { %>
import org.springframework.core.env.Environment;<% } %>
<%_ if (clusteredHttpSession === 'hazelcast') { _%>
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
<%_ } _%>
<%_ if (hibernateCache === 'hazelcast' || clusteredHttpSession === 'hazelcast') { _%>

import javax.annotation.PreDestroy;
<%_ } _%>
<%_ if (hibernateCache === 'infinispan') { _%>
import org.infinispan.configuration.cache.CacheMode;
import org.infinispan.configuration.cache.ConfigurationBuilder;
import org.infinispan.configuration.global.GlobalConfigurationBuilder;
import infinispan.autoconfigure.embedded.InfinispanCacheConfigurer;
import infinispan.autoconfigure.embedded.InfinispanGlobalConfigurer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.github.jhipster.config.JHipsterProperties;
import java.util.concurrent.TimeUnit;
import org.infinispan.eviction.EvictionType;
import org.infinispan.manager.EmbeddedCacheManager;
import org.infinispan.transaction.TransactionMode;
import infinispan.autoconfigure.embedded.InfinispanEmbeddedCacheManagerAutoConfiguration;
import org.infinispan.jcache.embedded.ConfigurationAdapter;
import org.infinispan.jcache.embedded.JCache;
import org.infinispan.jcache.embedded.JCacheManager;
import javax.cache.Caching;
import javax.cache.spi.CachingProvider;
import java.net.URI;
    <%_ if (serviceDiscoveryType === 'eureka') { _%>
import org.springframework.beans.factory.annotation.Autowired;
import org.infinispan.remoting.transport.jgroups.JGroupsTransport;
import org.jgroups.Channel;
import org.jgroups.JChannel;
import org.jgroups.PhysicalAddress;
import org.jgroups.protocols.*;
import org.jgroups.protocols.pbcast.GMS;
import org.jgroups.protocols.pbcast.NAKACK2;
import org.jgroups.protocols.pbcast.STABLE;
import org.jgroups.stack.IpAddress;
import org.jgroups.stack.ProtocolStack;
import java.net.InetAddress;
import org.springframework.beans.factory.BeanInitializationException;
import java.util.ArrayList;
import java.util.List;
    <%_ } _%>
<%_ } _%>

@Configuration
@EnableCaching
@AutoConfigureAfter(value = { MetricsConfiguration.class })
@AutoConfigureBefore(value = { WebConfigurer.class<% if (databaseType === 'sql' || databaseType === 'mongodb') { %>, DatabaseConfiguration.class<% } %> })
<%_ if (hibernateCache === 'infinispan') { _%>
@Import(InfinispanEmbeddedCacheManagerAutoConfiguration.class)
<%_ } _%>
public class CacheConfiguration {
    <%_ if (hibernateCache === 'ehcache') { _%>

    private final javax.cache.configuration.Configuration<Object, Object> jcacheConfiguration;

    public CacheConfiguration(JHipsterProperties jHipsterProperties) {
        JHipsterProperties.Cache.Ehcache ehcache =
            jHipsterProperties.getCache().getEhcache();

        jcacheConfiguration = Eh107Configuration.fromEhcacheCacheConfiguration(
            CacheConfigurationBuilder.newCacheConfigurationBuilder(Object.class, Object.class,
                ResourcePoolsBuilder.heap(ehcache.getMaxEntries()))
                .withExpiry(Expirations.timeToLiveExpiration(Duration.of(ehcache.getTimeToLiveSeconds(), TimeUnit.SECONDS)))
                .build());
    }

    @Bean
    public JCacheManagerCustomizer cacheManagerCustomizer() {
        return cm -> {
            <%_ if (!skipUserManagement) { _%>
            cm.createCache(<%=packageName%>.domain.User.class.getName(), jcacheConfiguration);
            cm.createCache(<%=packageName%>.domain.Authority.class.getName(), jcacheConfiguration);
            cm.createCache(<%=packageName%>.domain.User.class.getName() + ".authorities", jcacheConfiguration);
            <%_ if (authenticationType === 'session') { _%>
            cm.createCache(<%=packageName%>.domain.PersistentToken.class.getName(), jcacheConfiguration);
            cm.createCache(<%=packageName%>.domain.User.class.getName() + ".persistentTokens", jcacheConfiguration);
            <%_ } _%>
            <%_ if (enableSocialSignIn) { _%>
            cm.createCache(<%=packageName%>.domain.SocialUserConnection.class.getName(), jcacheConfiguration);
            <%_ } _%>
            <%_ } _%>
            // jhipster-needle-ehcache-add-entry
        };
    }
    <%_ } _%>
    <%_ if (hibernateCache === 'hazelcast' || clusteredHttpSession === 'hazelcast') { _%>

    private final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);

    private final Environment env;
        <%_ if (serviceDiscoveryType === 'eureka') { _%>

    private final ServerProperties serverProperties;

    private final DiscoveryClient discoveryClient;

    private Registration registration;
        <%_ } _%>

    public CacheConfiguration(<% if (hibernateCache === 'hazelcast' || clusteredHttpSession === 'hazelcast') { %>Environment env<% if (serviceDiscoveryType === 'eureka') { %>, ServerProperties serverProperties, DiscoveryClient discoveryClient<% } } %>) {
        this.env = env;
        <%_ if (serviceDiscoveryType === 'eureka') { _%>
        this.serverProperties = serverProperties;
        this.discoveryClient = discoveryClient;
        <%_ } _%>
    }
        <%_ if (serviceDiscoveryType === 'eureka') { _%>

    @Autowired(required = false)
    public void setRegistration(Registration registration) {
        this.registration = registration;
    }
        <%_ } _%>

    @PreDestroy
    public void destroy() {
        log.info("Closing Cache Manager");
        Hazelcast.shutdownAll();
    }

    @Bean
    public CacheManager cacheManager(HazelcastInstance hazelcastInstance) {
        log.debug("Starting HazelcastCacheManager");
        CacheManager cacheManager = new com.hazelcast.spring.cache.HazelcastCacheManager(hazelcastInstance);
        return cacheManager;
    }

    @Bean
    public HazelcastInstance hazelcastInstance(JHipsterProperties jHipsterProperties) {
        log.debug("Configuring Hazelcast");
        HazelcastInstance hazelCastInstance = Hazelcast.getHazelcastInstanceByName("<%=baseName%>");
        if (hazelCastInstance != null) {
            log.debug("Hazelcast already initialized");
            return hazelCastInstance;
        }
        Config config = new Config();
        config.setInstanceName("<%=baseName%>");
        <%_ if (serviceDiscoveryType === 'eureka') { _%>
        config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
        if (this.registration == null) {
            log.warn("No discovery service is set up, Hazelcast cannot create a cluster.");
        } else {
            // The serviceId is by default the application's name, see Spring Boot's eureka.instance.appname property
            String serviceId = registration.getServiceId();
            log.debug("Configuring Hazelcast clustering for instanceId: {}", serviceId);
            // In development, everything goes through 127.0.0.1, with a different port
            if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT)) {
                log.debug("Application is running with the \"dev\" profile, Hazelcast " +
                          "cluster will only work with localhost instances");

                System.setProperty("hazelcast.local.localAddress", "127.0.0.1");
                config.getNetworkConfig().setPort(serverProperties.getPort() + 5701);
                config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(true);
                for (ServiceInstance instance : discoveryClient.getInstances(serviceId)) {
                    String clusterMember = "127.0.0.1:" + (instance.getPort() + 5701);
                    log.debug("Adding Hazelcast (dev) cluster member " + clusterMember);
                    config.getNetworkConfig().getJoin().getTcpIpConfig().addMember(clusterMember);
                }
            } else { // Production configuration, one host per instance all using port 5701
                config.getNetworkConfig().setPort(5701);
                config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(true);
                for (ServiceInstance instance : discoveryClient.getInstances(serviceId)) {
                    String clusterMember = instance.getHost() + ":5701";
                    log.debug("Adding Hazelcast (prod) cluster member " + clusterMember);
                    config.getNetworkConfig().getJoin().getTcpIpConfig().addMember(clusterMember);
                }
            }
        }
        <%_ } else { _%>
        config.getNetworkConfig().setPort(5701);
        config.getNetworkConfig().setPortAutoIncrement(true);

        // In development, remove multicast auto-configuration
        if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT)) {
            System.setProperty("hazelcast.local.localAddress", "127.0.0.1");

            config.getNetworkConfig().getJoin().getAwsConfig().setEnabled(false);
            config.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
            config.getNetworkConfig().getJoin().getTcpIpConfig().setEnabled(false);
        }
        <%_ } _%>
        config.getMapConfigs().put("default", initializeDefaultMapConfig());
        <%_ if (hibernateCache === 'hazelcast') { _%>
        config.getMapConfigs().put("<%=packageName%>.domain.*", initializeDomainMapConfig(jHipsterProperties));
        <%_ } _%>
        <%_ if (clusteredHttpSession === 'hazelcast') { _%>
        config.getMapConfigs().put("clustered-http-sessions", initializeClusteredSession(jHipsterProperties));
        <%_ } _%>
        return Hazelcast.newHazelcastInstance(config);
    }

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

        return mapConfig;
    }
    <%_ if (hibernateCache === 'hazelcast') { _%>

    private MapConfig initializeDomainMapConfig(JHipsterProperties jHipsterProperties) {
        MapConfig mapConfig = new MapConfig();
        mapConfig.setTimeToLiveSeconds(jHipsterProperties.getCache().getHazelcast().getTimeToLiveSeconds());
        return mapConfig;
    }
    <%_ } _%>
    <%_ if (clusteredHttpSession === 'hazelcast') { _%>

    private MapConfig initializeClusteredSession(JHipsterProperties jHipsterProperties) {
        MapConfig mapConfig = new MapConfig();
        mapConfig.setBackupCount(jHipsterProperties.getCache().getHazelcast().getBackupCount());
        mapConfig.setTimeToLiveSeconds(jHipsterProperties.getCache().getHazelcast().getTimeToLiveSeconds());
        return mapConfig;
    }

    /**
     * Used by Spring Security, to get events from Hazelcast.
     *
     * @return the session registry
     */
    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }
    <%_ } _%>
    <%_ } _%>
    <%_ if (hibernateCache === 'infinispan') { _%>

    private final Logger log = LoggerFactory.getLogger(CacheConfiguration.class);

    // Initialize the cache in a non Spring-managed bean
    private static EmbeddedCacheManager cacheManager;
        <%_ if (serviceDiscoveryType === 'eureka') { _%>

    private DiscoveryClient discoveryClient;

    private Registration registration;

    @Autowired(required = false)
    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    @Autowired(required = false)
    public void setDiscoveryClient(DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
    }
        <%_ } _%>

    public static EmbeddedCacheManager getCacheManager(){
        return cacheManager;
    }

    public static void setCacheManager(EmbeddedCacheManager cacheManager) {
        CacheConfiguration.cacheManager = cacheManager;
    }

    /**
     * Inject a {@link org.infinispan.configuration.global.GlobalConfiguration GlobalConfiguration} for Infinispan cache.
     * <p>
     * If the JHipster Registry is enabled, then the host list will be populated
     * from Eureka.
     *
     * <p>
     * If the JHipster Registry is not enabled, host discovery will be based on
     * the default transport settings defined in the 'config-file' packaged within
     * the Jar. The 'config-file' can be overridden using the application property
     * <i>jhipster.cache.inifnispan.config-file</i>
     *
     * <p>
     * If the JHipster Registry is not defined, you have the choice of 'config-file'
     * based on the underlying platform for hosts discovery. Infinispan
     * supports discovery natively for most of the platforms like Kubernets/OpenShift,
     * AWS, Azure and Google.
     *
     */
    @Bean
    public InfinispanGlobalConfigurer globalConfiguration(JHipsterProperties jHipsterProperties) {
        log.info("Defining Infinispan Global Configuration");
        <%_ if (serviceDiscoveryType === 'eureka') { _%>
            if(this.registration == null) { // if registry is not defined, use native discovery
                log.warn("No discovery service is set up, Infinispan will use default discovery for cluster formation");
                return () -> GlobalConfigurationBuilder
                    .defaultClusteredBuilder().transport().defaultTransport()
                    .addProperty("configurationFile", jHipsterProperties.getCache().getInfinispan().getConfigFile())
                    .clusterName("infinispan-<%=baseName%>-cluster").globalJmxStatistics()
                    .enabled(jHipsterProperties.getCache().getInfinispan().isStatsEnabled())
                    .allowDuplicateDomains(true).build();
            }
            return () -> GlobalConfigurationBuilder
                    .defaultClusteredBuilder().transport().transport(new JGroupsTransport(getTransportChannel()))
                    .clusterName("infinispan-<%=baseName%>-cluster").globalJmxStatistics()
                    .enabled(jHipsterProperties.getCache().getInfinispan().isStatsEnabled())
                    .allowDuplicateDomains(true).build();
        <%_ }else { _%>
            return () -> GlobalConfigurationBuilder
                    .defaultClusteredBuilder().transport().defaultTransport()
                    .addProperty("configurationFile", jHipsterProperties.getCache().getInfinispan().getConfigFile())
                    .clusterName("infinispan-<%=baseName%>-cluster").globalJmxStatistics()
                    .enabled(jHipsterProperties.getCache().getInfinispan().isStatsEnabled())
                    .allowDuplicateDomains(true).build();
        <%_ } _%>
    }

    /**
     * Initialize cache configuration for Hibernate L2 cache and Spring Cache.
     * <p>
     * There are three different modes: local, distributed and replicated, and L2 cache options are pre-configured.
     *
     * <p>
     * It supports both jCache and Spring cache abstractions.
     * <p>
     * Usage:
     *  <ol>
     *      <li>
     *          jCache:
     *          <pre class="code">@CacheResult(cacheName="dist-app-data") </pre>
     *              - for creating a distributed cache. In a similar way other cache names and options can be used
     *      </li>
     *      <li>
     *          Spring Cache:
     *          <pre class="code">@Cacheable(value = "repl-app-data") </pre>
     *              - for creating a replicated cache. In a similar way other cache names and options can be used
     *      </li>
     *      <li>
     *          Cache manager can also be injected through DI/CDI and data can be manipulated using Infinispan APIs,
     *          <pre class="code">
     *          &#064;Autowired (or) &#064;Inject
     *          private EmbeddedCacheManager cacheManager;
     *
     *          void cacheSample(){
     *              cacheManager.getCache("dist-app-data").put("hi", "there");
     *          }
     *          </pre>
     *      </li>
     *  </ol>
     *
     */
    @Bean
    public InfinispanCacheConfigurer cacheConfigurer(JHipsterProperties jHipsterProperties) {
        log.info("Defining {} configuration", "app-data for local, replicated and distributed modes");
        final JHipsterProperties.Cache.Infinispan cacheInfo = jHipsterProperties.getCache().getInfinispan();

        return manager -> {
            // initialize application cache
            manager.defineConfiguration("local-app-data", new ConfigurationBuilder().clustering().cacheMode(CacheMode.LOCAL)
                .jmxStatistics().enabled(cacheInfo.isStatsEnabled())
                .eviction().type(EvictionType.COUNT).size(cacheInfo.getLocal().getMaxEntries()).expiration()
                .lifespan(cacheInfo.getLocal().getTimeToLiveSeconds(), TimeUnit.MINUTES).build());
            manager.defineConfiguration("dist-app-data", new ConfigurationBuilder()
                .clustering().cacheMode(CacheMode.DIST_SYNC).hash().numOwners(cacheInfo.getDistributed().getInstanceCount())
                .jmxStatistics().enabled(cacheInfo.isStatsEnabled()).eviction()
                .type(EvictionType.COUNT).size(cacheInfo.getDistributed().getMaxEntries()).expiration().lifespan(cacheInfo.getDistributed()
                .getTimeToLiveSeconds(), TimeUnit.MINUTES).build());
            manager.defineConfiguration("repl-app-data", new ConfigurationBuilder().clustering().cacheMode(CacheMode.REPL_SYNC)
                .jmxStatistics().enabled(cacheInfo.isStatsEnabled())
                .eviction().type(EvictionType.COUNT).size(cacheInfo.getReplicated()
                .getMaxEntries()).expiration().lifespan(cacheInfo.getReplicated().getTimeToLiveSeconds(), TimeUnit.MINUTES).build());

            // initilaize Hiberante L2 cache
            manager.defineConfiguration("entity", new ConfigurationBuilder().clustering().cacheMode(CacheMode.INVALIDATION_SYNC)
                .jmxStatistics().enabled(cacheInfo.isStatsEnabled())
                .locking().concurrencyLevel(1000).lockAcquisitionTimeout(15000).build());
            manager.defineConfiguration("replicated-entity", new ConfigurationBuilder().clustering().cacheMode(CacheMode.REPL_SYNC)
                .jmxStatistics().enabled(cacheInfo.isStatsEnabled())
                .locking().concurrencyLevel(1000).lockAcquisitionTimeout(15000).build());
            manager.defineConfiguration("local-query", new ConfigurationBuilder().clustering().cacheMode(CacheMode.LOCAL)
                .jmxStatistics().enabled(cacheInfo.isStatsEnabled())
                .locking().concurrencyLevel(1000).lockAcquisitionTimeout(15000).build());
            manager.defineConfiguration("replicated-query", new ConfigurationBuilder().clustering().cacheMode(CacheMode.REPL_ASYNC)
                .jmxStatistics().enabled(cacheInfo.isStatsEnabled())
                .locking().concurrencyLevel(1000).lockAcquisitionTimeout(15000).build());
            manager.defineConfiguration("timestamps", new ConfigurationBuilder().clustering().cacheMode(CacheMode.REPL_ASYNC)
                .jmxStatistics().enabled(cacheInfo.isStatsEnabled())
                .locking().concurrencyLevel(1000).lockAcquisitionTimeout(15000).build());
            manager.defineConfiguration("pending-puts", new ConfigurationBuilder().clustering().cacheMode(CacheMode.LOCAL)
                .jmxStatistics().enabled(cacheInfo.isStatsEnabled())
                .simpleCache(true).transaction().transactionMode(TransactionMode.NON_TRANSACTIONAL).expiration().maxIdle(60000).build());

            setCacheManager(manager);
        };
    }

    /**
     * <p>
     * Instance of {@link JCacheManager} with cache being managed by the underlying Infinispan layer. This helps to record stats
     * info if enabled and the same is accessible through MBX:javax.cache,type=CacheStatistics.
     *
     * <p>
     * jCache stats are at instance level. If you need stats at clustering level, then it needs to be retrieved from MBX:org.infinispan
     *
     */
    @Bean
    public JCacheManager getJCacheManager(EmbeddedCacheManager cacheManager, JHipsterProperties jHipsterProperties){
        return new InfinispanJCacheManager(Caching.getCachingProvider().getDefaultURI(), cacheManager,
            Caching.getCachingProvider(), jHipsterProperties);
    }

    class InfinispanJCacheManager extends JCacheManager {

        public InfinispanJCacheManager(URI uri, EmbeddedCacheManager cacheManager, CachingProvider provider,
                                       JHipsterProperties jHipsterProperties) {
            super(uri, cacheManager, provider);
            // register individual caches to make the stats info available.
            <%_ if (!skipUserManagement) { _%>
            registerPredefinedCache(<%=packageName%>.domain.User.class.getName(), new JCache<Object, Object>(
                cacheManager.getCache(<%=packageName%>.domain.User.class.getName()).getAdvancedCache(), this,
                ConfigurationAdapter.create()));
            registerPredefinedCache(<%=packageName%>.domain.Authority.class.getName(), new JCache<Object, Object>(
                cacheManager.getCache(<%=packageName%>.domain.Authority.class.getName()).getAdvancedCache(), this,
                ConfigurationAdapter.create()));
            registerPredefinedCache(<%=packageName%>.domain.User.class.getName() + ".authorities", new JCache<Object, Object>(
                cacheManager.getCache(<%=packageName%>.domain.User.class.getName() + ".authorities").getAdvancedCache(), this,
                ConfigurationAdapter.create()));
                <%_ if (authenticationType === 'session') { _%>
            registerPredefinedCache(<%=packageName%>.domain.PersistentToken.class.getName(), new JCache<Object, Object>(
                cacheManager.getCache(<%=packageName%>.domain.PersistentToken.class.getName()).getAdvancedCache(), this,
                ConfigurationAdapter.create()));
            registerPredefinedCache(<%=packageName%>.domain.User.class.getName() + ".persistentTokens", new JCache<Object, Object>(
                cacheManager.getCache(<%=packageName%>.domain.User.class.getName() + ".persistentTokens").getAdvancedCache(), this,
                ConfigurationAdapter.create()));
                <%_ } _%>
                <%_ if (enableSocialSignIn) { _%>
            registerPredefinedCache(<%=packageName%>.domain.SocialUserConnection.class.getName(), new JCache<Object, Object>(
                cacheManager.getCache(<%=packageName%>.domain.SocialUserConnection.class.getName()).getAdvancedCache(), this,
                ConfigurationAdapter.create()));
                <%_ } _%>
            <%_ } _%>
            // jhipster-needle-infinispan-add-entry
            if (jHipsterProperties.getCache().getInfinispan().isStatsEnabled()) {
                for (String cacheName : cacheManager.getCacheNames()) {
                    enableStatistics(cacheName, true);
                }
            }
        }
    }

        <%_ if(serviceDiscoveryType === 'eureka') { _%>
    /**
     * TCP channel with the host details populated from the JHipster Registry.
     * <p>
     * MPING multicast is replaced with TCPPING with the host details discovered
     * from registry and sends only unicast messages to the host list.
     */
    private Channel getTransportChannel() {
        JChannel channel = new JChannel(false);
        List<PhysicalAddress> initialHosts = new ArrayList<>();
        try {
            for (ServiceInstance instance : discoveryClient.getInstances(registration.getServiceId())) {
                String clusterMember = instance.getHost() + ":7800";
                log.debug("Adding Infinispan cluster member " + clusterMember);
                initialHosts.add(new IpAddress(clusterMember));
            }
            TCP tcp = new TCP();
            tcp.setBindAddress(InetAddress.getLocalHost());
            tcp.setBindPort(7800);
            tcp.setThreadPoolMinThreads(2);
            tcp.setThreadPoolMaxThreads(30);
            tcp.setThreadPoolQueueEnabled(false);
            tcp.setThreadPoolKeepAliveTime(60000);
            tcp.setOOBThreadPoolMinThreads(2);
            tcp.setOOBThreadPoolMaxThreads(200);
            tcp.setOOBThreadPoolKeepAliveTime(60000);
            tcp.setOOBThreadPoolQueueEnabled(false);

            TCPPING tcpping = new TCPPING();
            initialHosts.add(new IpAddress(InetAddress.getLocalHost(), 7800));
            tcpping.setInitialHosts(initialHosts);
            tcpping.setErgonomics(false);
            tcpping.setPortRange(10);
            tcpping.sendCacheInformation();

            NAKACK2 nakack = new NAKACK2();
            nakack.setUseMcastXmit(false);
            nakack.setDiscardDeliveredMsgs(false);

            MERGE3 merge = new MERGE3();
            merge.setMinInterval(10000);
            merge.setMaxInterval(30000);

            FD_ALL fd = new FD_ALL();
            fd.setTimeout(60000);
            fd.setInterval(15000);
            fd.setTimeoutCheckInterval(5000);

            ProtocolStack stack = new ProtocolStack();
            // Order shouldn't be changed
            stack
                .addProtocol(tcp)
                .addProtocol(tcpping)
                .addProtocol(merge)
                .addProtocol(new FD_SOCK())
                .addProtocol(fd)
                .addProtocol(new VERIFY_SUSPECT())
                .addProtocol(nakack)
                .addProtocol(new UNICAST3())
                .addProtocol(new STABLE())
                .addProtocol(new GMS())
                .addProtocol(new MFC())
                .addProtocol(new FRAG2());
            channel.setProtocolStack(stack);
            stack.init();
        } catch (Exception e) {
            throw new BeanInitializationException("Cache (Infinispan protocol stack) configuration failed", e);
        }
        return channel;
    }
        <%_ } _%>
    <%_ } _%>
}
