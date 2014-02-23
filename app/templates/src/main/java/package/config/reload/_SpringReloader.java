package <%=packageName%>.config.reload;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.Advised;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.NoUniqueBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.util.ReflectionUtils;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * Reloads Spring Beans.
 */
public class SpringReloader {

    private static final Logger LOGGER = LoggerFactory.getLogger(SpringReloader.class);

    private ConfigurableApplicationContext applicationContext;

    public SpringReloader(ConfigurableApplicationContext applicationContext) {
        LOGGER.debug("Hot reloading Spring Beans enabled");
        this.applicationContext = applicationContext;
    }

    public void reloadEvent(Class<?> clazz) {
        LOGGER.trace("Hot reloading Spring bean: {}", clazz.toString());
        try {
            Object beanInstance;

            // The definition of the bean has changed so we need to reload it
            beanInstance = registerBeanDefinition(clazz);
            LOGGER.debug("'{}' has been updated, autowiring fields", clazz.getName());

            if (AopUtils.isCglibProxy(beanInstance)) {
                LOGGER.trace("This is a CGLIB proxy, getting the real object");
                beanInstance = ((Advised) beanInstance).getTargetSource().getTarget();
            } else if (AopUtils.isJdkDynamicProxy(beanInstance)) {
                LOGGER.trace("This is a JDK proxy, getting the real object");
                beanInstance = ((Advised) beanInstance).getTargetSource().getTarget();
            }
            Field[] fields = beanInstance.getClass().getDeclaredFields();
            for (Field field : fields) {
                if (AnnotationUtils.getAnnotation(field, Inject.class) != null ||
                        AnnotationUtils.getAnnotation(field, Autowired.class) != null) {
                    LOGGER.debug("@Inject annotation found on field {}", field.getName());
                    Object beanToInject;

                    // Doesn't exist - so register the new bean
                    if (!applicationContext.containsBean(field.getName())) {
                        beanToInject = registerBeanDefinition(field.getType());
                    } else {
                        beanToInject = applicationContext.getBean(field.getName());
                    }

                    if (beanToInject != null) {
                        ReflectionUtils.makeAccessible(field);
                        ReflectionUtils.setField(field, beanInstance, beanToInject);
                    }
                }
            }
            // TODO check aspects, at least @Transactional and @RolesAllowed
            // aspects already work at the class level, ie @Transactional at the class level works

            Method[] methods = beanInstance.getClass().getDeclaredMethods();
            for (Method method : methods) {
                final String methodName = method.getName();

                if (AnnotationUtils.getAnnotation(method, PostConstruct.class) != null) {
                    LOGGER.debug("@PostConstruct annotation found on method {}", methodName);
                    method.invoke(beanInstance);
                }

                if (AnnotationUtils.getAnnotation(method, Bean.class) != null) {
                    LOGGER.debug("@Bean annotation found on method {}", methodName);
                    DefaultListableBeanFactory beanFactory = (DefaultListableBeanFactory) applicationContext.getBeanFactory();

                    // check if the bean is already registered
                    if (beanFactory.containsSingleton(methodName)) {
                        // 1- unregister the bean
                        beanFactory.destroySingleton(methodName);
                    }

                    // 2- create the instance
                    Object beanObject = method.invoke(beanInstance);

                    // 3- apply post processors
                    beanObject = beanFactory.applyBeanPostProcessorsBeforeInitialization(beanObject, methodName);

                    // 4- register it
                    beanFactory.registerSingleton(methodName, beanObject);
                }
            }
            LOGGER.debug("Spring bean reloaded: {}", beanInstance.getClass());
        } catch (NoUniqueBeanDefinitionException nbde) {
            LOGGER.warn("There are several instances of {}, reloading is not yet supported for non-unique beans", clazz.toString());
        } catch (Exception e) {
            LOGGER.warn("Could not hot reload Spring bean!");
            e.printStackTrace();
        }
    }

    /**
     * Register the Spring bean definition of the class
     * If an existing bean registration exists, the bean registration will be first deleted
     * and a new one will be created
     *
     * @param clazz the class to register
     * @return the created bean
     */
    private Object registerBeanDefinition(Class<?> clazz) {
        if (clazz.isInterface()) {
            LOGGER.debug("Hot reload. Unable to register an interface of the type: {}", clazz);
            return null;
        }

        // The name of the bean will be only the name of the class
        String beanName = StringUtils.uncapitalize(clazz.getSimpleName());

        DefaultListableBeanFactory beanFactory = (DefaultListableBeanFactory) applicationContext.getBeanFactory();

        // 1- Check if the beanDefinition exists - if so remove it
        if (beanFactory.containsBeanDefinition(beanName)) {
            beanFactory.removeBeanDefinition(beanName);
        }

        // 2- Register the beanDefinition
        RootBeanDefinition bd = new RootBeanDefinition(beanName);
        bd.setBeanClass(clazz);
        bd.setScope(BeanDefinition.SCOPE_SINGLETON);
        beanFactory.registerBeanDefinition(beanName, bd);

        // 3- Return the bean
        return beanFactory.getBean(beanName);
    }
}
