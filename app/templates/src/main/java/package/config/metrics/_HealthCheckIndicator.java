package <%=packageName%>.config.metrics;

import org.apache.commons.lang.exception.ExceptionUtils;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;

/**
 * A health indicator check for a component of your application.
 */
public abstract class HealthCheckIndicator implements HealthIndicator {

    private static final Result HEALTHY = new Result(true, null, null);

    /**
     * @return the name of the indicator
     */
    protected abstract String getHealthCheckIndicatorName();

    /**
     * Perform a check of the application component.
     *
     * @return if the component is healthy, a healthy Result; otherwise, an unhealthy Result
     *          with a descriptive error message or/and exception
     * @throws Exception if there is an unhandled error during the health check; this will result in
     *                   a failed health check
     */
    protected abstract Result check() throws Exception;

    @Override
    public Health health() {
        try {
            return Health.up().withDetail(getHealthCheckIndicatorName(), check()).build();
        } catch (Exception e) {
            return Health.down().withDetail(getHealthCheckIndicatorName(), unhealthy(e)).build();
        }
    }

    /**
     * @return a healthy Result with no additional message
     */
    public static Result healthy() {
        return HEALTHY;
    }

    /**
     * @param message an informative message
     * @return a healthy Result with an additional message
     */
    public static Result healthy(String message) {
        return new Result(true, message, null);
    }

    /**
     * @param message an informative message describing how the health check indicator failed
     * @return an unhealthy Result with the given message
     */
    public static Result unhealthy(String message) {
        return new Result(false, message, null);
    }

    /**
     * @param error an exception thrown during the health check
     * @return an unhealthy Result with the given error
     */
    public static Result unhealthy(Throwable error) {
        return new Result(false, error.getMessage(), error);
    }

    /**
     * @param message an informative message describing how the health check indicator failed
     * @param error an exception thrown during the health check
     * @return an unhealthy Result with the given error
     */
    public static Result unhealthy(String message, Throwable error) {
        return new Result(false, message, error);
    }

    /**
     * The result of a HealthCheckIndicator
     */
    public static class Result {
        private boolean healthy;
        private String message;
        private Throwable exception;

        public Result(boolean healthy, String message) {
            this.healthy = healthy;
            this.message = message;
        }

        public Result(boolean healthy, String message, Throwable exception) {
            this.healthy = healthy;
            this.message = message;
            this.exception = exception;
        }

        public boolean isHealthy() {
            return healthy;
        }

        public String getMessage() {
            return message;
        }

        public String getException() {
            return ExceptionUtils.getFullStackTrace(exception);
        }
    }
}
