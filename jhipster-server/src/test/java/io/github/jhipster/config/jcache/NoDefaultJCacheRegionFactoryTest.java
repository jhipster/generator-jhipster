package io.github.jhipster.config.jcache;

import org.junit.Before;
import org.junit.Test;

import io.github.jhipster.test.LogbackRecorder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

public class NoDefaultJCacheRegionFactoryTest {

    private NoDefaultJCacheRegionFactory factory;

    @Before
    public void setup() {
        LogbackRecorder recorder = LogbackRecorder.forName("org.jboss.logging").reset().capture("ALL");
        factory = new NoDefaultJCacheRegionFactory();
        recorder.release();
    }

    @Test
    public void testNoDefaultJCacheRegionFactory() {
        Throwable caught = catchThrowable(() -> factory.createCache("krypton", null, null));
        assertThat(caught).isInstanceOf(IllegalStateException.class);
        assertThat(caught.getMessage()).isEqualTo(NoDefaultJCacheRegionFactory.EXCEPTION_MESSAGE + " krypton");
    }
}
