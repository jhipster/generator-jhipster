package io.github.jhipster.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.util.Lists.newArrayList;

import java.lang.reflect.Method;
import java.util.*;

import org.junit.Before;
import org.junit.Test;

public class JHipsterPropertiesTest {

    private JHipsterProperties properties;

    @Before
    public void setup() {
        properties = new JHipsterProperties();
    }

    @Test
    public void testComplete() throws Exception {
        // Slightly pedantic; this checks if there are tests for each of the properties.
        Set<String> set = new LinkedHashSet<>(64, 1F);
        reflect(properties, set, "test");
        for (String name : set) {
            this.getClass().getDeclaredMethod(name);
        }
    }

    private void reflect(Object obj, Set<String> dst, String prefix) throws Exception {
        Class<?> src = obj.getClass();
        for (Method method : src.getDeclaredMethods()) {
            String name = method.getName();
            if (name.startsWith("get")) {
                Object res = method.invoke(obj, (Object[]) null);
                if (res != null && src.equals(res.getClass().getDeclaringClass())) {
                    reflect(res, dst, prefix + name.substring(3));
                }
            } else if (name.startsWith("set")) {
                dst.add(prefix + name.substring(3));
            }
        }
    }

    @Test
    public void testAsyncCorePoolSize() {
        JHipsterProperties.Async obj = properties.getAsync();
        int val = JHipsterDefaults.Async.corePoolSize;
        assertThat(obj.getCorePoolSize()).isEqualTo(val);
        val++;
        obj.setCorePoolSize(val);
        assertThat(obj.getCorePoolSize()).isEqualTo(val);
    }

    @Test
    public void testAsyncMaxPoolSize() {
        JHipsterProperties.Async obj = properties.getAsync();
        int val = JHipsterDefaults.Async.maxPoolSize;
        assertThat(obj.getMaxPoolSize()).isEqualTo(val);
        val++;
        obj.setMaxPoolSize(val);
        assertThat(obj.getMaxPoolSize()).isEqualTo(val);
    }

    @Test
    public void testAsyncQueueCapacity() {
        JHipsterProperties.Async obj = properties.getAsync();
        int val = JHipsterDefaults.Async.queueCapacity;
        assertThat(obj.getQueueCapacity()).isEqualTo(val);
        val++;
        obj.setQueueCapacity(val);
        assertThat(obj.getQueueCapacity()).isEqualTo(val);
    }

    @Test
    public void testHttpVersion() {
        JHipsterProperties.Http.Version[] versions = JHipsterProperties.Http.Version.values();
        JHipsterProperties.Http obj = properties.getHttp();
        String str = JHipsterDefaults.Http.version.toString();
        JHipsterProperties.Http.Version val = JHipsterProperties.Http.Version.valueOf(str);
        assertThat(obj.getVersion()).isEqualTo(val);
        val = versions[(1 + val.ordinal()) % versions.length];
        obj.setVersion(val);
        assertThat(obj.getVersion()).isEqualTo(val);
    }

    @Test
    public void testHttpCacheTimeToLiveInDays() {
        JHipsterProperties.Http.Cache obj = properties.getHttp().getCache();
        int val = JHipsterDefaults.Http.Cache.timeToLiveInDays;
        assertThat(obj.getTimeToLiveInDays()).isEqualTo(val);
        val++;
        obj.setTimeToLiveInDays(val);
        assertThat(obj.getTimeToLiveInDays()).isEqualTo(val);
    }

    @Test
    public void testCacheHazelcastTimeToLiveSeconds() {
        JHipsterProperties.Cache.Hazelcast obj = properties.getCache().getHazelcast();
        int val = JHipsterDefaults.Cache.Hazelcast.timeToLiveSeconds;
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
        val++;
        obj.setTimeToLiveSeconds(val);
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
    }

    @Test
    public void testCacheHazelcastBackupCount() {
        JHipsterProperties.Cache.Hazelcast obj = properties.getCache().getHazelcast();
        int val = JHipsterDefaults.Cache.Hazelcast.backupCount;
        assertThat(obj.getBackupCount()).isEqualTo(val);
        val++;
        obj.setBackupCount(val);
        assertThat(obj.getBackupCount()).isEqualTo(val);
    }

    @Test
    public void testCacheEhcacheTimeToLiveSeconds() {
        JHipsterProperties.Cache.Ehcache obj = properties.getCache().getEhcache();
        int val = JHipsterDefaults.Cache.Ehcache.timeToLiveSeconds;
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
        val++;
        obj.setTimeToLiveSeconds(val);
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
    }

