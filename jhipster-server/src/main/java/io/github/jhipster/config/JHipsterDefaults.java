/*
 * Copyright 2016-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
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

package io.github.jhipster.config;

import java.util.*;

import io.github.jhipster.config.JHipsterProperties.Http.Version;

public interface JHipsterDefaults {

    interface Async {

        int corePoolSize = 2;
        int maxPoolSize = 50;
        int queueCapacity = 10000;
    }

    interface Http {

        Version version = Version.V_1_1;

        interface Cache {

            int timeToLiveInDays = 1461; // 4 years (including leap day)
        }
    }

    interface Cache {

        interface Hazelcast {

            int timeToLiveSeconds = 3600; // 1 hour
            int backupCount = 1;

            interface ManagementCenter {

                boolean enabled = false;
                int updateInterval = 3;
                String url = "";
            }
        }

        interface Ehcache {

            int timeToLiveSeconds = 3600; // 1 hour
            long maxEntries = 100;
        }

        interface Infinispan {

            String configFile = "default-configs/default-jgroups-tcp.xml";
            boolean statsEnabled = false;

            interface Local {

                long timeToLiveSeconds = 60; // 1 minute
                long maxEntries = 100;
            }

            interface Distributed {

                long timeToLiveSeconds = 60; // 1 minute
                long maxEntries = 100;
                int instanceCount = 1;
            }

            interface Replicated {

                long timeToLiveSeconds = 60; // 1 minute
                long maxEntries = 100;
            }
        }
    }

    interface Mail {

        String from = "";
        String baseUrl = "";
    }

    interface Security {

        interface ClientAuthorization {

            String accessTokenUri = null;
            String tokenServiceId = null;
            String clientId = null;
            String clientSecret = null;
        }

        interface Authentication {

            interface Jwt {

                String secret = null;
                long tokenValidityInSeconds = 1800; // 0.5 hour
                long tokenValidityInSecondsForRememberMe = 2592000; // 30 hours;
            }
        }

        interface RememberMe {

            String key = null;
        }
    }

    interface Swagger {

        String title = "Application API";
        String description = "API documentation";
        String version = "0.0.1";
        String termsOfServiceUrl = null;
        String contactName = null;
        String contactUrl = null;
        String contactEmail = null;
        String license = null;
        String licenseUrl = null;
        String defaultIncludePattern = "/api/.*";
        String host = null;
        String[] protocols = {};
    }

    interface Metrics {

        interface Jmx {

            boolean enabled = true;
        }

        interface Graphite {

            boolean enabled = false;
            String host = "localhost";
            int port = 2003;
            String prefix = "jhipsterApplication";
        }

        interface Prometheus {

            boolean enabled = false;
            String endpoint = "/prometheusMetrics";
        }

        interface Logs {

            boolean enabled = false;
            long reportFrequency = 60;

        }
    }

    interface Logging {

        interface Logstash {

            boolean enabled = false;
            String host = "localhost";
            int port = 5000;
            int queueSize = 512;
        }

        interface SpectatorMetrics {

            boolean enabled = false;
        }
    }

    interface Social {

        String redirectAfterSignIn = "/#/home";
    }

    interface Gateway {

        Map<String, List<String>> authorizedMicroservicesEndpoints = new LinkedHashMap<>();

        interface RateLimiting {

            boolean enabled = false;
            long limit = 100_000L;
            int durationInSeconds = 3_600;

        }
    }

    interface Ribbon {

        String[] displayOnActiveProfiles = null;
    }

    interface Registry {

        String password = null;
    }
}
