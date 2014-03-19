package <%=packageName%>.config.reload;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
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
 *   "-javaagent:spring_loaded/springloaded.jar -noverify -Dspringloaded=plugins=com.mycompany.myapp.config.reload.instrument.JHipsterLoadtimeInstrumentationPlugin"
 * </p>
 */
public class JHipsterPluginManagerReloadPlugin implements ReloadEventProcessorPlugin {

    private final Logger log = LoggerFactory.getLogger(JHipsterPluginManagerReloadPlugin.class);

    private static JHipsterReloaderThread jHipsterReloaderThread;

    @Override
    public boolean shouldRerunStaticInitializer(String typename, Class<?> aClass, String encodedTimestamp) {
        return true;
    }

    public void reloadEvent(String typename, Class<?> clazz, String encodedTimestamp) {
        if (!typename.startsWith("<%=packageName%>")) {
            log.trace("This class is not in the application package, nothing to do");
            return;
        }
        if (typename.contains("$$EnhancerBy") || typename.contains("$$FastClassBy")) {
            log.trace("This is a CGLIB proxy, nothing to do");
            return;
        }
        jHipsterReloaderThread.reloadEvent(typename, clazz);
    }

    public static void register(ConfigurableApplicationContext ctx, ClassLoader classLoader) {
        Environment env = ctx.getEnvironment();

        if (env.getProperty("hotReload.enabled", Boolean.class, false)) {
            jHipsterReloaderThread = new JHipsterReloaderThread(ctx);
            JHipsterReloaderThread.register(jHipsterReloaderThread);
            JHipsterFileSystemWatcher.register(classLoader, ctx);
            Plugins.registerGlobalPlugin(new JHipsterPluginManagerReloadPlugin());
        }
    }
}
