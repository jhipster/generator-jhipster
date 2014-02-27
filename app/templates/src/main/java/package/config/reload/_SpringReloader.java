package <%=packageName%>.config.reload;

import <%=packageName%>.config.reload.listener.JHipsterHandlerMappingListener;
import <%=packageName%>.config.reload.listener.SpringReloadListener;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.framework.Advised;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.beans.factory.support.AbstractBeanDefinition;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.RestController;

import javax.inject.Inject;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.util.*;

/**
 * Reloads Spring Beans.
 */
public class SpringReloader {

    private final Logger log = LoggerFactory.getLogger(SpringReloader.class);

    private final ConfigurableApplicationContext applicationContext;

    private final List<SpringReloadListener> springReloadListeners = new ArrayList<>();

    private Set<Class<?>> toReloadBeans = new LinkedHashSet<>();
    private Map<String, Integer> nbTries = new HashMap<>();

    public SpringReloader(ConfigurableApplicationContext applicationContext) {
        log.debug("Hot reloading Spring Beans enabled");
        this.applicationContext = applicationContext;
        // register listeners
        registerListeners();
    }

    public void reloadEvent(Class<?> clazz) {
        toReloadBeans.add(clazz);
    }

    public boolean hasBeansToReload() {
        return toReloadBeans.size() > 0;
    }

    public void start() {
        try {
            DefaultListableBeanFactory beanFactory = (DefaultListableBeanFactory) applicationContext.getBeanFactory();

            List<Class> newSpringBeans = new ArrayList<>();
            List<Class> existingSpringBeans = new ArrayList<>();

            //1) Split between new/existing beans
            for (Class toReloadBean : toReloadBeans) {
                log.trace("Hot reloading Spring bean: {}", toReloadBean.getName());
                Annotation annotation = getSpringClassAnnotation(toReloadBean);
                String beanName = constructBeanName(annotation, toReloadBean);
                if (!beanFactory.containsBeanDefinition(beanName)) {
                    newSpringBeans.add(toReloadBean);
                } else {
                    existingSpringBeans.add(toReloadBean);
                }
            }

            //2) Declare new beans prior to instanciation for cross bean references
            for (Class clazz : newSpringBeans) {
                Annotation annotation = getSpringClassAnnotation(clazz);
                String beanName = constructBeanName(annotation, clazz);
                String scope = getScope(clazz);
                RootBeanDefinition bd = new RootBeanDefinition(clazz, AbstractBeanDefinition.AUTOWIRE_BY_TYPE, true);
                bd.setScope(scope);
                beanFactory.registerBeanDefinition(beanName, bd);
            }

            //3) Instanciate new beans
            for (Class clazz : newSpringBeans) {
                Annotation annotation = getSpringClassAnnotation(clazz);
                String beanName = constructBeanName(annotation, clazz);
                try {
                    beanFactory.getBean(beanName);
                    processListener(clazz, true);
                    toReloadBeans.remove(clazz);
                } catch (BeansException e) {
                    //buggy bean, try later
                    // Try 3 times to load the class. If can't, a message will be logged
                    // and the class will be removed from the list
                    if (nbTries.containsKey(beanName) && nbTries.get(beanName) < 3) {
                        log.error("The Spring bean can't be loaded at this time. Keep it to reload it later", e);
                        toReloadBeans.add(clazz);
                    } else {
                        log.error("Unable to load the Spring bean. Please check the logs.", e);
                        toReloadBeans.remove(clazz);
                    }
                }
            }

            //4) Resolve deps for existing beans
            for (Class clazz : existingSpringBeans) {
                Object beanInstance = applicationContext.getBean(clazz);

                log.debug("Existing bean, autowiring fields"); // We only support autowiring on fields
                if (AopUtils.isCglibProxy(beanInstance)) {
                    log.debug("This is a CGLIB proxy, getting the real object");
                    beanInstance = ((Advised) beanInstance).getTargetSource().getTarget();
                } else if (AopUtils.isJdkDynamicProxy(beanInstance)) {
                    log.debug("This is a JDK proxy, getting the real object");
                    beanInstance = ((Advised) beanInstance).getTargetSource().getTarget();
                }
                boolean failedToUpdate = false;
                Field[] fields = beanInstance.getClass().getDeclaredFields();
                for (Field field : fields) {
                    if (AnnotationUtils.getAnnotation(field, Inject.class) != null ||
                            AnnotationUtils.getAnnotation(field, Autowired.class) != null) {

                        log.debug("@Inject/@Autowired annotation found on field {}", field.getName());
                        ReflectionUtils.makeAccessible(field);
                        if (ReflectionUtils.getField(field, beanInstance) != null) {
                            log.debug("Field is already injected, not doing anything");
                        } else {
                            log.debug("Field is null, injecting a Spring bean");
                            try {
                            Object beanToInject = applicationContext.getBean(field.getType());
                            ReflectionUtils.setField(field, beanInstance, beanToInject);
                            } catch (NoSuchBeanDefinitionException bsbde) {
                                log.warn("Spring bean {} does not exist, could not inject field", field.getType());
                                failedToUpdate = true;
                            }
                        }
                    }
                }
                if (!failedToUpdate) {
                    toReloadBeans.remove(clazz);
                    processListener(clazz, false);
                }
            }

            for (SpringReloadListener springReloadListener : springReloadListeners) {
                springReloadListener.execute();
            }
        } catch (Exception e) {
            log.warn("Could not hot reload Spring bean!", e);
        }
    }

    private void processListener(Class<?> clazz, boolean isNewClass) {
        for (SpringReloadListener springReloadListener : springReloadListeners) {
            if (springReloadListener.support(clazz)) {
                springReloadListener.process(clazz, isNewClass);
            }
        }
    }

    private Annotation getSpringClassAnnotation(Class clazz) {
        Annotation classAnnotation = AnnotationUtils.findAnnotation(clazz, Component.class);

        if (classAnnotation == null) {
            classAnnotation = AnnotationUtils.findAnnotation(clazz, Controller.class);
        }
        if (classAnnotation == null) {
            classAnnotation = AnnotationUtils.findAnnotation(clazz, RestController.class);
        }
        if (classAnnotation == null) {
            classAnnotation = AnnotationUtils.findAnnotation(clazz, Service.class);
        }
        if (classAnnotation == null) {
            classAnnotation = AnnotationUtils.findAnnotation(clazz, Repository.class);
        }

        return classAnnotation;
    }

    private String getScope(Class clazz) {
        String scope = ConfigurableBeanFactory.SCOPE_SINGLETON;
        Annotation scopeAnnotation = AnnotationUtils.findAnnotation(clazz, Scope.class);
        if (scopeAnnotation != null) {
            scope = (String) AnnotationUtils.getValue(scopeAnnotation);
        }
        return scope;
    }

    private String constructBeanName(Annotation annotation, Class clazz) {
        String beanName = (String) AnnotationUtils.getValue(annotation);
        if (beanName == null || beanName.isEmpty()) {
            beanName = StringUtils.uncapitalize(clazz.getSimpleName());
        }
        return beanName;
    }

    private void registerListeners() {
        // Handler Mapping
        JHipsterHandlerMappingListener hipsterHandlerMappingListener = new JHipsterHandlerMappingListener();
        hipsterHandlerMappingListener.register(applicationContext);
        springReloadListeners.add(hipsterHandlerMappingListener);
    }
}
