package <%=packageName%>.config;

<%_ if (authenticationType == 'session') { _%>
import javax.validation.constraints.NotNull;
<%_ } _%>
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.web.cors.CorsConfiguration;

<%_ if (applicationType == 'gateway') { _%>
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

<%_ } _%>
/**
 * Properties specific to JHipster.
 *
 * <p>
 *     Properties are configured in the application.yml file.
 * </p>
 */
@ConfigurationProperties(prefix = "jhipster", ignoreUnknownFields = false)
public class JHipsterProperties {

    private final Async async = new Async();

    private final Http http = new Http();

    private final Cache cache = new Cache();

    private final Mail mail = new Mail();

    private final Security security = new Security();

    private final Swagger swagger = new Swagger();

    private final Metrics metrics = new Metrics();

    private final CorsConfiguration cors = new CorsConfiguration();
    <%_ if (enableSocialSignIn) { _%>

    private final Social social = new Social();
    <%_ } _%>
    <%_ if (applicationType == 'gateway') { _%>

    private final Gateway gateway = new Gateway();
    <%_ } _%>

    private final Ribbon ribbon = new Ribbon();

    public Async getAsync() {
        return async;
    }

    public Http getHttp() {
        return http;
    }

    public Cache getCache() {
        return cache;
    }

    public Mail getMail() {
        return mail;
    }

    public Security getSecurity() {
        return security;
    }

    public Swagger getSwagger() {
        return swagger;
    }

    public Metrics getMetrics() {
        return metrics;
    }

    public CorsConfiguration getCors() {
        return cors;
    }
    <%_ if (enableSocialSignIn) { _%>

    public Social getSocial() {
        return social;
    }
    <%_ } _%>
    <%_ if (applicationType == 'gateway') { _%>

    public Gateway getGateway() {
        return gateway;
    }
    <%_ } _%>

    public Ribbon getRibbon() {
        return ribbon;
    }

    public static class Async {

        private int corePoolSize = 2;

        private int maxPoolSize = 50;

        private int queueCapacity = 10000;

        public int getCorePoolSize() {
            return corePoolSize;
        }

        public void setCorePoolSize(int corePoolSize) {
            this.corePoolSize = corePoolSize;
        }

        public int getMaxPoolSize() {
            return maxPoolSize;
        }

        public void setMaxPoolSize(int maxPoolSize) {
            this.maxPoolSize = maxPoolSize;
        }

        public int getQueueCapacity() {
            return queueCapacity;
        }

        public void setQueueCapacity(int queueCapacity) {
            this.queueCapacity = queueCapacity;
        }
    }

    public static class Http {

        private final Cache cache = new Cache();

        public Cache getCache() {
            return cache;
        }

        public static class Cache {

            private int timeToLiveInDays = 1461;

            public int getTimeToLiveInDays() {
                return timeToLiveInDays;
            }

            public void setTimeToLiveInDays(int timeToLiveInDays) {
                this.timeToLiveInDays = timeToLiveInDays;
            }
        }
    }

    public static class Cache {
        <%_ if (hibernateCache == 'ehcache') { _%>
        private final Ehcache ehcache = new Ehcache();

        <%_ } _%>
        <%_ if (clusteredHttpSession == 'hazelcast' || hibernateCache == 'hazelcast') { _%>
        private final Hazelcast hazelcast = new Hazelcast();

        <%_ } _%>
        <%_ if (hibernateCache == 'ehcache') { _%>
        public Ehcache getEhcache() {
            return ehcache;
        }

        public static class Ehcache {

            private String maxBytesLocalHeap = "16M";

            public String getMaxBytesLocalHeap() {
                return maxBytesLocalHeap;
            }

            public void setMaxBytesLocalHeap(String maxBytesLocalHeap) {
                this.maxBytesLocalHeap = maxBytesLocalHeap;
            }
        }
        <%_ } _%>
        <%_ if (clusteredHttpSession == 'hazelcast' || hibernateCache == 'hazelcast') { _%>

        public Hazelcast getHazelcast() {
            return hazelcast;
        }

        public static class Hazelcast {

            private int timeToLiveSeconds = 3600;

            private int backupCount = 1;

            public int getTimeToLiveSeconds() {
                return timeToLiveSeconds;
            }

            public void setTimeToLiveSeconds(int timeToLiveSeconds) {
                this.timeToLiveSeconds = timeToLiveSeconds;
            }

            public int getBackupCount() {
                return backupCount;
            }

            public void setBackupCount(int backupCount) {
                this.backupCount = backupCount;
            }
        }
        <%_ } _%>
    }

    public static class Mail {

        private String from = "<%=baseName%>@localhost";

        private String baseUrl = "";

        public String getFrom() {
            return from;
        }

