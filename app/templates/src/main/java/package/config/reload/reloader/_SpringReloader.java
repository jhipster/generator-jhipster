package <%=packageName%>.config.reload.reloader;

import <%=packageName%>.config.reload.listener.springreload.JHipsterHandlerMappingListener;
import <%=packageName%>.config.reload.listener.springreload.SpringReloadListener;
import org.apache.commons.lang.ClassUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.Advisor;
import org.springframework.aop.framework.Advised;
import org.springframework.aop.framework.autoproxy.BeanFactoryAdvisorRetrievalHelper;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.ListableBeanFactory;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.beans.factory.support.AbstractBeanDefinition;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Scope;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.data.jpa.repository.support.JpaRepositoryFactory;
import org.springframework.data.repository.core.support.RepositoryProxyPostProcessor;
import org.springframework.data.repository.util.TxUtils;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.RestController;

import javax.inject.Inject;
import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.lang.annotation.Annotation;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.util.*;

/**
 * Reloads Spring Beans.
 */
public class SpringReloader implements InitializingBean {

    private final Logger log = LoggerFactory.getLogger(SpringReloader.class);

    private final ConfigurableApplicationContext applicationContext;
    private final BeanFactoryAdvisorRetrievalHelper beanFactoryAdvisorRetrievalHelper;
    private JpaRepositoryFactory jpaRepositoryFactory;

    private final List<SpringReloadListener> springReloadListeners = new ArrayList<>();

    private Set<Class<?>> toReloadBeans = new LinkedHashSet<>();
    private List<Class<?>> newToWaitFromBeans = new ArrayList<>();
    private Map<String, Class<?>> existingToWaitFromBeans = new HashMap<>();

    @PersistenceContext
    private EntityManager entityManager;

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

    /**
     * Call when an entity bean is loaded
     * Perhaps new or existing bean are waiting for the entity
     */
    public void hasNewEntityBean() {
        List<Class> newSpringBeans = new ArrayList<>();
        List<Class> existingSpringBeans = new ArrayList<>();

        newSpringBeans.addAll(newToWaitFromBeans);
        existingSpringBeans.addAll(existingToWaitFromBeans.values());

        start(newSpringBeans, existingSpringBeans);
    }

    public boolean hasBeansToReload() {
        return toReloadBeans.size() > 0;
    }

    public void start() {
        List<Class> newSpringBeans = new ArrayList<>();
        List<Class> existingSpringBeans = new ArrayList<>();

        start(newSpringBeans, existingSpringBeans);
    }

    private void start(List<Class> newSpringBeans, List<Class> existingSpringBeans) {
        try {
            DefaultListableBeanFactory beanFactory = (DefaultListableBeanFactory) applicationContext.getBeanFactory();

            //1) Split between new/existing beans
            for (Class toReloadBean : toReloadBeans) {
                log.trace("Hot reloading Spring bean: {}", toReloadBean.getName());
                Annotation annotation = getSpringClassAnnotation(toReloadBean);
                String beanName = constructBeanName(annotation, toReloadBean);
                if (!beanFactory.containsBeanDefinition(beanName)) {
                    newSpringBeans.add(toReloadBean);
                    // Check if this new class is a dependent class.
                    // If so add this dependent class to the newSpringBeans list
                    if (newToWaitFromBeans.size() > 0) {
                        newSpringBeans.addAll(newToWaitFromBeans);
                        newToWaitFromBeans.clear();
                    }
                } else {
                    existingSpringBeans.add(toReloadBean);
                    if (existingToWaitFromBeans.containsKey(toReloadBean.getName())) {
                        existingSpringBeans.add(existingToWaitFromBeans.get(toReloadBean.getName()));
                        existingToWaitFromBeans.remove(toReloadBean.getName());
                    }
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
                    // This is a spring data interface
                    if (ClassUtils.isAssignable(clazz, org.springframework.data.repository.Repository.class)) {
                        final Object repository = jpaRepositoryFactory.getRepository(clazz);
                        beanFactory.registerSingleton(beanName, repository);
                    } else {
                        beanFactory.getBean(beanName);
                    }
                    processListener(clazz, true);
                    toReloadBeans.remove(clazz);
                    log.debug("JHipster reload - New Spring bean '{}' has been reloaded.", clazz);
                } catch (Exception e) {
                    log.trace("The Spring bean can't be loaded at this time. Keep it to reload it later", e);
                    // remove the registration bean to treat this class as new class
                    beanFactory.removeBeanDefinition(beanName);
                    newToWaitFromBeans.add(clazz);
                    toReloadBeans.remove(clazz);
                }
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
                                existingToWaitFromBeans.put(field.getType().getName(), clazz);
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
        springReloadListeners.add(new JHipsterHandlerMappingListener());

        for (SpringReloadListener springReloadListener : springReloadListeners) {
            springReloadListener.register(applicationContext);
        }
    }

    @Override
    public void afterPropertiesSet() {
        applicationContext.getAutowireCapableBeanFactory().autowireBean(this);
        this.jpaRepositoryFactory = new JpaRepositoryFactory(entityManager);
        try {
            // Make sure calls to the repository instance are intercepted for annotated transactions
            Class transactionalRepositoryProxyPostProcessor = Class.forName("org.springframework.data.repository.core.support.TransactionalRepositoryProxyPostProcessor");
            final Constructor constructor = transactionalRepositoryProxyPostProcessor.getConstructor(ListableBeanFactory.class, String.class);
            final RepositoryProxyPostProcessor repositoryProxyPostProcessor = (RepositoryProxyPostProcessor)
                    constructor.newInstance(applicationContext.getBeanFactory(), TxUtils.DEFAULT_TRANSACTION_MANAGER);
            jpaRepositoryFactory.addRepositoryProxyPostProcessor(repositoryProxyPostProcessor);
        } catch (Exception e) {
            log.error("Failed to initialize the TransactionalRepositoryProxyPostProcessor class", e);
        }
    }

}
