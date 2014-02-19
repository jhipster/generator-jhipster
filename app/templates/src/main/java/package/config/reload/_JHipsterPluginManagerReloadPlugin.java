package <%=packageName%>.config.reload;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springsource.loaded.Plugins;
import org.springsource.loaded.ReloadEventProcessorPlugin;

/**
 * Automatically re-configures classes when Spring Loaded triggers a hot reload event.
 *
 * <p>
 *     Supported technologies are
 *     <ul>
 *         <li>Spring: dependency injection and the post-construct hook are triggered</li>
 *         <li>Jackson: the serializer and deserializer caches are invalidated on JPA beans and DTOs</li>
 *     </ul>
 * </p>
 * <p>
 *   To have Spring Loaded working, run your Application class with these VM options: 
 *   "-javaagent:spring_loaded/springloaded-1.1.5-dev.jar -noverify -DtargetClassFolder=<TARGET_CLASS_FOLDER>"
 * </p>
 */
public class JHipsterPluginManagerReloadPlugin implements ReloadEventProcessorPlugin {

    private static final Logger log = LoggerFactory.getLogger(JHipsterPluginManagerReloadPlugin.class);

    private static SpringReloader springReloader;

    private static JacksonReloader jacksonReloader;

    @Override
    public boolean shouldRerunStaticInitializer(String typename, Class<?> aClass, String encodedTimestamp) {
        return true;
    }

    public void reloadEvent(String typename, Class<?> clazz, String encodedTimestamp) {
        if (!typename.startsWith("<%=packageName%>")) {
            log.trace("This class is not in the application package, nothing to do");
            return;
        }
        if (typename.contains("$$EnhancerByCGLIB$$") || typename.contains("$$FastClassByCGLIB$$")) {
            log.trace("This is a CGLIB proxy, nothing to do");
            return;
        }
        springReloader.reloadEvent(typename, clazz);
        jacksonReloader.reloadEvent(typename, clazz);
    }

    public static void register(ConfigurableApplicationContext ctx, ClassLoader classLoader) {
        log.trace("Registering JHipster hot reloading plugin");

        JHipsterFileSystemWatcher.register(classLoader);
        springReloader = new SpringReloader(ctx);
        jacksonReloader = new JacksonReloader(ctx);
        Plugins.registerGlobalPlugin(new JHipsterPluginManagerReloadPlugin());
    }
}