        public void setFrom(String from) {
            this.from = from;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    public static class Security {
        <%_ if (authenticationType == 'session') { _%>

        private final RememberMe rememberMe = new RememberMe();
        <%_ } _%>
        <%_ if ((applicationType === 'microservice' || applicationType === 'uaa') && authenticationType === 'uaa') { _%>

        private final LoadBalancedResourceDetails clientAuthorization = new LoadBalancedResourceDetails();
        <%_ } _%>
        <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>

        private final Authentication authentication = new Authentication();
        <%_ } _%>
        <%_ if (authenticationType === 'session') { _%>

        public RememberMe getRememberMe() {
            return rememberMe;
        }
        <%_ } _%>
        <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>

        public Authentication getAuthentication() {
            return authentication;
        }
        <%_ if ((applicationType === 'microservice' || applicationType === 'uaa') && authenticationType === 'uaa') { _%>

        public LoadBalancedResourceDetails getClientAuthorization() {
            return clientAuthorization;
        }
        <%_ } _%>
        public static class Authentication {
            <%_ if (authenticationType == 'oauth2') { _%>

            private final Oauth oauth = new Oauth();
            <%_ } _%>
            <%_ if (authenticationType == 'jwt' || authenticationType == 'uaa') { _%>

            private final Jwt jwt = new Jwt();
            <%_ } _%>
            <%_ if (authenticationType == 'oauth2') { _%>

            public Oauth getOauth() {
                return oauth;
            }
            <%_ } _%>
            <%_ if (authenticationType == 'jwt' || authenticationType == 'uaa') { _%>

            public Jwt getJwt() {
                return jwt;
            }
            <%_ } _%>
            <%_ if (authenticationType == 'oauth2') { _%>

            public static class Oauth {

                private String clientid;

                private String secret;

                private int tokenValidityInSeconds = 1800;

                public String getClientid() {
                    return clientid;
                }

                public void setClientid(String clientid) {
                    this.clientid = clientid;
                }

                public String getSecret() {
                    return secret;
                }

                public void setSecret(String secret) {
                    this.secret = secret;
                }

                public int getTokenValidityInSeconds() {
                    return tokenValidityInSeconds;
                }

                public void setTokenValidityInSeconds(int tokenValidityInSeconds) {
                    this.tokenValidityInSeconds = tokenValidityInSeconds;
                }
            }
            <%_ } _%>
            <%_ if (authenticationType == 'jwt' || authenticationType == 'uaa') { _%>

            public static class Jwt {

                private String secret;

                private long tokenValidityInSeconds = 1800;

                private long tokenValidityInSecondsForRememberMe = 2592000;

                public String getSecret() {
                    return secret;
                }

                public void setSecret(String secret) {
                    this.secret = secret;
                }

                public long getTokenValidityInSeconds() {
                    return tokenValidityInSeconds;
                }

                public void setTokenValidityInSeconds(long tokenValidityInSeconds) {
                    this.tokenValidityInSeconds = tokenValidityInSeconds;
                }

                public long getTokenValidityInSecondsForRememberMe() {
                    return tokenValidityInSecondsForRememberMe;
                }

                public void setTokenValidityInSecondsForRememberMe(long tokenValidityInSecondsForRememberMe) {
                    this.tokenValidityInSecondsForRememberMe = tokenValidityInSecondsForRememberMe;
                }
            }
            <%_ } _%>
        }
        <%_ } _%>
        <%_ if (authenticationType == 'session') { _%>

        public static class RememberMe {

            @NotNull
            private String key;

            public String getKey() {
                return key;
            }

            public void setKey(String key) {
                this.key = key;
            }
        }
        <%_ } _%>
    }

    public static class Swagger {

        private String title = "<%=baseName%> API";

        private String description = "<%=baseName%> API documentation";

        private String version = "0.0.1";

        private String termsOfServiceUrl;

        private String contactName;

        private String contactUrl;

        private String contactEmail;

        private String license;

        private String licenseUrl;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getVersion() {
            return version;
        }

        public void setVersion(String version) {
            this.version = version;
        }

        public String getTermsOfServiceUrl() {
            return termsOfServiceUrl;
        }

        public void setTermsOfServiceUrl(String termsOfServiceUrl) {
            this.termsOfServiceUrl = termsOfServiceUrl;
        }

        public String getContactName() {
            return contactName;
        }

        public void setContactName(String contactName) {
            this.contactName = contactName;
        }

        public String getContactUrl() {
            return contactUrl;
        }

        public void setContactUrl(String contactUrl) {
            this.contactUrl = contactUrl;
        }

        public String getContactEmail() {
            return contactEmail;
        }

        public void setContactEmail(String contactEmail) {
            this.contactEmail = contactEmail;
        }

        public String getLicense() {
            return license;
        }

