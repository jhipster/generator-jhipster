package <%=packageName%>.config.reload;

import <%=packageName%>.config.reload.condition.ConditionalOnSpringLoaded;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Configuration;
import org.springsource.loaded.agent.SpringLoadedAgent;

@Configuration
@ConditionalOnSpringLoaded
public class JHipsterReloaderConfiguration implements ApplicationContextAware {

    private final Logger log = LoggerFactory.getLogger(JHipsterReloaderConfiguration.class);

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        try {
            SpringLoadedAgent.getInstrumentation();
            log.info("Spring Loaded is running, registering hot reloading features");
            JHipsterPluginManagerReloadPlugin.register((ConfigurableApplicationContext) applicationContext,
                    JHipsterReloaderConfiguration.class.getClassLoader());
        } catch (UnsupportedOperationException uoe) {
            log.info("Spring Loaded is not running, hot reloading is not enabled");
        }
    }
}
