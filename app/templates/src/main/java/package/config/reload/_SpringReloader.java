package <%=packageName%>.config.reload;

import <%=packageName%>.config.reload.listener.JHipsterHandlerMappingListener;
import <%=packageName%>.config.reload.listener.SpringReloadListener;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.Advisor;
import org.springframework.aop.framework.Advised;
import org.springframework.aop.framework.autoproxy.BeanFactoryAdvisorRetrievalHelper;
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
    private final BeanFactoryAdvisorRetrievalHelper beanFactoryAdvisorRetrievalHelper;

    private final List<SpringReloadListener> springReloadListeners = new ArrayList<>();

    private Set<Class<?>> toReloadBeans = new LinkedHashSet<>();
    private Map<String, Class<?>> toWaitFromBeans = new HashMap<>();
    private Map<String, Integer> nbTries = new HashMap<>();

    public SpringReloader(ConfigurableApplicationContext applicationContext) {
        log.debug("Hot reloading Spring Beans enabled");
        this.applicationContext = applicationContext;
        this.beanFactoryAdvisorRetrievalHelper = new BeanFactoryAdvisorRetrievalHelper(applicationContext.getBeanFactory());

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
                    // Check if this new class is a dependent class.
                    // If so add this dependent class to the newSpringBeans list
                    if (toWaitFromBeans.containsKey(toReloadBean.getName())) {
                        existingSpringBeans.add(toWaitFromBeans.get(toReloadBean.getName()));
                        toWaitFromBeans.remove(toReloadBean.getName());
                    }
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
                    nbTries.remove(beanName);
                } catch (BeansException e) {
                    // buggy bean, try later
                    // Try 3 times to load the class. If can't, a message will be logged
                    // and the class will be removed from the list
                    if (nbTries.containsKey(beanName) && nbTries.get(beanName) < 3) {
                        log.trace("The Spring bean can't be loaded at this time. Keep it to reload it later", e);
                        // remove the registration bean to treat this class as new class
                        beanFactory.removeBeanDefinition(beanName);
                        toReloadBeans.add(clazz);
                        nbTries.put(beanName, nbTries.get(beanName) + 1);
                    } else {
                        log.error("Unable to load the Spring bean. Please check the logs.", e);
                        toReloadBeans.remove(clazz);
                    }
                }
                log.debug("JHipster reload - New Spring bean '{}' has been reloaded.", clazz);
            }

            //4) Resolve dependencies for existing beans
            for (Class clazz : existingSpringBeans) {
                Object beanInstance = applicationContext.getBean(clazz);

                log.trace("Existing bean, autowiring fields");
                if (AopUtils.isCglibProxy(beanInstance)) {
                    log.trace("This is a CGLIB proxy, getting the real object");
                    addAdvisorIfNeeded(clazz, beanInstance);
                    final Advised advised = (Advised) beanInstance;
                    beanInstance = advised.getTargetSource().getTarget();
                } else if (AopUtils.isJdkDynamicProxy(beanInstance)) {
                    log.trace("This is a JDK proxy, getting the real object");
                    addAdvisorIfNeeded(clazz, beanInstance);
                    final Advised advised = (Advised) beanInstance;
                    beanInstance = advised.getTargetSource().getTarget();
                } else {
                    log.trace("This is a normal Java object");
                }
                boolean failedToUpdate = false;
                Field[] fields = beanInstance.getClass().getDeclaredFields();
                for (Field field : fields) {
                    if (AnnotationUtils.getAnnotation(field, Inject.class) != null ||
                            AnnotationUtils.getAnnotation(field, Autowired.class) != null) {
                        log.trace("@Inject/@Autowired annotation found on field {}", field.getName());
                        ReflectionUtils.makeAccessible(field);
                        if (ReflectionUtils.getField(field, beanInstance) != null) {
                            log.trace("Field is already injected, not doing anything");
                        } else {
                            log.trace("Field is null, injecting a Spring bean");
                            try {
                            Object beanToInject = applicationContext.getBean(field.getType());
                            ReflectionUtils.setField(field, beanInstance, beanToInject);
                            } catch (NoSuchBeanDefinitionException bsbde) {
                                log.debug("JHipster reload - Spring bean '{}' does not exist, " +
                                        "wait until this class will be available.", field.getType());
                                failedToUpdate = true;
                                toWaitFromBeans.put(field.getType().getName(), clazz);
                            }
                        }
                    }
                }
                toReloadBeans.remove(clazz);
                if (!failedToUpdate) {
                    processListener(clazz, false);
                }
                log.debug("JHipster reload - Existing Spring bean '{}' has been reloaded.", clazz);
            }

            for (SpringReloadListener springReloadListener : springReloadListeners) {
                springReloadListener.execute();
            }
        } catch (Exception e) {
            log.warn("Could not hot reload Spring bean!", e);
        }
    }

    /**
     * AOP uses advisor to intercept any annotations.
     */
    private void addAdvisorIfNeeded(Class clazz, Object beanInstance) {
        final Advised advised = (Advised) beanInstance;
        final List<Advisor> candidateAdvisors = this.beanFactoryAdvisorRetrievalHelper.findAdvisorBeans();

        final List<Advisor> advisorsThatCanApply = AopUtils.findAdvisorsThatCanApply(candidateAdvisors, clazz);

        for (Advisor advisor : advisorsThatCanApply) {
            // Add the advisor to the advised if it doesn't exist
            if (advised.indexOf(advisor) == -1) {
                advised.addAdvisor(advisor);
            }
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
