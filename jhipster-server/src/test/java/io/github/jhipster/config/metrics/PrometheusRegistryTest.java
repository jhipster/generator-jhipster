package io.github.jhipster.config.metrics;

import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.test.LogbackRecorder;
import io.github.jhipster.test.LogbackRecorder.Event;
import io.prometheus.client.CollectorRegistry;
import io.prometheus.client.dropwizard.DropwizardExports;
import io.prometheus.client.exporter.MetricsServlet;

import java.util.List;

import javax.servlet.Servlet;
import javax.servlet.ServletRegistration.Dynamic;

import com.codahale.metrics.MetricRegistry;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.mock.web.MockServletContext;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Matchers.eq;
import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class PrometheusRegistryTest {

    public static final String METRICS_ENDPOINT = "/my/only/friend";

    private JHipsterProperties properties;
    private MetricRegistry registry;
    private LogbackRecorder recorder;

    @Before
    public void setup() {
        registry = new MetricRegistry();

        properties = new JHipsterProperties();
        JHipsterProperties.Metrics.Prometheus prometheus = properties.getMetrics().getPrometheus();
        prometheus.setEnabled(true);
        prometheus.setEndpoint(METRICS_ENDPOINT);

        recorder = LogbackRecorder.forClass(PrometheusRegistry.class).reset().capture("ALL");
    }

    @After
    public void teardown() {
        recorder.release();
    }

    @Test
    public void testDisabled() {
        properties.getMetrics().getPrometheus().setEnabled(false);
        PrometheusRegistry prometheus = new PrometheusRegistry(registry, properties);

        Throwable caught = catchThrowable(() -> prometheus.onStartup(null));
        assertThat(caught).isNull();

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testEnabled() {
        PrometheusRegistry prometheus = spy(new PrometheusRegistry(registry, properties));

        CollectorRegistry collector = spy(prometheus.getCollector());
        when(prometheus.getCollector()).thenReturn(collector);

        Dynamic dynamic = spy(Dynamic.class);
        MockServletContext context = spy(new MockServletContext() {
            @Override
            public Dynamic addServlet(String name, Servlet servlet) {
                return dynamic;
            }
        });

        Throwable caught = catchThrowable(() -> prometheus.onStartup(context));
        assertThat(caught).isNull();

        verify(collector).register(isA(DropwizardExports.class));
        verify(context).addServlet(eq(PrometheusRegistry.SERVLET_NAME), isA(MetricsServlet.class));
        verify(dynamic).addMapping(METRICS_ENDPOINT);

        List<Event> events = recorder.play();
        assertThat(events).hasSize(1);
        Event event = events.get(0);
        assertThat(event.getLevel()).isEqualTo("INFO");
        assertThat(event.getMessage()).isEqualTo(PrometheusRegistry.INITIALIZING_MESSAGE);
    }
}
