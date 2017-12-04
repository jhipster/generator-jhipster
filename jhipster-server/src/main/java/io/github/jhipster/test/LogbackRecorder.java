package io.github.jhipster.test;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.WeakHashMap;

import org.slf4j.LoggerFactory;
import org.slf4j.Marker;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.classic.spi.IThrowableProxy;
import ch.qos.logback.core.AppenderBase;

/**
 * Utility, mainly for unit tests, to assert content written to logback.
 */
@ConditionalOnClass({ LoggerContext.class })
public class LogbackRecorder {

    public static final boolean DEFAULT_MUTE = true;
    public static final String DEFAULT_LEVEL = "ALL";

    public static final String LOGBACK_EXCEPTION_MESSAGE = "Expected logback";
    public static final String CAPTURE_EXCEPTION_MESSAGE = "Already capturing";
    public static final String RELEASE_EXCEPTION_MESSAGE = "Not currently capturing";

    private static final LoggerContext context =  (LoggerContext) LoggerFactory.getILoggerFactory();
    private static final Object lock = context.getConfigurationLock();

    private static final Map<Logger, LogbackRecorder> instances = new WeakHashMap<>(32, 0.75F);


    public static final LogbackRecorder forClass(Class<?> clazz) {
        return forLogger(context.getLogger(clazz));
    }

    public static final LogbackRecorder forName(String name) {
        return forLogger(context.getLogger(name));
    }

    public static final LogbackRecorder forLogger(org.slf4j.Logger logger) {
        synchronized (instances) {
            if (!(logger instanceof Logger)) {
                throw new IllegalArgumentException(LOGBACK_EXCEPTION_MESSAGE);
            }
            LogbackRecorder recorder = instances.get(logger);
            if (recorder == null) {
                recorder = new LogbackRecorder((Logger) logger);
                instances.put(recorder.logger, recorder);
            }
            return recorder;
        }
    }

    private final Logger logger;
    private final List<Event> events;
    private final AppenderBase<ILoggingEvent> appender;
    private boolean active;
    private boolean additive;
    private Level level;

    private LogbackRecorder(Logger logger) {
        this.logger = logger;
        this.events = new ArrayList<>();
        this.appender = new AppenderBase<ILoggingEvent>() {
            @Override
            protected synchronized void append(ILoggingEvent event) {
                events.add(new Event(event));
            }
        };
    }

    public synchronized LogbackRecorder reset() {
        this.events.clear();
        return this;
    }

    public LogbackRecorder capture(String level) {
        synchronized (lock) {
            if (this.active) {
                throw new IllegalStateException(CAPTURE_EXCEPTION_MESSAGE);
            }
            this.active = true;
            this.additive = logger.isAdditive();
            this.logger.setAdditive(false);
            this.level = logger.getLevel();
            this.logger.setLevel(Level.valueOf(level.toUpperCase()));
            this.logger.addAppender(this.appender);
            this.appender.start();
        }
        return this;
    }

    public synchronized LogbackRecorder release() {
        synchronized (lock) {
            if (!this.active) {
                throw new IllegalStateException(RELEASE_EXCEPTION_MESSAGE);
            }
            this.appender.stop();
            this.logger.detachAppender(this.appender);
            this.logger.setLevel(this.level);
            this.logger.setAdditive(this.additive);
        }
        this.active = false;
        return this;
    }

    public List<Event> play() {
        final List<Event> list = new ArrayList<>(this.events.size());
        list.addAll(this.events);
        return list;
    }


    public static final class Event {

        private final Marker marker;
        private final String level;
        private final String message;
        private final Object[] arguments;
        private final String thrown;

        Event(ILoggingEvent event) {
            this.marker = event.getMarker();
            this.level = event.getLevel().toString();
            this.message = event.getMessage();
            this.arguments = event.getArgumentArray();
            final IThrowableProxy proxy = event.getThrowableProxy();
            this.thrown = proxy == null ? null : proxy.getClassName() + ": " + proxy.getMessage();
        }

        public Marker getMarker() {
            return this.marker;
        }

        public String getLevel() {
            return this.level;
        }

        public String getMessage() {
            return this.message;
        }

        public Object[] getArguments() {
            return this.arguments;
        }

        public String getThrown() {
            return this.thrown;
        }
    }
}
