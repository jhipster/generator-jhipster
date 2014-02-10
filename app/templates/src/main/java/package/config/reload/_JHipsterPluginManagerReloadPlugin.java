package <%=packageName%>.config.reload;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.Advised;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.NoUniqueBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.RestController;
import org.springsource.loaded.Plugins;
import org.springsource.loaded.ReloadEventProcessorPlugin;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * Automatically reloads Spring Beans when Spring Loaded triggers a hot reload event.
 *
 * <p>
 *   To have Spring Loaded working, run your Application class with these VM options: 
 *   "-javaagent:spring_loaded/springloaded-1.1.5-dev.jar -noverify" 
 * </p>
 */
public class JHipsterPluginManagerReloadPlugin implements ReloadEventProcessorPlugin {

    private static final Logger log = LoggerFactory.getLogger(JHipsterPluginManagerReloadPlugin.class);

    private static ConfigurableApplicationContext applicationContext;

    @Override
    public boolean shouldRerunStaticInitializer(String typename, Class<?> aClass, String encodedTimestamp) {
        return true;
    }

    public void reloadEvent(String typename, Class<?> clazz, String encodedTimestamp) {
        log.trace("Hot reloading - checking if this is a Spring bean: " + typename);

        if (!typename.startsWith("<%=packageName%>")) {
            log.trace("This class is not in the application package, it is not considered a Spring Bean");
            return;
        }
        if (typename.contains("$$EnhancerByCGLIB$$") || typename.contains("$$FastClassByCGLIB$$")) {
            log.trace("This is a CGLIB proxy, it is not considered a Spring Bean");
            return;
        }
        Annotation annotation = AnnotationUtils.findAnnotation(clazz, Component.class);
        if (annotation == null) {
            annotation = AnnotationUtils.findAnnotation(clazz, RestController.class);
        }
        if (annotation == null) {
            annotation = AnnotationUtils.findAnnotation(clazz, Controller.class);
        }
        if (annotation == null) {
            annotation = AnnotationUtils.findAnnotation(clazz, Service.class);
        }
        if (annotation == null) {
            annotation = AnnotationUtils.findAnnotation(clazz, Repository.class);
        }
        if (annotation != null) {
            log.debug("This is a Spring Bean, annotation=" + annotation.annotationType());
            try {
                Object beanInstance = applicationContext.getBean(clazz);
                log.debug("Existing bean, autowiring fields"); // We only support autowiring on fields
                if (AopUtils.isCglibProxy(beanInstance)) {
                    log.trace("This is a CGLIB proxy, getting the real object");
                    beanInstance = ((Advised) beanInstance).getTargetSource().getTarget();
                } else if (AopUtils.isJdkDynamicProxy(beanInstance)) {
                    log.trace("This is a JDK proxy, getting the real object");
                    beanInstance = ((Advised) beanInstance).getTargetSource().getTarget();
                }
                Field[] fields = beanInstance.getClass().getDeclaredFields();
                for (Field field : fields) {
                    Annotation[] annotations = field.getDeclaredAnnotations();
                    if (AnnotationUtils.getAnnotation(field, Inject.class) != null ||
                            AnnotationUtils.getAnnotation(field, Autowired.class) != null) {

                        log.debug("@Inject annotation found on field {}", field.getName());
                        Object beanToInject = applicationContext.getBean(field.getType());
                        ReflectionUtils.makeAccessible(field);
                        ReflectionUtils.setField(field, beanInstance, beanToInject);
                    }
                }
                // TODO check aspects, at least @Transactional and @RolesAllowed
                // aspects already work at the class level, ie @Transactional at the class level works

                Method[] methods = beanInstance.getClass().getDeclaredMethods();
                for (Method method : methods) {
                    Annotation[] annotations = method.getDeclaredAnnotations();
                    if (AnnotationUtils.getAnnotation(method, PostConstruct.class) != null) {
                        log.debug("@PostConstruct annotation found on method {}", method.getName());
                        method.invoke(beanInstance);
                    }
                }
            } catch (NoUniqueBeanDefinitionException nbde) {
                log.warn("There are several instances of {}, reloading is not yet supported for non-unique beans", typename);
            } catch (NoSuchBeanDefinitionException nsbde) {
                log.info("Bean {} is not registered yet, creating it", typename);

                // TODO manage new beans
                // Spring Loaded doesn't send events for new classes, so it might not be possible

            } catch (Exception e) {
                log.warn("Could not hot reload Spring bean!");
                e.printStackTrace();
            }
        } else {
            log.trace("This class does not have Spring annotations, it is not considered a Spring Bean");
        }
    }

    public static void register(ConfigurableApplicationContext ctx) {
        log.trace("Registering JHipster hot reloading plugin - your Spring Beans should be automatically reloaded!");
        JHipsterPluginManagerReloadPlugin.applicationContext = ctx;
        Plugins.registerGlobalPlugin(new JHipsterPluginManagerReloadPlugin());
    }
}
