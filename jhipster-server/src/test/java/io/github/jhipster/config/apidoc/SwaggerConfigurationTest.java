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

package io.github.jhipster.config.apidoc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.ByteBuffer;
import java.util.*;

import org.junit.*;
import org.mockito.*;
import org.springframework.http.ResponseEntity;
import org.springframework.plugin.core.SimplePluginRegistry;

import com.fasterxml.classmate.TypeResolver;
import com.google.common.base.Predicate;

import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.config.JHipsterProperties.Swagger;
import io.github.jhipster.test.LogbackRecorder;
import io.github.jhipster.test.LogbackRecorder.Event;
import springfox.documentation.schema.TypeNameExtractor;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.spi.schema.TypeNameProviderPlugin;
import springfox.documentation.spring.web.plugins.ApiSelectorBuilder;
import springfox.documentation.spring.web.plugins.Docket;

public class SwaggerConfigurationTest {

    private Swagger properties;
    private SwaggerConfiguration config;
    private ApiSelectorBuilder builder;
    private LogbackRecorder recorder;

    @Captor
    private ArgumentCaptor<ApiInfo> infoCaptor;

    @Captor
    private ArgumentCaptor<Predicate<String>> pathsCaptor;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);

        final JHipsterProperties jHipsterProperties = new JHipsterProperties();
        properties = jHipsterProperties.getSwagger();
        properties.setHost("test.host.org");
        properties.setProtocols(new String[] { "http", "https" });
        properties.setTitle("test title");
        properties.setDescription("test description");
        properties.setVersion("6.6.6");
        properties.setTermsOfServiceUrl("http://test.host.org/terms");
        properties.setContactName("test contact");
        properties.setContactEmail("test@host.org");
        properties.setContactUrl("http://test.host.org/contact");
        properties.setLicense("free as in beer");
        properties.setLicenseUrl("http://test.host.org/license");

        config = new SwaggerConfiguration(jHipsterProperties) {
            @Override
            protected Docket createDocket() {
                Docket docket = spy(super.createDocket());
                when(docket.select()).thenReturn(builder = spy(new ApiSelectorBuilder(docket)));
                return docket;
            }
        };

        recorder = LogbackRecorder.forClass(SwaggerConfiguration.class).reset().capture("ALL");
    }

    @After
    public void teardown() {
        recorder.release();
    }

    @Test
    public void testSwaggerSpringfoxApiDocket() {
        Docket docket = config.swaggerSpringfoxApiDocket();

        verify(docket, never()).groupName(anyString());
        verify(docket).host(properties.getHost());
        verify(docket).protocols(new HashSet<>(Arrays.asList(properties.getProtocols())));

        verify(docket).apiInfo(infoCaptor.capture());
        ApiInfo info = infoCaptor.getValue();
        assertThat(info.getTitle()).isEqualTo(properties.getTitle());
        assertThat(info.getDescription()).isEqualTo(properties.getDescription());
        assertThat(info.getVersion()).isEqualTo(properties.getVersion());
        assertThat(info.getTermsOfServiceUrl()).isEqualTo(properties.getTermsOfServiceUrl());
        assertThat(info.getContact().getName()).isEqualTo(properties.getContactName());
        assertThat(info.getContact().getEmail()).isEqualTo(properties.getContactEmail());
        assertThat(info.getContact().getUrl()).isEqualTo(properties.getContactUrl());
        assertThat(info.getLicense()).isEqualTo(properties.getLicense());
        assertThat(info.getLicenseUrl()).isEqualTo(properties.getLicenseUrl());
        assertThat(info.getVendorExtensions()).isEmpty();

        verify(docket).forCodeGeneration(true);
        verify(docket).directModelSubstitute(ByteBuffer.class, String.class);
        verify(docket).genericModelSubstitutes(ResponseEntity.class);

        verify(docket).select();
        verify(builder).paths(pathsCaptor.capture());
        Predicate<String> paths = pathsCaptor.getValue();
        assertThat(paths.apply("/api/foo")).isEqualTo(true);
        assertThat(paths.apply("/foo/api")).isEqualTo(false);

        verify(builder).build();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(2);

        Event event0 = events.get(0);
        assertThat(event0.getLevel()).isEqualTo("DEBUG");
        assertThat(event0.getMessage()).isEqualTo(SwaggerConfiguration.STARTING_MESSAGE);
        assertThat(event0.getThrown()).isNull();

        Event event1 = events.get(1);
        assertThat(event1.getLevel()).isEqualTo("DEBUG");
        assertThat(event1.getMessage()).isEqualTo(SwaggerConfiguration.STARTED_MESSAGE);
        assertThat(event1.getThrown()).isNull();
    }

    @Test
    public void testSwaggerSpringfoxManagementDocket() {
        Docket docket = config.swaggerSpringfoxManagementDocket(properties.getTitle(), "/foo/", properties.getVersion
            ());

        verify(docket).groupName(SwaggerConfiguration.MANAGEMENT_GROUP_NAME);
        verify(docket).host(properties.getHost());
        verify(docket).protocols(new HashSet<>(Arrays.asList(properties.getProtocols())));

        verify(docket).apiInfo(infoCaptor.capture());
        ApiInfo info = infoCaptor.getValue();
        assertThat(info.getTitle()).isEqualTo(properties.getTitle() + " " + SwaggerConfiguration
            .MANAGEMENT_TITLE_SUFFIX);
        assertThat(info.getDescription()).isEqualTo(SwaggerConfiguration.MANAGEMENT_DESCRIPTION);
        assertThat(info.getVersion()).isEqualTo(properties.getVersion());
        assertThat(info.getTermsOfServiceUrl()).isEqualTo("");
        assertThat(info.getContact().getName()).isEqualTo(ApiInfo.DEFAULT_CONTACT.getName());
        assertThat(info.getContact().getEmail()).isEqualTo(ApiInfo.DEFAULT_CONTACT.getEmail());
        assertThat(info.getContact().getUrl()).isEqualTo(ApiInfo.DEFAULT_CONTACT.getUrl());
        assertThat(info.getLicense()).isEqualTo("");
        assertThat(info.getLicenseUrl()).isEqualTo("");
        assertThat(info.getVendorExtensions()).isEmpty();

        verify(docket).forCodeGeneration(true);
        verify(docket).directModelSubstitute(ByteBuffer.class, String.class);
        verify(docket).genericModelSubstitutes(ResponseEntity.class);

        verify(docket).select();
        verify(builder).paths(pathsCaptor.capture());
        Predicate<String> paths = pathsCaptor.getValue();
        assertThat(paths.apply("/api/foo")).isEqualTo(false);
        assertThat(paths.apply("/foo/api")).isEqualTo(true);

        verify(builder).build();
    }

    @Test
    public void testPageableParameterBuilderPlugin() {
        TypeResolver resolver = new TypeResolver();
        List<TypeNameProviderPlugin> plugins = new LinkedList<>();
        TypeNameExtractor extractor = new TypeNameExtractor(resolver, SimplePluginRegistry.create(plugins));
        PageableParameterBuilderPlugin plugin = config.pageableParameterBuilderPlugin(extractor, resolver);
        assertThat(plugin.getResolver()).isEqualTo(resolver);
        assertThat(plugin.getNameExtractor()).isEqualTo(extractor);
    }
}
