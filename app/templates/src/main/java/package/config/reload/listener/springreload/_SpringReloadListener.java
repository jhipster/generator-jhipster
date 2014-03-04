package <%=packageName%>.config.reload.listener.springreload;

import org.springframework.context.ConfigurableApplicationContext;

/**
 * Listener used to interact with spring when classes are reloaded.
 *
 * For example, the JHipsterHandlerMappingListener will create
 * the mapping between a request and a method only for new controller
 */
public interface SpringReloadListener {

    void register(ConfigurableApplicationContext applicationContext);

    boolean support(Class<?> clazz);

    void process(Class<?> clazz, boolean newClazz);

    void execute();
}
