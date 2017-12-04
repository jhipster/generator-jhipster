package io.github.jhipster.config.liquibase;

import static io.github.jhipster.config.JHipsterConstants.SPRING_PROFILE_DEVELOPMENT;
import static io.github.jhipster.config.JHipsterConstants.SPRING_PROFILE_HEROKU;
import static io.github.jhipster.config.JHipsterConstants.SPRING_PROFILE_NO_LIQUIBASE;
import static io.github.jhipster.config.JHipsterConstants.SPRING_PROFILE_PRODUCTION;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Mockito.*;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import javax.sql.DataSource;

import org.junit.*;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.mock.env.MockEnvironment;

import io.github.jhipster.test.LogbackRecorder;
import io.github.jhipster.test.LogbackRecorder.Event;
import liquibase.Liquibase;
import liquibase.exception.LiquibaseException;

public class AsyncSpringLiquibaseTest {

    private LiquibaseException exception = new LiquibaseException("Eek");

    private SimpleAsyncTaskExecutor executor;
    private ConfigurableEnvironment environment;
    private TestAsyncSpringLiquibase config;
    private LogbackRecorder recorder;

    @Before
    public void setup() {
        executor = new SimpleAsyncTaskExecutor();
        recorder = LogbackRecorder.forClass(MockEnvironment.class).reset().capture("ALL");
        environment = new MockEnvironment();
        recorder.release();
        config = spy(new TestAsyncSpringLiquibase(executor, environment));
        recorder = LogbackRecorder.forClass(AsyncSpringLiquibase.class).reset().capture("ALL");
    }

    @After
    public void teardown() {
        recorder.release();
    }

    @Test
    public void testProfileNoLiquibase() {
        environment.setActiveProfiles(SPRING_PROFILE_NO_LIQUIBASE);

        Throwable caught;
        synchronized (executor) {
            caught = catchThrowable(() -> {
                config.afterPropertiesSet();
                executor.wait(100);
            });
            assertThat(caught).isNull();
        }

        caught = catchThrowable(() -> verify(config, never()).initDb());
        assertThat(caught).isNull();

        List<Event> events = recorder.play();

        assertThat(events).hasSize(1);
        Event event = events.get(0);
        assertThat(event.getLevel()).isEqualTo("DEBUG");
        assertThat(event.getMessage()).isEqualTo(AsyncSpringLiquibase.DISABLED_MESSAGE);
        assertThat(event.getThrown()).isNull();
    }

    @Test
    public void testProfileProduction() {
        environment.setActiveProfiles(SPRING_PROFILE_PRODUCTION);

        Throwable caught;
        synchronized (executor) {
            caught = catchThrowable(() -> {
                config.afterPropertiesSet();
                executor.wait(100);
            });
            assertThat(caught).isNull();
        }

        caught = catchThrowable(() -> verify(config).initDb());
        assertThat(caught).isNull();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(2);
        Event event0 = events.get(0);
        assertThat(event0.getLevel()).isEqualTo("DEBUG");
        assertThat(event0.getMessage()).isEqualTo(AsyncSpringLiquibase.STARTING_SYNC_MESSAGE);
        assertThat(event0.getThrown()).isNull();
        Event event1 = events.get(1);
        assertThat(event1.getLevel()).isEqualTo("DEBUG");
        assertThat(event1.getMessage()).isEqualTo(AsyncSpringLiquibase.STARTED_MESSAGE);
        assertThat(event1.getThrown()).isNull();
    }

    @Test
    public void testProfileDevelopment() {
        environment.setActiveProfiles(SPRING_PROFILE_DEVELOPMENT);

        Throwable caught;
        synchronized (executor) {
            caught = catchThrowable(() -> {
                config.afterPropertiesSet();
                executor.wait(100);
            });
            assertThat(caught).isNull();
        }

        caught = catchThrowable(() -> verify(config).initDb());
        assertThat(caught).isNull();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(2);
        Event event0 = events.get(0);
        assertThat(event0.getLevel()).isEqualTo("WARN");
        assertThat(event0.getMessage()).isEqualTo(AsyncSpringLiquibase.STARTING_ASYNC_MESSAGE);
        assertThat(event0.getThrown()).isNull();
        Event event1 = events.get(1);
        assertThat(event1.getLevel()).isEqualTo("DEBUG");
        assertThat(event1.getMessage()).isEqualTo(AsyncSpringLiquibase.STARTED_MESSAGE);
        assertThat(event1.getThrown()).isNull();
    }

