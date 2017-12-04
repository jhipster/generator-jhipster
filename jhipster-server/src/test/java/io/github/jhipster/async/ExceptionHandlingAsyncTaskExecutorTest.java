package io.github.jhipster.async;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.core.task.SimpleAsyncTaskExecutor;

import io.github.jhipster.test.LogbackRecorder;
import io.github.jhipster.test.LogbackRecorder.Event;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

public class ExceptionHandlingAsyncTaskExecutorTest {

    private static final RuntimeException exception = new RuntimeException("Eek");
    private static final int testResult = 42;

    private boolean done;
    private Exception handled;
    private MockAsyncTaskExecutor task;
    private ExceptionHandlingAsyncTaskExecutor executor;
    private LogbackRecorder recorder;

    @Before
    public void setup() {
        done = false;
        handled = null;
        task = spy(new MockAsyncTaskExecutor());
        executor = new TestExceptionHandlingAsyncTaskExecutor(task);
        recorder = LogbackRecorder.forClass(ExceptionHandlingAsyncTaskExecutor.class).reset().capture("ALL");
    }

    @After
    public void teardown() {
        recorder.release();
    }

    @Test
    public void testExecuteWithoutException() {
        Runnable runnable = spy(new MockRunnableWithoutException());
        Throwable caught = null;
        try {
            synchronized (executor) {
                executor.execute(runnable);
                executor.wait(100);
            }
        } catch (InterruptedException x) {
            // This should never happen
            throw new Error(x);
        } catch (Exception x) {
            caught = x;
        }
        assertThat(done).isEqualTo(true);
        verify(runnable).run();
        assertThat(caught).isNull();
        assertThat(handled).isNull();

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testExecuteWithException() {
        Runnable runnable = spy(new MockRunnableWithException());
        Throwable caught = null;
        try {
            synchronized (executor) {
                executor.execute(runnable, AsyncTaskExecutor.TIMEOUT_INDEFINITE);
                executor.wait(100);
            }
        } catch (InterruptedException x) {
            // This should never happen
            throw new Error(x);
        } catch (Exception x) {
            caught = x;
        }
        assertThat(done).isEqualTo(true);
        verify(runnable).run();
        assertThat(caught).isNull();
        assertThat(handled).isEqualTo(exception);

        List<Event> events = recorder.play();
        assertThat(events).hasSize(1);
        Event event = events.get(0);
        assertThat(event.getLevel()).isEqualTo("ERROR");
        assertThat(event.getMessage()).isEqualTo(ExceptionHandlingAsyncTaskExecutor.EXCEPTION_MESSAGE);
        assertThat(event.getThrown()).isEqualTo(exception.toString());
    }

    @Test
    public void testSubmitRunnableWithoutException() {
        Runnable runnable = spy(new MockRunnableWithoutException());
        Future<?> future = executor.submit(runnable);
        Throwable caught = catchThrowable(() -> future.get());
        assertThat(done).isEqualTo(true);
        verify(runnable).run();
        assertThat(caught).isNull();
        assertThat(handled).isNull();

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testSubmitRunnableWithException() {
        Runnable runnable = spy(new MockRunnableWithException());
        Future<?> future = executor.submit(runnable);
        Throwable caught = catchThrowable(() -> future.get());
        assertThat(done).isEqualTo(true);
        verify(runnable).run();
        assertThat(caught).isNull();
        assertThat(handled).isEqualTo(exception);

        List<Event> events = recorder.play();
        assertThat(events).hasSize(1);
        Event event = events.get(0);
        assertThat(event.getLevel()).isEqualTo("ERROR");
        assertThat(event.getMessage()).isEqualTo(ExceptionHandlingAsyncTaskExecutor.EXCEPTION_MESSAGE);
        assertThat(event.getThrown()).isEqualTo(exception.toString());
    }

    @Test
    public void testSubmitCallableWithoutException() {
        Callable<Integer> callable = spy(new MockCallableWithoutException());
        Future<Integer> future = executor.submit(callable);
        Throwable caught = catchThrowable(() -> assertThat(future.get()).isEqualTo(42));
        assertThat(done).isEqualTo(true);
        assertThat(caught).isNull();
        assertThat(handled).isNull();

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testSubmitCallableWithException() {
        Callable<Integer> callable = spy(new MockCallableWithException());
        Future<Integer> future = executor.submit(callable);
        Throwable caught = catchThrowable(() -> future.get());
        assertThat(done).isEqualTo(true);
        assertThat(caught).isInstanceOf(ExecutionException.class);
        assertThat(caught.getCause()).isEqualTo(handled);
        assertThat(handled).isEqualTo(exception);

        List<Event> events = recorder.play();
        assertThat(events).hasSize(1);
        Event event = events.get(0);
        assertThat(event.getLevel()).isEqualTo("ERROR");
        assertThat(event.getMessage()).isEqualTo(ExceptionHandlingAsyncTaskExecutor.EXCEPTION_MESSAGE);
        assertThat(event.getThrown()).isEqualTo(exception.toString());
    }

    @Test
    public void testInitializingExecutor() {
        task = spy(new MockAsyncInitializingTaskExecutor());
        executor = new TestExceptionHandlingAsyncTaskExecutor(task);
        Throwable caught = catchThrowable(() -> {
            executor.afterPropertiesSet();
            verify(task).afterPropertiesSet();
        });
        assertThat(caught).isNull();
    }

    @Test
    public void testNonInitializingExecutor() {
        Throwable caught = catchThrowable(() -> {
            executor.afterPropertiesSet();
            verify(task, never()).afterPropertiesSet();
        });
        assertThat(caught).isNull();
    }

    @Test
    public void testDisposableExecutor() {
        task = spy(new MockAsyncDisposableTaskExecutor());
        executor = new TestExceptionHandlingAsyncTaskExecutor(task);
        Throwable caught = catchThrowable(() -> {
            executor.destroy();
            verify(task).destroy();
        });
        assertThat(caught).isNull();
    }

    @Test
    public void testNonDisposableExecutor() {
        Throwable caught = catchThrowable(() -> {
            executor.destroy();
            verify(task, never()).destroy();
        });
        assertThat(caught).isNull();
    }

    private class TestExceptionHandlingAsyncTaskExecutor
    extends ExceptionHandlingAsyncTaskExecutor {

        TestExceptionHandlingAsyncTaskExecutor(AsyncTaskExecutor executor) {
            super(executor);
        }

        @Override
        protected void handle(Exception exception) {
            synchronized (executor) {
                handled = exception;
                super.handle(exception);
                executor.notifyAll();
            }
        }
    }

    private class MockRunnableWithoutException implements Runnable {
        @Override
        public void run() {
            synchronized (executor) {
                done = true;
                executor.notifyAll();
            }
        }
    }

    private class MockRunnableWithException implements Runnable {
        @Override
        public void run() {
            synchronized (executor) {
                done = true;
                throw exception;
            }
        }
    }

    private class MockCallableWithoutException implements Callable<Integer> {
        @Override
        public Integer call() {
            done = true;
            return testResult;
        }
    }

    private class MockCallableWithException implements Callable<Integer> {
        @Override
        public Integer call() {
            done = true;
            throw exception;
        }
    }

    @SuppressWarnings("serial")
    private class MockAsyncTaskExecutor extends SimpleAsyncTaskExecutor {

        public void afterPropertiesSet() {}

        public void destroy() {}
    }

    @SuppressWarnings("serial")
    private class MockAsyncInitializingTaskExecutor extends MockAsyncTaskExecutor
        implements InitializingBean {
    }

    @SuppressWarnings("serial")
    private class MockAsyncDisposableTaskExecutor extends MockAsyncTaskExecutor
        implements DisposableBean {
    }
}
