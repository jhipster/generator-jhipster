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

package io.github.jhipster.test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Mockito.mock;

import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.slf4j.*;

import io.github.jhipster.test.LogbackRecorder.Event;

public class LogbackRecorderTest {

    private static final String[] TEST_MESSAGES = { "error", "warn", "info", "debug", "trace" };
    private static final Object[] TEST_ARGUMENTS = { null, true, 1, 2D, 3F };

    private final Logger log = LoggerFactory.getLogger(LogbackRecorderTest.class);
    private final Marker marker = MarkerFactory.getMarker(log.getName());

    private final Exception exception = new RuntimeException("Eek");

    private LogbackRecorder recorder = LogbackRecorder.forLogger(log);

    @Before
    public void setup() {
        recorder.reset();
    }

    @Test
    public void testTrace() {
        recorder.capture("TRACE");

        write();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(5);

        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            assertThat(event.getMarker()).isEqualTo(marker);
            assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[i].toUpperCase());
            assertThat(event.getMessage()).startsWith(TEST_MESSAGES[i]);
            assertThat(event.getArguments()).hasSize(1);
            assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[i]);
            assertThat(event.getThrown()).isNull();
        }

        recorder.release();
    }

    @Test
    public void testTraceWithException() {
        recorder.capture("TRACE");

        writeWithException();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(5);

        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            assertThat(event.getMarker()).isEqualTo(marker);
            assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[i].toUpperCase());
            assertThat(event.getMessage()).startsWith(TEST_MESSAGES[i]);
            assertThat(event.getArguments()).hasSize(1);
            assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[i]);
            assertThat(event.getThrown()).isEqualTo(exception.toString());
        }

        recorder.release();
    }

    @Test
    public void testDebug() {
        recorder.capture("DEBUG");

        write();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(4);

        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            assertThat(event.getMarker()).isEqualTo(marker);
            assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[i].toUpperCase());
            assertThat(event.getMessage()).startsWith(TEST_MESSAGES[i]);
            assertThat(event.getArguments()).hasSize(1);
            assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[i]);
            assertThat(event.getThrown()).isNull();
        }

        recorder.release();
    }

    @Test
    public void testDebugWithException() {
        recorder.capture("DEBUG");

        writeWithException();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(4);

        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            assertThat(event.getMarker()).isEqualTo(marker);
            assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[i].toUpperCase());
            assertThat(event.getMessage()).startsWith(TEST_MESSAGES[i]);
            assertThat(event.getArguments()).hasSize(1);
            assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[i]);
            assertThat(event.getThrown()).isEqualTo(exception.toString());
        }

        recorder.release();
    }

    @Test
    public void testInfo() {
        recorder.capture("INFO");

        write();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(3);

        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            assertThat(event.getMarker()).isEqualTo(marker);
            assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[i].toUpperCase());
            assertThat(event.getMessage()).startsWith(TEST_MESSAGES[i]);
            assertThat(event.getArguments()).hasSize(1);
            assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[i]);
            assertThat(event.getThrown()).isNull();
        }

        recorder.release();
    }

    @Test
    public void testInfoWithException() {
        recorder.capture("INFO");

        writeWithException();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(3);

        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            assertThat(event.getMarker()).isEqualTo(marker);
            assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[i].toUpperCase());
            assertThat(event.getMessage()).startsWith(TEST_MESSAGES[i]);
            assertThat(event.getArguments()).hasSize(1);
            assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[i]);
            assertThat(event.getThrown()).isEqualTo(exception.toString());
        }

        recorder.release();
    }

    @Test
    public void testWarn() {
        recorder.capture("WARN");

        write();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(2);

        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            assertThat(event.getMarker()).isEqualTo(marker);
            assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[i].toUpperCase());
            assertThat(event.getMessage()).startsWith(TEST_MESSAGES[i]);
            assertThat(event.getArguments()).hasSize(1);
            assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[i]);
            assertThat(event.getThrown()).isNull();
        }

        recorder.release();
    }

    @Test
    public void testWarnWithException() {
        recorder.capture("WARN");

        writeWithException();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(2);

        for (int i = 0; i < events.size(); i++) {
            Event event = events.get(i);
            assertThat(event.getMarker()).isEqualTo(marker);
            assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[i].toUpperCase());
            assertThat(event.getMessage()).startsWith(TEST_MESSAGES[i]);
            assertThat(event.getArguments()).hasSize(1);
            assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[i]);
            assertThat(event.getThrown()).isEqualTo(exception.toString());
        }

        recorder.release();
    }

    @Test
    public void testError() {
        recorder.capture("ERROR");

        write();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(1);

        Event event = events.get(0);
        assertThat(event.getMarker()).isEqualTo(marker);
        assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[0].toUpperCase());
        assertThat(event.getMessage()).startsWith(TEST_MESSAGES[0]);
        assertThat(event.getArguments()).hasSize(1);
        assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[0]);
        assertThat(event.getThrown()).isNull();

        recorder.release();
    }

    @Test
    public void testErrorWithException() {
        recorder.capture("ERROR");

        writeWithException();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(1);

        Event event = events.get(0);
        assertThat(event.getMarker()).isEqualTo(marker);
        assertThat(event.getLevel()).isEqualTo(TEST_MESSAGES[0].toUpperCase());
        assertThat(event.getMessage()).startsWith(TEST_MESSAGES[0]);
        assertThat(event.getArguments()).hasSize(1);
        assertThat(event.getArguments()[0]).isEqualTo(TEST_ARGUMENTS[0]);
        assertThat(event.getThrown()).isEqualTo(exception.toString());

        recorder.release();
    }

    @Test
    public void testOff() {
        recorder.capture("OFF");

        write();

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();

        recorder.release();
    }

    @Test
    public void testOffWithException() {
        recorder.capture("OFF");

        writeWithException();

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();

        recorder.release();
    }

    @Test
    public void testLogbackException() {
        Throwable caught = catchThrowable(() -> {
            LogbackRecorder.forLogger(mock(Logger.class));
        });
        assertThat(caught).isInstanceOf(IllegalArgumentException.class);
        assertThat(caught).hasMessage(LogbackRecorder.LOGBACK_EXCEPTION_MESSAGE);
    }

    @Test
    public void testCaptureException() {
        recorder.capture("ALL");
        Throwable caught = catchThrowable(() -> {
            recorder.capture("ALL");
        });
        assertThat(caught).isInstanceOf(IllegalStateException.class);
        assertThat(caught).hasMessage(LogbackRecorder.CAPTURE_EXCEPTION_MESSAGE);
        recorder.release();
    }

    @Test
    public void testReleaseException() {
        Throwable caught = catchThrowable(() -> {
            recorder.release();
        });
        assertThat(caught).isInstanceOf(IllegalStateException.class);
        assertThat(caught).hasMessage(LogbackRecorder.RELEASE_EXCEPTION_MESSAGE);
    }

    @Test
    public void testClear() {
        recorder.capture("TRACE");

        write();

        recorder.release();

        assertThat(recorder.play()).hasSize(5);
        recorder.reset();
        assertThat(recorder.play()).isEmpty();
    }

    private void write() {
        log.error(marker, TEST_MESSAGES[0] + " {}", TEST_ARGUMENTS[0]);
        log.warn(marker, TEST_MESSAGES[1] + " {}", TEST_ARGUMENTS[1]);
        log.info(marker, TEST_MESSAGES[2] + " {}", TEST_ARGUMENTS[2]);
        log.debug(marker, TEST_MESSAGES[3] + " {}", TEST_ARGUMENTS[3]);
        log.trace(marker, TEST_MESSAGES[4] + " {}", TEST_ARGUMENTS[4]);
    }

    private void writeWithException() {
        log.error(marker, TEST_MESSAGES[0] + " {}", TEST_ARGUMENTS[0], exception);
        log.warn(marker, TEST_MESSAGES[1] + " {}", TEST_ARGUMENTS[1], exception);
        log.info(marker, TEST_MESSAGES[2] + " {}", TEST_ARGUMENTS[2], exception);
        log.debug(marker, TEST_MESSAGES[3] + " {}", TEST_ARGUMENTS[3], exception);
        log.trace(marker, TEST_MESSAGES[4] + " {}", TEST_ARGUMENTS[4], exception);
    }
}