    @Test
    public void testCacheEhcacheMaxEntries() {
        JHipsterProperties.Cache.Ehcache obj = properties.getCache().getEhcache();
        long val = JHipsterDefaults.Cache.Ehcache.maxEntries;
        assertThat(obj.getMaxEntries()).isEqualTo(val);
        val++;
        obj.setMaxEntries(val);
        assertThat(obj.getMaxEntries()).isEqualTo(val);
    }

    @Test
    public void testCacheInfinispanConfigFile() {
        JHipsterProperties.Cache.Infinispan obj = properties.getCache().getInfinispan();
        String val = JHipsterDefaults.Cache.Infinispan.configFile;
        assertThat(obj.getConfigFile()).isEqualTo(val);
        val = "1" + val;
        obj.setConfigFile(val);
        assertThat(obj.getConfigFile()).isEqualTo(val);
    }

    @Test
    public void testCacheInfinispanStatsEnabled() {
        JHipsterProperties.Cache.Infinispan obj = properties.getCache().getInfinispan();
        boolean val = JHipsterDefaults.Cache.Infinispan.statsEnabled;
        assertThat(obj.isStatsEnabled()).isEqualTo(val);
        val = !val;
        obj.setStatsEnabled(val);
        assertThat(obj.isStatsEnabled()).isEqualTo(val);
    }

    @Test
    public void testCacheInfinispanLocalTimeToLiveSeconds() {
        JHipsterProperties.Cache.Infinispan.Local obj = properties.getCache().getInfinispan().getLocal();
        long val = JHipsterDefaults.Cache.Infinispan.Local.timeToLiveSeconds;
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
        val++;
        obj.setTimeToLiveSeconds(val);
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
    }

    @Test
    public void testCacheInfinispanLocalMaxEntries() {
        JHipsterProperties.Cache.Infinispan.Local obj = properties.getCache().getInfinispan().getLocal();
        long val = JHipsterDefaults.Cache.Infinispan.Local.maxEntries;
        assertThat(obj.getMaxEntries()).isEqualTo(val);
        val++;
        obj.setMaxEntries(val);
        assertThat(obj.getMaxEntries()).isEqualTo(val);
    }

    @Test
    public void testCacheInfinispanDistributedTimeToLiveSeconds() {
        JHipsterProperties.Cache.Infinispan.Distributed obj = properties.getCache().getInfinispan().getDistributed();
        long val = JHipsterDefaults.Cache.Infinispan.Distributed.timeToLiveSeconds;
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
        val++;
        obj.setTimeToLiveSeconds(val);
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
    }

    @Test
    public void testCacheInfinispanDistributedMaxEntries() {
        JHipsterProperties.Cache.Infinispan.Distributed obj = properties.getCache().getInfinispan().getDistributed();
        long val = JHipsterDefaults.Cache.Infinispan.Distributed.maxEntries;
        assertThat(obj.getMaxEntries()).isEqualTo(val);
        val++;
        obj.setMaxEntries(val);
        assertThat(obj.getMaxEntries()).isEqualTo(val);
    }

    @Test
    public void testCacheInfinispanDistributedInstanceCount() {
        JHipsterProperties.Cache.Infinispan.Distributed obj = properties.getCache().getInfinispan().getDistributed();
        int val = JHipsterDefaults.Cache.Infinispan.Distributed.instanceCount;
        assertThat(obj.getInstanceCount()).isEqualTo(val);
        val++;
        obj.setInstanceCount(val);
        assertThat(obj.getInstanceCount()).isEqualTo(val);
    }

    @Test
    public void testCacheInfinispanReplicatedTimeToLiveSeconds() {
        JHipsterProperties.Cache.Infinispan.Replicated obj = properties.getCache().getInfinispan().getReplicated();
        long val = JHipsterDefaults.Cache.Infinispan.Replicated.timeToLiveSeconds;
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
        val++;
        obj.setTimeToLiveSeconds(val);
        assertThat(obj.getTimeToLiveSeconds()).isEqualTo(val);
    }

    @Test
    public void testCacheInfinispanReplicatedMaxEntries() {
        JHipsterProperties.Cache.Infinispan.Replicated obj = properties.getCache().getInfinispan().getReplicated();
        long val = JHipsterDefaults.Cache.Infinispan.Replicated.maxEntries;
        assertThat(obj.getMaxEntries()).isEqualTo(val);
        val++;
        obj.setMaxEntries(val);
        assertThat(obj.getMaxEntries()).isEqualTo(val);
    }

