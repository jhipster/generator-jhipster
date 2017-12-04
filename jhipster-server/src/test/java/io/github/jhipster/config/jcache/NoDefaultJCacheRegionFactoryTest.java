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

package io.github.jhipster.config.jcache;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import org.junit.Before;
import org.junit.Test;

import io.github.jhipster.test.LogbackRecorder;

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
