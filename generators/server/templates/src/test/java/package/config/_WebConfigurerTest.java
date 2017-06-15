<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
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
package <%= packageName %>.config;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.servlet.InstrumentedFilter;
import com.codahale.metrics.servlets.MetricsServlet;
<%_ if (clusteredHttpSession === 'hazelcast' || hibernateCache === 'hazelcast') { _%>
import com.hazelcast.config.Config;
import com.hazelcast.core.*;
import com.hazelcast.durableexecutor.DurableExecutorService;
import com.hazelcast.logging.LoggingService;
import com.hazelcast.mapreduce.JobTracker;
import com.hazelcast.quorum.QuorumService;
import com.hazelcast.ringbuffer.Ringbuffer;
import com.hazelcast.transaction.*;
<%_ } _%>
<%_ if (clusteredHttpSession === 'hazelcast') { _%>
import com.hazelcast.web.spring.SpringAwareWebFilter;
<%_ } _%>
import io.github.jhipster.config.JHipsterConstants;
import io.github.jhipster.config.JHipsterProperties;
<%_ if (!skipClient) { _%>
import io.github.jhipster.web.filter.CachingHttpHeadersFilter;
<%_ } _%>
import io.undertow.Undertow;
import io.undertow.Undertow.Builder;
import io.undertow.UndertowOptions;
import org.apache.commons.io.FilenameUtils;
<%_ if (devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { _%>
import org.h2.server.web.WebServlet;
<%_ } _%>
import org.junit.Before;
import org.junit.Test;
import org.springframework.boot.context.embedded.undertow.UndertowEmbeddedServletContainerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.mock.web.MockServletContext;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.xnio.OptionMap;

import javax.servlet.*;
import java.util.*;
<%_ if (clusteredHttpSession === 'hazelcast' || hibernateCache === 'hazelcast') { _%>
import java.util.concurrent.ConcurrentMap;
<%_ } _%>


import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Unit tests for the WebConfigurer class.
 *
 * @see WebConfigurer
 */
public class WebConfigurerTest {

    private WebConfigurer webConfigurer;

    private MockServletContext servletContext;

    private MockEnvironment env;

    private JHipsterProperties props;

    private MetricRegistry metricRegistry;

    @Before
    public void setup() {
        servletContext = spy(new MockServletContext());
        doReturn(new MockFilterRegistration())
            .when(servletContext).addFilter(anyString(), any(Filter.class));
        doReturn(new MockServletRegistration())
            .when(servletContext).addServlet(anyString(), any(Servlet.class));
        <%_ if (clusteredHttpSession === 'hazelcast') { _%>
        doNothing()
            .when(servletContext).addListener(any(EventListener.class));
        <%_ } _%>

        env = new MockEnvironment();
        props = new JHipsterProperties();

        webConfigurer = new WebConfigurer(env, props<% if (clusteredHttpSession === 'hazelcast' || hibernateCache === 'hazelcast') { %>, new MockHazelcastInstance()<% } %>);
        metricRegistry = new MetricRegistry();
        webConfigurer.setMetricRegistry(metricRegistry);
    }

    @Test
    public void testStartUpProdServletContext() throws ServletException {
        env.setActiveProfiles(JHipsterConstants.SPRING_PROFILE_PRODUCTION);
        webConfigurer.onStartup(servletContext);

        assertThat(servletContext.getAttribute(InstrumentedFilter.REGISTRY_ATTRIBUTE)).isEqualTo(metricRegistry);
        assertThat(servletContext.getAttribute(MetricsServlet.METRICS_REGISTRY)).isEqualTo(metricRegistry);
        <%_ if (clusteredHttpSession === 'hazelcast') { _%>
        verify(servletContext).addFilter(eq("hazelcastWebFilter"), any(SpringAwareWebFilter.class));
        <%_ } _%>
        verify(servletContext).addFilter(eq("webappMetricsFilter"), any(InstrumentedFilter.class));
        verify(servletContext).addServlet(eq("metricsServlet"), any(MetricsServlet.class));
        <%_ if (!skipClient) { _%>
        verify(servletContext).addFilter(eq("cachingHttpHeadersFilter"), any(CachingHttpHeadersFilter.class));
        <%_ } _%>
        <%_ if (devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { _%>
        verify(servletContext, never()).addServlet(eq("H2Console"), any(WebServlet.class));
        <%_ } _%>
    }

    @Test
    public void testStartUpDevServletContext() throws ServletException {
        env.setActiveProfiles(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT);
        webConfigurer.onStartup(servletContext);

        assertThat(servletContext.getAttribute(InstrumentedFilter.REGISTRY_ATTRIBUTE)).isEqualTo(metricRegistry);
        assertThat(servletContext.getAttribute(MetricsServlet.METRICS_REGISTRY)).isEqualTo(metricRegistry);
        <%_ if (clusteredHttpSession === 'hazelcast') { _%>
        verify(servletContext).addFilter(eq("hazelcastWebFilter"), any(SpringAwareWebFilter.class));
        <%_ } _%>
        verify(servletContext).addFilter(eq("webappMetricsFilter"), any(InstrumentedFilter.class));
        verify(servletContext).addServlet(eq("metricsServlet"), any(MetricsServlet.class));
        <%_ if (!skipClient) { _%>
        verify(servletContext, never()).addFilter(eq("cachingHttpHeadersFilter"), any(CachingHttpHeadersFilter.class));
        <%_ } _%>
        <%_ if (devDatabaseType === 'h2Disk' || devDatabaseType === 'h2Memory') { _%>
        verify(servletContext).addServlet(eq("H2Console"), any(WebServlet.class));
        <%_ } _%>
    }

    @Test
    public void testCustomizeServletContainer() {
        env.setActiveProfiles(JHipsterConstants.SPRING_PROFILE_PRODUCTION);
        UndertowEmbeddedServletContainerFactory container = new UndertowEmbeddedServletContainerFactory();
        webConfigurer.customize(container);
        assertThat(container.getMimeMappings().get("abs")).isEqualTo("audio/x-mpeg");
        assertThat(container.getMimeMappings().get("html")).isEqualTo("text/html;charset=utf-8");
        assertThat(container.getMimeMappings().get("json")).isEqualTo("text/html;charset=utf-8");
        <%_ if (!skipClient) { _%>
        if (container.getDocumentRoot() != null) {
            assertThat(container.getDocumentRoot().getPath()).isEqualTo(FilenameUtils.separatorsToSystem("<%= BUILD_DIR %>www"));
        }
        <%_ } _%>

        Builder builder = Undertow.builder();
        container.getBuilderCustomizers().forEach(c -> c.customize(builder));
        OptionMap.Builder serverOptions = (OptionMap.Builder) ReflectionTestUtils.getField(builder, "serverOptions");
        assertThat(serverOptions.getMap().get(UndertowOptions.ENABLE_HTTP2)).isNull();
    }
    <%_ if (!skipClient && clientFramework === 'angular1') { _%>

    @Test
    public void testCustomizeServletContainerNotProd() {
        UndertowEmbeddedServletContainerFactory container = new UndertowEmbeddedServletContainerFactory();
        webConfigurer.customize(container);
        assertThat(container.getMimeMappings().get("abs")).isEqualTo("audio/x-mpeg");
        assertThat(container.getMimeMappings().get("html")).isEqualTo("text/html;charset=utf-8");
        assertThat(container.getMimeMappings().get("json")).isEqualTo("text/html;charset=utf-8");
        assertThat(container.getDocumentRoot().getPath()).isEqualTo(FilenameUtils.separatorsToSystem("src/main/webapp"));

        Builder builder = Undertow.builder();
        container.getBuilderCustomizers().forEach(c -> c.customize(builder));
        OptionMap.Builder serverOptions = (OptionMap.Builder) ReflectionTestUtils.getField(builder, "serverOptions");
        assertThat(serverOptions.getMap().get(UndertowOptions.ENABLE_HTTP2)).isNull();
    }
    <%_ } _%>

    @Test
    public void testUndertowHttp2Enabled() {
        props.getHttp().setVersion(JHipsterProperties.Http.Version.V_2_0);
        UndertowEmbeddedServletContainerFactory container = new UndertowEmbeddedServletContainerFactory();
        webConfigurer.customize(container);
        Builder builder = Undertow.builder();
        container.getBuilderCustomizers().forEach(c -> c.customize(builder));
        OptionMap.Builder serverOptions = (OptionMap.Builder) ReflectionTestUtils.getField(builder, "serverOptions");
        assertThat(serverOptions.getMap().get(UndertowOptions.ENABLE_HTTP2)).isTrue();
    }

    @Test
    public void testCorsFilterOnApiPath() throws Exception {
        props.getCors().setAllowedOrigins(Collections.singletonList("*"));
        props.getCors().setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        props.getCors().setAllowedHeaders(Collections.singletonList("*"));
        props.getCors().setMaxAge(1800L);
        props.getCors().setAllowCredentials(true);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new WebConfigurerTestController())
            .addFilters(webConfigurer.corsFilter())
            .build();

        mockMvc.perform(
            options("/api/test-cors")
                .header(HttpHeaders.ORIGIN, "other.domain.com")
                .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "other.domain.com"))
            .andExpect(header().string(HttpHeaders.VARY, "Origin"))
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET,POST,PUT,DELETE"))
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"))
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_MAX_AGE, "1800"));

        mockMvc.perform(
            get("/api/test-cors")
                .header(HttpHeaders.ORIGIN, "other.domain.com"))
            .andExpect(status().isOk())
            .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "other.domain.com"));
    }

    @Test
    public void testCorsFilterOnOtherPath() throws Exception {
        props.getCors().setAllowedOrigins(Collections.singletonList("*"));
        props.getCors().setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        props.getCors().setAllowedHeaders(Collections.singletonList("*"));
        props.getCors().setMaxAge(1800L);
        props.getCors().setAllowCredentials(true);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new WebConfigurerTestController())
            .addFilters(webConfigurer.corsFilter())
            .build();

        mockMvc.perform(
            get("/test/test-cors")
                .header(HttpHeaders.ORIGIN, "other.domain.com"))
            .andExpect(status().isOk())
            .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    @Test
    public void testCorsFilterDeactivated() throws Exception {
        props.getCors().setAllowedOrigins(null);

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new WebConfigurerTestController())
            .addFilters(webConfigurer.corsFilter())
            .build();

        mockMvc.perform(
            get("/api/test-cors")
                .header(HttpHeaders.ORIGIN, "other.domain.com"))
            .andExpect(status().isOk())
            .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    @Test
    public void testCorsFilterDeactivated2() throws Exception {
        props.getCors().setAllowedOrigins(new ArrayList<>());

        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new WebConfigurerTestController())
            .addFilters(webConfigurer.corsFilter())
            .build();

        mockMvc.perform(
            get("/api/test-cors")
                .header(HttpHeaders.ORIGIN, "other.domain.com"))
            .andExpect(status().isOk())
            .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }

    static class MockFilterRegistration implements FilterRegistration, FilterRegistration.Dynamic {

        @Override
        public void addMappingForServletNames(EnumSet<DispatcherType> dispatcherTypes, boolean isMatchAfter, String... servletNames) {

        }

        @Override
        public Collection<String> getServletNameMappings() {
            return null;
        }

        @Override
        public void addMappingForUrlPatterns(EnumSet<DispatcherType> dispatcherTypes, boolean isMatchAfter, String... urlPatterns) {

        }

        @Override
        public Collection<String> getUrlPatternMappings() {
            return null;
        }

        @Override
        public void setAsyncSupported(boolean isAsyncSupported) {

        }

        @Override
        public String getName() {
            return null;
        }

        @Override
        public String getClassName() {
            return null;
        }

        @Override
        public boolean setInitParameter(String name, String value) {
            return false;
        }

        @Override
        public String getInitParameter(String name) {
            return null;
        }

        @Override
        public Set<String> setInitParameters(Map<String, String> initParameters) {
            return null;
        }

        @Override
        public Map<String, String> getInitParameters() {
            return null;
        }
    }

    static class MockServletRegistration implements ServletRegistration, ServletRegistration.Dynamic {

        @Override
        public void setLoadOnStartup(int loadOnStartup) {

        }

        @Override
        public Set<String> setServletSecurity(ServletSecurityElement constraint) {
            return null;
        }

        @Override
        public void setMultipartConfig(MultipartConfigElement multipartConfig) {

        }

        @Override
        public void setRunAsRole(String roleName) {

        }

        @Override
        public void setAsyncSupported(boolean isAsyncSupported) {

        }

        @Override
        public Set<String> addMapping(String... urlPatterns) {
            return null;
        }

        @Override
        public Collection<String> getMappings() {
            return null;
        }

        @Override
        public String getRunAsRole() {
            return null;
        }

        @Override
        public String getName() {
            return null;
        }

        @Override
        public String getClassName() {
            return null;
        }

        @Override
        public boolean setInitParameter(String name, String value) {
            return false;
        }

        @Override
        public String getInitParameter(String name) {
            return null;
        }

        @Override
        public Set<String> setInitParameters(Map<String, String> initParameters) {
            return null;
        }

        @Override
        public Map<String, String> getInitParameters() {
            return null;
        }
    }
    <%_ if (clusteredHttpSession === 'hazelcast' || hibernateCache === 'hazelcast') { _%>

    public static class MockHazelcastInstance implements HazelcastInstance {

        @Override
        public String getName() {
            return "HazelcastInstance";
        }

        @Override
        public <E> IQueue<E> getQueue(String s) {
            return null;
        }

        @Override
        public <E> ITopic<E> getTopic(String s) {
            return null;
        }

        @Override
        public <E> ISet<E> getSet(String s) {
            return null;
        }

        @Override
        public <E> IList<E> getList(String s) {
            return null;
        }

        @Override
        public <K, V> IMap<K, V> getMap(String s) {
            return null;
        }

        @Override
        public <K, V> ReplicatedMap<K, V> getReplicatedMap(String s) {
            return null;
        }

        @Override
        public JobTracker getJobTracker(String s) {
            return null;
        }

        @Override
        public <K, V> MultiMap<K, V> getMultiMap(String s) {
            return null;
        }

        @Override
        public ILock getLock(String s) {
            return null;
        }

        @Override
        public <E> Ringbuffer<E> getRingbuffer(String s) {
            return null;
        }

        @Override
        public <E> ITopic<E> getReliableTopic(String s) {
            return null;
        }

        @Override
        public Cluster getCluster() {
            return null;
        }

        @Override
        public Endpoint getLocalEndpoint() {
            return null;
        }

        @Override
        public IExecutorService getExecutorService(String s) {
            return null;
        }

        @Override
        public DurableExecutorService getDurableExecutorService(String s) {
            return null;
        }

        @Override
        public <T> T executeTransaction(TransactionalTask<T> transactionalTask) throws TransactionException {
            return null;
        }

        @Override
        public <T> T executeTransaction(TransactionOptions transactionOptions, TransactionalTask<T> transactionalTask) throws TransactionException {
            return null;
        }

        @Override
        public TransactionContext newTransactionContext() {
            return null;
        }

        @Override
        public TransactionContext newTransactionContext(TransactionOptions transactionOptions) {
            return null;
        }

        @Override
        public IdGenerator getIdGenerator(String s) {
            return null;
        }

        @Override
        public IAtomicLong getAtomicLong(String s) {
            return null;
        }

        @Override
        public <E> IAtomicReference<E> getAtomicReference(String s) {
            return null;
        }

        @Override
        public ICountDownLatch getCountDownLatch(String s) {
            return null;
        }

        @Override
        public ISemaphore getSemaphore(String s) {
            return null;
        }

        @Override
        public Collection<DistributedObject> getDistributedObjects() {
            return null;
        }

        @Override
        public String addDistributedObjectListener(DistributedObjectListener distributedObjectListener) {
            return null;
        }

        @Override
        public boolean removeDistributedObjectListener(String s) {
            return false;
        }

        @Override
        public Config getConfig() {
            return null;
        }

        @Override
        public PartitionService getPartitionService() {
            return null;
        }

        @Override
        public QuorumService getQuorumService() {
            return null;
        }

        @Override
        public ClientService getClientService() {
            return null;
        }

        @Override
        public LoggingService getLoggingService() {
            return null;
        }

        @Override
        public LifecycleService getLifecycleService() {
            return null;
        }

        @Override
        public <T extends DistributedObject> T getDistributedObject(String s, String s1) {
            return null;
        }

        @Override
        public ConcurrentMap<String, Object> getUserContext() {
            return null;
        }

        @Override
        public HazelcastXAResource getXAResource() {
            return null;
        }

        @Override
        public ICacheManager getCacheManager() {
            return null;
        }

        @Override
        public void shutdown() {

        }
    }
    <%_ } _%>

}