    @Test
    public void testMailFrom() {
        JHipsterProperties.Mail obj = properties.getMail();
        String val = JHipsterDefaults.Mail.from;
        assertThat(obj.getFrom()).isEqualTo(val);
        val = "1" + val;
        obj.setFrom(val);
        assertThat(obj.getFrom()).isEqualTo(val);
    }

    @Test
    public void testMailBaseUrl() {
        JHipsterProperties.Mail obj = properties.getMail();
        String val = JHipsterDefaults.Mail.baseUrl;
        assertThat(obj.getBaseUrl()).isEqualTo(val);
        val = "1" + val;
        obj.setBaseUrl(val);
        assertThat(obj.getBaseUrl()).isEqualTo(val);
    }

    @Test
    public void testSecurityClientAuthorizationAccessTokenUri() {
        JHipsterProperties.Security.ClientAuthorization obj = properties.getSecurity().getClientAuthorization();
        String val = JHipsterDefaults.Security.ClientAuthorization.accessTokenUri;
        assertThat(obj.getAccessTokenUri()).isEqualTo(val);
        val = "1" + val;
        obj.setAccessTokenUri(val);
        assertThat(obj.getAccessTokenUri()).isEqualTo(val);
    }

    @Test
    public void testSecurityClientAuthorizationTokenServiceId() {
        JHipsterProperties.Security.ClientAuthorization obj = properties.getSecurity().getClientAuthorization();
        String val = JHipsterDefaults.Security.ClientAuthorization.tokenServiceId;
        assertThat(obj.getTokenServiceId()).isEqualTo(val);
        val = "1" + val;
        obj.setTokenServiceId(val);
        assertThat(obj.getTokenServiceId()).isEqualTo(val);
    }

    @Test
    public void testSecurityClientAuthorizationClientId() {
        JHipsterProperties.Security.ClientAuthorization obj = properties.getSecurity().getClientAuthorization();
        String val = JHipsterDefaults.Security.ClientAuthorization.clientId;
        assertThat(obj.getClientId()).isEqualTo(val);
        val = "1" + val;
        obj.setClientId(val);
        assertThat(obj.getClientId()).isEqualTo(val);
    }

    @Test
    public void testSecurityClientAuthorizationClientSecret() {
        JHipsterProperties.Security.ClientAuthorization obj = properties.getSecurity().getClientAuthorization();
        String val = JHipsterDefaults.Security.ClientAuthorization.clientSecret;
        assertThat(obj.getClientSecret()).isEqualTo(val);
        val = "1" + val;
        obj.setClientSecret(val);
        assertThat(obj.getClientSecret()).isEqualTo(val);
    }

    @Test
    public void testSecurityAuthenticationJwtSecret() {
        JHipsterProperties.Security.Authentication.Jwt obj = properties.getSecurity().getAuthentication().getJwt();
        String val = JHipsterDefaults.Security.Authentication.Jwt.secret;
        assertThat(obj.getSecret()).isEqualTo(val);
        val = "1" + val;
        obj.setSecret(val);
        assertThat(obj.getSecret()).isEqualTo(val);
    }

    @Test
    public void testSecurityAuthenticationJwtTokenValidityInSeconds() {
        JHipsterProperties.Security.Authentication.Jwt obj = properties.getSecurity().getAuthentication().getJwt();
        long val = JHipsterDefaults.Security.Authentication.Jwt.tokenValidityInSeconds;
        assertThat(obj.getTokenValidityInSeconds()).isEqualTo(val);
        val++;
        obj.setTokenValidityInSeconds(val);
        assertThat(obj.getTokenValidityInSeconds()).isEqualTo(val);
    }

    @Test
    public void testSecurityAuthenticationJwtTokenValidityInSecondsForRememberMe() {
        JHipsterProperties.Security.Authentication.Jwt obj = properties.getSecurity().getAuthentication().getJwt();
        long val = JHipsterDefaults.Security.Authentication.Jwt.tokenValidityInSecondsForRememberMe;
        assertThat(obj.getTokenValidityInSecondsForRememberMe()).isEqualTo(val);
        val++;
        obj.setTokenValidityInSecondsForRememberMe(val);
        assertThat(obj.getTokenValidityInSecondsForRememberMe()).isEqualTo(val);
    }