    @Test
    public void testProfileHeroku() {
        environment.setActiveProfiles(SPRING_PROFILE_HEROKU);

        Throwable caught;
        synchronized (executor) {
            caught = catchThrowable(() -> {
                config.afterPropertiesSet();
                executor.wait(100);
            });
            assertThat(caught).isNull();
        }

        caught = catchThrowable(() -> verify(config).initDb());
        assertThat(caught).isNull();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(2);
        Event event0 = events.get(0);
        assertThat(event0.getLevel()).isEqualTo("WARN");
        assertThat(event0.getMessage()).isEqualTo(AsyncSpringLiquibase.STARTING_ASYNC_MESSAGE);
        assertThat(event0.getThrown()).isNull();
        Event event1 = events.get(1);
        assertThat(event1.getLevel()).isEqualTo("DEBUG");
        assertThat(event1.getMessage()).isEqualTo(AsyncSpringLiquibase.STARTED_MESSAGE);
        assertThat(event1.getThrown()).isNull();
    }

    @Test
    public void testSlow() {
        environment.setActiveProfiles(SPRING_PROFILE_DEVELOPMENT, SPRING_PROFILE_HEROKU);
        doReturn(AsyncSpringLiquibase.SLOWNESS_THRESHOLD * 1000L + 100L).when(config).getSleep();
        Throwable caught;

        synchronized (executor) {
            caught = catchThrowable(() -> {
                config.afterPropertiesSet();
                executor.wait(config.getSleep() + 100L);
            });
            assertThat(caught).isNull();
        }

        caught = catchThrowable(() -> verify(config).initDb());
        assertThat(caught).isNull();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(3);
        Event event0 = events.get(0);
        assertThat(event0.getLevel()).isEqualTo("WARN");
        assertThat(event0.getMessage()).isEqualTo(AsyncSpringLiquibase.STARTING_ASYNC_MESSAGE);
        assertThat(event0.getThrown()).isNull();
        Event event1 = events.get(1);
        assertThat(event1.getLevel()).isEqualTo("DEBUG");
        assertThat(event1.getMessage()).isEqualTo(AsyncSpringLiquibase.STARTED_MESSAGE);
        assertThat(event1.getThrown()).isNull();
        Event event2 = events.get(2);
        assertThat(event2.getLevel()).isEqualTo("WARN");
        assertThat(event2.getMessage()).isEqualTo(AsyncSpringLiquibase.SLOWNESS_MESSAGE);
        assertThat(event2.getThrown()).isNull();
    }

    @Test
    public void testException() {
        environment.setActiveProfiles(SPRING_PROFILE_DEVELOPMENT, SPRING_PROFILE_HEROKU);

        Throwable caught = catchThrowable(() -> doThrow(exception).when(config).initDb());
        assertThat(caught).isNull();

        synchronized (executor) {
            caught = catchThrowable(() -> {
                config.afterPropertiesSet();
                executor.wait(100);
            });
            assertThat(caught).isNull();
        }

        caught = catchThrowable(() -> verify(config).initDb());
        assertThat(caught).isNull();

        List<Event> events = recorder.play();
        assertThat(events).hasSize(2);
        Event event0 = events.get(0);
        assertThat(event0.getLevel()).isEqualTo("WARN");
        assertThat(event0.getMessage()).isEqualTo(AsyncSpringLiquibase.STARTING_ASYNC_MESSAGE);
        assertThat(event0.getThrown()).isNull();
        Event event1 = events.get(1);
        assertThat(event1.getLevel()).isEqualTo("ERROR");
        assertThat(event1.getMessage()).isEqualTo(AsyncSpringLiquibase.EXCEPTION_MESSAGE);
        assertThat(event1.getThrown()).isEqualTo(exception.toString());
    }

    private class TestAsyncSpringLiquibase
        extends AsyncSpringLiquibase {

        public TestAsyncSpringLiquibase(TaskExecutor executor, Environment environment) {
            super(executor, environment);
        }

        @Override
        protected void initDb() throws LiquibaseException {
            synchronized (executor) {
                super.initDb();
                executor.notifyAll();
            }
        }

        @Override
        public DataSource getDataSource() {
            DataSource source = mock(DataSource.class);
            try {
                doReturn(mock(Connection.class)).when(source).getConnection();
            } catch (SQLException x) {
                // This should never happen
                throw new Error(x);
            }
            return source;
        }

        @Override
        protected Liquibase createLiquibase(Connection c) {
            return null;
        }

        @Override
        protected void performUpdate(Liquibase liquibase) {
            long sleep = getSleep();
            if (sleep > 0) {
                try {
                    Thread.sleep(sleep);
                } catch (InterruptedException x) {
                    // This should never happen
                    throw new Error(x);
                }
            }
        }

        long getSleep() {
            return 0L;
        }
    }
}
