package <%=packageName%>.config.reload;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springsource.loaded.Plugins;
import org.springsource.loaded.ReloadEventProcessorPlugin;

import java.util.ArrayList;
import java.util.List;

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
        if (typename.contains("$$EnhancerByCGLIB$$") || typename.contains("$$FastClassByCGLIB$$")) {
            log.trace("This is a CGLIB proxy, nothing to do");
            return;
        }
        jHipsterReloaderThread.reloadEvent(typename, clazz);
    }

    public static void register(ConfigurableApplicationContext ctx, ClassLoader classLoader) {
        Environment env = ctx.getEnvironment();

        if (env.getProperty("hotReload.enabled", Boolean.class, false)) {
            // Load from env the list of folders to watch
            List<String> watchFolders = getWatchFolders(env);

            jHipsterReloaderThread = new JHipsterReloaderThread(ctx);
            JHipsterReloaderThread.register(jHipsterReloaderThread);
            JHipsterFileSystemWatcher.register(classLoader, watchFolders);
            Plugins.registerGlobalPlugin(new JHipsterPluginManagerReloadPlugin());
        }
    }

    /**
     * The definition of the folders to watch must be defined in the application-dev.yml as follow
     *   hotReload:
     *     enabled: true
     *     watchdir:
     *        - /Users/jhipster/demo-jhipster/target/classes
     *        - /Users/jhipster/demo-jhipster/target/classes1

     * @param env the environment used to retrieve the list of folders
     * @return the list of folders
     */
    private static List<String> getWatchFolders(Environment env) {
        List<String> results = new ArrayList<>();

        int i=0;

        String folder = env.getProperty("hotReload.watchdir[" + i + "]");

        while(folder != null) {
            results.add(folder);
            i++;
            folder = env.getProperty("hotReload.watchdir[" + i + "]");
        }

        return results;
    }
}