    @Test
    public void testSecurityRememberMeKey() {
        JHipsterProperties.Security.RememberMe obj = properties.getSecurity().getRememberMe();
        String val = JHipsterDefaults.Security.RememberMe.key;
        assertThat(obj.getKey()).isEqualTo(val);
        val = "1" + val;
        obj.setKey(val);
        assertThat(obj.getKey()).isEqualTo(val);
    }

    @Test
    public void testSwaggerTitle() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.title;
        assertThat(obj.getTitle()).isEqualTo(val);
        val = "1" + val;
        obj.setTitle(val);
        assertThat(obj.getTitle()).isEqualTo(val);
    }

    @Test
    public void testSwaggerDescription() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.description;
        assertThat(obj.getDescription()).isEqualTo(val);
        val = "1" + val;
        obj.setDescription(val);
        assertThat(obj.getDescription()).isEqualTo(val);
    }

    @Test
    public void testSwaggerVersion() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.version;
        assertThat(obj.getVersion()).isEqualTo(val);
        val = "1" + val;
        obj.setVersion(val);
        assertThat(obj.getVersion()).isEqualTo(val);
    }

    @Test
    public void testSwaggerTermsOfServiceUrl() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.termsOfServiceUrl;
        assertThat(obj.getTermsOfServiceUrl()).isEqualTo(val);
        val = "1" + val;
        obj.setTermsOfServiceUrl(val);
        assertThat(obj.getTermsOfServiceUrl()).isEqualTo(val);
    }

    @Test
    public void testSwaggerContactName() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.contactName;
        assertThat(obj.getContactName()).isEqualTo(val);
        val = "1" + val;
        obj.setContactName(val);
        assertThat(obj.getContactName()).isEqualTo(val);
    }

    @Test
    public void testSwaggerContactUrl() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.contactUrl;
        assertThat(obj.getContactUrl()).isEqualTo(val);
        val = "1" + val;
        obj.setContactUrl(val);
        assertThat(obj.getContactUrl()).isEqualTo(val);
    }

    @Test
    public void testSwaggerContactEmail() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.contactEmail;
        assertThat(obj.getContactEmail()).isEqualTo(val);
        val = "1" + val;
        obj.setContactEmail(val);
        assertThat(obj.getContactEmail()).isEqualTo(val);
    }

    @Test
    public void testSwaggerLicense() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.license;
        assertThat(obj.getLicense()).isEqualTo(val);
        val = "1" + val;
        obj.setLicense(val);
        assertThat(obj.getLicense()).isEqualTo(val);
    }

    @Test
    public void testSwaggerLicenseUrl() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.licenseUrl;
        assertThat(obj.getLicenseUrl()).isEqualTo(val);
        val = "1" + val;
        obj.setLicenseUrl(val);
        assertThat(obj.getLicenseUrl()).isEqualTo(val);
    }

    @Test
    public void testSwaggerDefaultIncludePattern() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.defaultIncludePattern;
        assertThat(obj.getDefaultIncludePattern()).isEqualTo(val);
        val = "1" + val;
        obj.setDefaultIncludePattern(val);
        assertThat(obj.getDefaultIncludePattern()).isEqualTo(val);
    }

    @Test
    public void testSwaggerHost() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String val = JHipsterDefaults.Swagger.host;
        assertThat(obj.getHost()).isEqualTo(val);
        val = "1" + val;
        obj.setHost(val);
        assertThat(obj.getHost()).isEqualTo(val);
    }

    @Test
    public void testSwaggerProtocols() {
        JHipsterProperties.Swagger obj = properties.getSwagger();
        String[] def = JHipsterDefaults.Swagger.protocols;
        ArrayList<String> val;
        if (def != null) {
            val = newArrayList(def);
            assertThat(obj.getProtocols()).containsExactlyElementsOf(newArrayList(val));
        } else {
            assertThat(obj.getProtocols()).isNull();
            def = new String[1];
            val = new ArrayList<>(1);
        }
        val.add("1");
        obj.setProtocols(val.toArray(def));
        assertThat(obj.getProtocols()).containsExactlyElementsOf(newArrayList(val));
    }

    @Test
    public void testMetricsJmxEnabled() {
        JHipsterProperties.Metrics.Jmx obj = properties.getMetrics().getJmx();
        boolean val = JHipsterDefaults.Metrics.Jmx.enabled;
        assertThat(obj.isEnabled()).isEqualTo(val);
        val = !val;
        obj.setEnabled(val);
        assertThat(obj.isEnabled()).isEqualTo(val);
    }

    @Test
    public void testMetricsGraphiteEnabled() {
        JHipsterProperties.Metrics.Graphite obj = properties.getMetrics().getGraphite();
        boolean val = JHipsterDefaults.Metrics.Graphite.enabled;
        assertThat(obj.isEnabled()).isEqualTo(val);
        val = !val;
        obj.setEnabled(val);
        assertThat(obj.isEnabled()).isEqualTo(val);
    }

    @Test
    public void testMetricsGraphiteHost() {
        JHipsterProperties.Metrics.Graphite obj = properties.getMetrics().getGraphite();
        String val = JHipsterDefaults.Metrics.Graphite.host;
        assertThat(obj.getHost()).isEqualTo(val);
        val = "1" + val;
        obj.setHost(val);
        assertThat(obj.getHost()).isEqualTo(val);
    }

    @Test
    public void testMetricsGraphitePort() {
        JHipsterProperties.Metrics.Graphite obj = properties.getMetrics().getGraphite();
        int val = JHipsterDefaults.Metrics.Graphite.port;
        assertThat(obj.getPort()).isEqualTo(val);
        val++;
        obj.setPort(val);
        assertThat(obj.getPort()).isEqualTo(val);
    }

    @Test
    public void testMetricsGraphitePrefix() {
        JHipsterProperties.Metrics.Graphite obj = properties.getMetrics().getGraphite();
        String val = JHipsterDefaults.Metrics.Graphite.prefix;
        assertThat(obj.getPrefix()).isEqualTo(val);
        val = "1" + val;
        obj.setPrefix(val);
        assertThat(obj.getPrefix()).isEqualTo(val);
    }

    @Test
    public void testMetricsPrometheusEnabled() {
        JHipsterProperties.Metrics.Prometheus obj = properties.getMetrics().getPrometheus();
        boolean val = JHipsterDefaults.Metrics.Prometheus.enabled;
        assertThat(obj.isEnabled()).isEqualTo(val);
        val = !val;
        obj.setEnabled(val);
        assertThat(obj.isEnabled()).isEqualTo(val);
    }

    @Test
    public void testMetricsPrometheusEndpoint() {
        JHipsterProperties.Metrics.Prometheus obj = properties.getMetrics().getPrometheus();
        String val = JHipsterDefaults.Metrics.Prometheus.endpoint;
        assertThat(obj.getEndpoint()).isEqualTo(val);
        val = "1" + val;
        obj.setEndpoint(val);
        assertThat(obj.getEndpoint()).isEqualTo(val);
    }

    @Test
    public void testMetricsLogsEnabled() {
        JHipsterProperties.Metrics.Logs obj = properties.getMetrics().getLogs();
        boolean val = JHipsterDefaults.Metrics.Logs.enabled;
        assertThat(obj.isEnabled()).isEqualTo(val);
        val = !val;
        obj.setEnabled(val);
        assertThat(obj.isEnabled()).isEqualTo(val);
    }

    @Test
    public void testMetricsLogsReportFrequency() {
        JHipsterProperties.Metrics.Logs obj = properties.getMetrics().getLogs();
        long val = JHipsterDefaults.Metrics.Logs.reportFrequency;
        assertThat(obj.getReportFrequency()).isEqualTo(val);
        val++;
        obj.setReportFrequency(val);
        assertThat(obj.getReportFrequency()).isEqualTo(val);
    }

    @Test
    public void testLoggingLogstashEnabled() {
        JHipsterProperties.Logging.Logstash obj = properties.getLogging().getLogstash();
        boolean val = JHipsterDefaults.Logging.Logstash.enabled;
        assertThat(obj.isEnabled()).isEqualTo(val);
        val = !val;
        obj.setEnabled(val);
        assertThat(obj.isEnabled()).isEqualTo(val);
    }

    @Test
    public void testLoggingLogstashHost() {
        JHipsterProperties.Logging.Logstash obj = properties.getLogging().getLogstash();
        String val = JHipsterDefaults.Logging.Logstash.host;
        assertThat(obj.getHost()).isEqualTo(val);
        val = "1" + val;
        obj.setHost(val);
        assertThat(obj.getHost()).isEqualTo(val);
    }

    @Test
    public void testLoggingLogstashPort() {
        JHipsterProperties.Logging.Logstash obj = properties.getLogging().getLogstash();
        int val = JHipsterDefaults.Logging.Logstash.port;
        assertThat(obj.getPort()).isEqualTo(val);
        val++;
        obj.setPort(val);
        assertThat(obj.getPort()).isEqualTo(val);
    }

    @Test
    public void testLoggingLogstashQueueSize() {
        JHipsterProperties.Logging.Logstash obj = properties.getLogging().getLogstash();
        int val = JHipsterDefaults.Logging.Logstash.queueSize;
        assertThat(obj.getQueueSize()).isEqualTo(val);
        val++;
        obj.setQueueSize(val);
        assertThat(obj.getQueueSize()).isEqualTo(val);
    }

    @Test
    public void testLoggingSpectatorMetricsEnabled() {
        JHipsterProperties.Logging.SpectatorMetrics obj = properties.getLogging().getSpectatorMetrics();
        boolean val = JHipsterDefaults.Logging.SpectatorMetrics.enabled;
        assertThat(obj.isEnabled()).isEqualTo(val);
        val = !val;
        obj.setEnabled(val);
        assertThat(obj.isEnabled()).isEqualTo(val);
    }

    @Test
    public void testSocialRedirectAfterSignIn() {
        JHipsterProperties.Social obj = properties.getSocial();
        String val = JHipsterDefaults.Social.redirectAfterSignIn;
        assertThat(obj.getRedirectAfterSignIn()).isEqualTo(val);
        val = "1" + val;
        obj.setRedirectAfterSignIn(val);
        assertThat(obj.getRedirectAfterSignIn()).isEqualTo(val);
    }

    @Test
    public void testGatewayAuthorizedMicroservicesEndpoints() {
        JHipsterProperties.Gateway obj = properties.getGateway();
        Map<String, List<String>> val = JHipsterDefaults.Gateway.authorizedMicroservicesEndpoints;
        assertThat(obj.getAuthorizedMicroservicesEndpoints()).isEqualTo(val);
        val.put("1", null);
        obj.setAuthorizedMicroservicesEndpoints(val);
        assertThat(obj.getAuthorizedMicroservicesEndpoints()).isEqualTo(val);
    }

    @Test
    public void testGatewayRateLimitingEnabled() {
        JHipsterProperties.Gateway.RateLimiting obj = properties.getGateway().getRateLimiting();
        boolean val = JHipsterDefaults.Gateway.RateLimiting.enabled;
        assertThat(obj.isEnabled()).isEqualTo(val);
        val = !val;
        obj.setEnabled(val);
        assertThat(obj.isEnabled()).isEqualTo(val);
    }

    @Test
    public void testGatewayRateLimitingLimit() {
        JHipsterProperties.Gateway.RateLimiting obj = properties.getGateway().getRateLimiting();
        long val = JHipsterDefaults.Gateway.RateLimiting.limit;
        assertThat(obj.getLimit()).isEqualTo(val);
        val++;
        obj.setLimit(val);
        assertThat(obj.getLimit()).isEqualTo(val);
    }

    @Test
    public void testGatewayRateLimitingDurationInSeconds() {
        JHipsterProperties.Gateway.RateLimiting obj = properties.getGateway().getRateLimiting();
        int val = JHipsterDefaults.Gateway.RateLimiting.durationInSeconds;
        assertThat(obj.getDurationInSeconds()).isEqualTo(val);
        val++;
        obj.setDurationInSeconds(val);
        assertThat(obj.getDurationInSeconds()).isEqualTo(val);
    }

    @Test
    public void testRibbonDisplayOnActiveProfiles() {
        JHipsterProperties.Ribbon obj = properties.getRibbon();
        String[] def = JHipsterDefaults.Ribbon.displayOnActiveProfiles;
        ArrayList<String> val;
        if (def != null) {
            val = newArrayList(def);
            assertThat(obj.getDisplayOnActiveProfiles()).containsExactlyElementsOf(newArrayList(val));
        } else {
            assertThat(obj.getDisplayOnActiveProfiles()).isNull();
            def = new String[1];
            val = new ArrayList<>(1);
        }
        val.add("1");
        obj.setDisplayOnActiveProfiles(val.toArray(def));
        assertThat(obj.getDisplayOnActiveProfiles()).containsExactlyElementsOf(newArrayList(val));
    }

    @Test
    public void testRegistryPassword() {
        JHipsterProperties.Registry obj = properties.getRegistry();
        String val = JHipsterDefaults.Registry.password;
        assertThat(obj.getPassword()).isEqualTo(val);
        val = "1" + val;
        obj.setPassword(val);
        assertThat(obj.getPassword()).isEqualTo(val);
    }
}