        public void setLicense(String license) {
            this.license = license;
        }

        public String getLicenseUrl() {
            return licenseUrl;
        }

        public void setLicenseUrl(String licenseUrl) {
            this.licenseUrl = licenseUrl;
        }
    }

    public static class Metrics {

        private final Jmx jmx = new Jmx();

        private final Graphite graphite = new Graphite();

        private final Prometheus prometheus = new Prometheus();

        private final Logs logs = new Logs();

        public Jmx getJmx() {
            return jmx;
        }

        public Graphite getGraphite() {
            return graphite;
        }

        public Prometheus getPrometheus() {
            return prometheus;
        }

        public Logs getLogs() {
            return logs;
        }

        public static class Jmx {

            private boolean enabled = true;

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }
        }

        public static class Graphite {

            private boolean enabled = false;

            private String host = "localhost";

            private int port = 2003;

            private String prefix = "<%=baseName%>";

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }

            public String getHost() {
                return host;
            }

            public void setHost(String host) {
                this.host = host;
            }

            public int getPort() {
                return port;
            }

            public void setPort(int port) {
                this.port = port;
            }

            public String getPrefix() {
                return prefix;
            }

            public void setPrefix(String prefix) {
                this.prefix = prefix;
            }
        }

        public static class Prometheus {

            private boolean enabled = false;

            private String endpoint = "/prometheusMetrics";

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }

            public String getEndpoint() {
                return endpoint;
            }

            public void setEndpoint(String endpoint) {
                this.endpoint = endpoint;
            }
        }

        public static class Logs {

            private boolean enabled = false;

            private long reportFrequency = 60;

            public long getReportFrequency() {
                return reportFrequency;
            }

            public void setReportFrequency(int reportFrequency) {
                this.reportFrequency = reportFrequency;
            }

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }
        }
    }

    private final Logging logging = new Logging();

    public Logging getLogging() { return logging; }

    public static class Logging {

        private final Logstash logstash = new Logstash();

        public Logstash getLogstash() { return logstash; }

        public static class Logstash {

            private boolean enabled = false;

            private String host = "localhost";

            private int port = 5000;

            private int queueSize = 512;

            public boolean isEnabled() { return enabled; }

            public void setEnabled(boolean enabled) { this.enabled = enabled; }

            public String getHost() { return host; }

            public void setHost(String host) { this.host = host; }

            public int getPort() { return port; }

            public void setPort(int port) { this.port = port; }

            public int getQueueSize() { return queueSize; }

            public void setQueueSize(int queueSize) { this.queueSize = queueSize; }
        }
    <%_ if (applicationType == 'gateway' || applicationType == 'microservice') { _%>

        private final SpectatorMetrics spectatorMetrics = new SpectatorMetrics();

        public SpectatorMetrics getSpectatorMetrics() { return spectatorMetrics; }

        public static class SpectatorMetrics {

            private boolean enabled = false;

            public boolean isEnabled() { return enabled; }

            public void setEnabled(boolean enabled) { this.enabled = enabled; }
        }
    <%_ } _%>
    }
    <%_ if (enableSocialSignIn) { _%>

    public static class Social {

        private String redirectAfterSignIn = "/#/home";

        public String getRedirectAfterSignIn() {
            return redirectAfterSignIn;
        }

        public void setRedirectAfterSignIn(String redirectAfterSignIn) {
            this.redirectAfterSignIn = redirectAfterSignIn;
        }
    }
    <%_ } _%>
    <%_ if (applicationType == 'gateway') { _%>

    public static class Gateway {

        private final RateLimiting rateLimiting = new RateLimiting();

        public RateLimiting getRateLimiting() {
            return rateLimiting;
        }

        private Map<String, List<String>> authorizedMicroservicesEndpoints = new LinkedHashMap<>();

        public Map<String, List<String>> getAuthorizedMicroservicesEndpoints() {
            return authorizedMicroservicesEndpoints;
        }

        public void setAuthorizedMicroservicesEndpoints(Map<String, List<String>> authorizedMicroservicesEndpoints) {
            this.authorizedMicroservicesEndpoints = authorizedMicroservicesEndpoints;
        }

        public static class RateLimiting {

            private boolean enabled = false;

            private long limit = 100000L;

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }

            public long getLimit() {
                return this.limit;
            }

            public void setLimit(long limit) {
                this.limit = limit;
            }
        }
    }
<%_ } _%>

    public static class Ribbon {

        private String[] displayOnActiveProfiles;

        public String[] getDisplayOnActiveProfiles() {
            return displayOnActiveProfiles;
        }

        public void setDisplayOnActiveProfiles(String[] displayOnActiveProfiles) {
            this.displayOnActiveProfiles = displayOnActiveProfiles;
        }
    }
}
