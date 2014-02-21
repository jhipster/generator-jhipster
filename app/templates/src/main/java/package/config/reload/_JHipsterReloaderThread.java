package <%=packageName%>.config.reload;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

import javax.persistence.Entity;
import java.util.ArrayList;
import java.util.List;

/**
 * This thread stores classes to reload, to reload them all in one batch.
 */
public class JHipsterReloaderThread implements Runnable {

    private static Logger log = LoggerFactory.getLogger(JHipsterReloaderThread.class);

    public static boolean isStarted;

    private static boolean hotReloadTriggered = false;

    private static boolean isWaitingForNewClasses = false;

    /**
     * How long does the thread wait until running a new batch.
     */
    private static final int BATCH_DELAY = 250;

    /**
     * The Spring application context.
     */
    private ConfigurableApplicationContext applicationContext;

    /**
     * Reloads Spring beans.
     */
    private static SpringReloader springReloader;

    /**
     * Reloads Jackson classes.
     */
    private static JacksonReloader jacksonReloader;

    /**
     * Stores the Spring controllers reloaded in the batch.
     */
    private List<Class> controllers = new ArrayList<>();

    /**
     * Stores the Spring services reloaded in the batch.
     */
    private List<Class> services = new ArrayList<>();

    /**
     * Stores the Spring repositories reloaded in the batch.
     */
    private List<Class> repositories = new ArrayList<>();

    /**
     * Stores the Spring components reloaded in the batch.
     */
    private List<Class> components = new ArrayList<>();

    /**
     * Stores the JPA entities reloaded in the batch.
     */
    private List<Class> entities = new ArrayList<>();

    /**
     * Stores the DTOs reloaded in the batch.
     */
    private List<Class> dtos = new ArrayList<>();

    public JHipsterReloaderThread(ConfigurableApplicationContext applicationContext) {
        isStarted = true;
        this.applicationContext = applicationContext;
        springReloader = new SpringReloader(applicationContext);
        jacksonReloader = new JacksonReloader(applicationContext);
    }

    public void reloadEvent(String typename, Class<?> clazz) {
        log.trace("Hot reloading - checking if this is a Spring bean: {}", typename);

        if (AnnotationUtils.findAnnotation(clazz, Repository.class) != null) {
            // TODO find also interfaces which extends JpaRepository (for Spring Data JPA)
            log.trace("{} is a Spring Repository", typename);
            repositories.add(clazz);
        } else if (AnnotationUtils.findAnnotation(clazz, Service.class) != null) {
            log.trace("{} is a Spring Service", typename);
            services.add(clazz);
        } else if (AnnotationUtils.findAnnotation(clazz, Controller.class) != null ||
                AnnotationUtils.findAnnotation(clazz, RestController.class) != null) {

            log.trace("{} is a Spring Controller", typename);
            controllers.add(clazz);
        } else if (AnnotationUtils.findAnnotation(clazz, Component.class) != null) {
            log.trace("{} is a Spring Component", typename);
            components.add(clazz);
        } else if (typename.startsWith("<%=packageName%>.domain")) {
            log.trace("{} is in the JPA package, checking if it is an entity", typename);
            if (AnnotationUtils.findAnnotation(clazz, Entity.class) != null) {
                log.trace("{} is a JPA Entity", typename);
                entities.add(clazz);
            }
        } else if (typename.startsWith("<%=packageName%>.web.rest.dto")) {
            log.debug("{}  is a REST DTO", typename);
            dtos.add(clazz);
        }
        hotReloadTriggered = true;
        isWaitingForNewClasses = true;
    }

    public void run() {
        while (isStarted) {
            try {
                Thread.sleep(BATCH_DELAY);
                if (hotReloadTriggered) {
                    if (isWaitingForNewClasses) {
                        log.info("Batch reload has been triggered, waiting for new classes for {} ms", BATCH_DELAY);
                        isWaitingForNewClasses = false;
                    } else {
                        batchReload();
                        hotReloadTriggered = false;
                    }
                } else {
                    log.trace("Waiting for batch reload");
                }
            } catch (InterruptedException e) {
                log.error("JHipsterReloaderThread was awaken", e);
            }
        }
    }

    private void batchReload() {
        log.info("Batch reload in progress...");
        if (entities.size() > 0 || dtos.size() > 0) {
            log.debug("There are {} entities and {} dtos updated, invalidating Jackson cache",
                    entities.size(), dtos.size());

            jacksonReloader.reloadEvent();
        }
        reloadSpringBeans("repositories", repositories);
        reloadSpringBeans("services", services);
        reloadSpringBeans("components", components);
        reloadSpringBeans("controllers", controllers);
    }

    private void reloadSpringBeans(String type, List<Class> list) {
        if (list.size() > 0) {
            log.debug("There are {} Spring {} updated, reloading them", list.size(), type);
            for (Class clazz : list) {
                springReloader.reloadEvent(clazz);
            }
        }
        list.clear();
    }

    /**
     * Register the thread and starts it.
     */
    public static void register(JHipsterReloaderThread jHipsterReloaderThread) {
        try {
            final Thread thread = new Thread(jHipsterReloaderThread);
            thread.setDaemon(true);
            thread.start();

            Runtime.getRuntime().addShutdownHook(new Thread() {
                public void run() {
                    JHipsterReloaderThread.isStarted = false;
                    try {
                        thread.join();
                    } catch (InterruptedException e) {
                        log.error("Failed during the JVM shutdown", e);
                    }
                }
            });
        } catch (Exception e) {
            log.error("Failed to start the reloader thread. Classes will not be reloaded correctly.", e);
        }
    }
}
