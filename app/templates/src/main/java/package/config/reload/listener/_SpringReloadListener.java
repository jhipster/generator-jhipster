package <%=packageName%>.config.reload.listener;

import org.springframework.context.ConfigurableApplicationContext;

/**
 * Listener used to manage the reloaded classes.
 * For example, the JHipsterHandlerMappingListener is used to manage mapping for new classes
 */
public interface SpringReloadListener {

    void register(ConfigurableApplicationContext applicationContext);

    boolean support(Class<?> clazz);

    void process(Class<?> clazz, boolean newClazz);

    boolean execute();
}
