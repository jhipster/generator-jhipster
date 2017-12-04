package io.github.jhipster.config.metrics;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.junit.*;

import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.graphite.Graphite;
import com.codahale.metrics.graphite.GraphiteReporter;

import io.github.jhipster.config.JHipsterProperties;
import io.github.jhipster.test.LogbackRecorder;
import io.github.jhipster.test.LogbackRecorder.Event;

public class GraphiteRegistryTest {

    public static final String METRICS_HOST = "foo.bar.baz";
    public static final int METRICS_PORT = 4242;
    public static final String METRICS_PREFIX = "hello";

    private JHipsterProperties properties;
    private MetricRegistry registry;
    private LogbackRecorder recorder;

    @Before
    public void setup() {
        registry = new MetricRegistry();

        properties = new JHipsterProperties();
        JHipsterProperties.Metrics.Graphite graphite = properties.getMetrics().getGraphite();
        graphite.setEnabled(true);
        graphite.setHost(METRICS_HOST);
        graphite.setPort(METRICS_PORT);
        graphite.setPrefix(METRICS_PREFIX);

        recorder = LogbackRecorder.forClass(GraphiteRegistry.class).reset().capture("ALL");
    }

    @After
    public void teardown() {
        recorder.release();
    }

    @Test
    public void testDisabled() {
        properties.getMetrics().getGraphite().setEnabled(false);
        new GraphiteRegistry(registry, properties);

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testEnabled() {
        GraphiteReporter.Builder builder = spy(GraphiteReporter.forRegistry(registry));
        GraphiteReporter reporter = spy(builder.build(null));
        when(builder.build(isA(Graphite.class))).thenReturn(reporter);

        new GraphiteRegistry(registry, properties) {

            @Override
            Graphite getGraphite(String graphiteHost, int graphitePort) {
                assertThat(graphiteHost).isEqualTo(METRICS_HOST);
                assertThat(graphitePort).isEqualTo(METRICS_PORT);
                return super.getGraphite(graphiteHost, graphitePort);
            }

            @Override
            GraphiteReporter.Builder getBuilder(MetricRegistry metricRegistry) {
                super.getBuilder(metricRegistry);
                return builder;
            }
        };

        verify(builder).convertRatesTo(TimeUnit.SECONDS);
        verify(builder).convertDurationsTo(TimeUnit.MILLISECONDS);
        verify(builder).prefixedWith(METRICS_PREFIX);
        verify(builder).build(isA(Graphite.class));
        verify(reporter).start(GraphiteRegistry.REPORTER_PERIOD, TimeUnit.MINUTES);

        List<Event> events = recorder.play();
        assertThat(events).hasSize(1);
        Event event = events.get(0);
        assertThat(event.getLevel()).isEqualTo("INFO");
        assertThat(event.getMessage()).isEqualTo(GraphiteRegistry.INITIALIZING_MESSAGE);
    }
}
