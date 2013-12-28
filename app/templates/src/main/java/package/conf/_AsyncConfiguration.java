package <%=packageName%>.conf;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfiguration implements AsyncConfigurer, EnvironmentAware  {

    private final Logger log = LoggerFactory.getLogger(AsyncConfiguration.class);

    private RelaxedPropertyResolver env;

    @Override
    public void setEnvironment(Environment environment) {
        this.env = new RelaxedPropertyResolver(environment, "async.");
    }

    @Override
    public Executor getAsyncExecutor() {
        log.debug("Creating Async Task Executor");
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(env.getProperty("corePoolSize", Integer.class, 2));
        executor.setMaxPoolSize(env.getProperty("corePoolSize", Integer.class, 50));
        executor.setQueueCapacity(env.getProperty("corePoolSize", Integer.class, 10000));
        executor.setThreadNamePrefix("<%= _.slugify(baseName) %>-Executor-");
        executor.initialize();
        return executor;
    }
}
