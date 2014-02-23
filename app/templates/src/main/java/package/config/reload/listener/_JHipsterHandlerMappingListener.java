package <%=packageName%>.config.reload.listener;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.Ordered;
import org.springframework.util.ClassUtils;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.method.HandlerMethodSelector;
import org.springframework.web.servlet.handler.AbstractHandlerMethodMapping;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * This Handler mapping is used to map only new Controller classes.
 * The existing controllers are mapped by the default RequestMappingHandlerMapping class.
 *
 * Each time, a controller is compiled this handler is called and the new controllers will be re-mapped
 */
public class JHipsterHandlerMappingListener extends RequestMappingHandlerMapping implements SpringReloadListener, Ordered {

    private final Logger log = LoggerFactory.getLogger(JHipsterHandlerMappingListener.class);

    private List<Class<?>> newCcontrollers = new ArrayList<>();

    private ConfigurableApplicationContext applicationContext;

    @Override
    public void register(ConfigurableApplicationContext applicationContext) {
        this.applicationContext = applicationContext;

        // By default the static resource handler mapping is LOWEST_PRECEDENCE - 1
        super.setOrder(LOWEST_PRECEDENCE - 3);

        // Register the bean
        String beanName = StringUtils.uncapitalize(JHipsterHandlerMappingListener.class.getSimpleName());

        RootBeanDefinition bd = new RootBeanDefinition(JHipsterHandlerMappingListener.class);
        bd.setScope(BeanDefinition.SCOPE_SINGLETON);
        applicationContext.getBeanFactory().registerSingleton(beanName, this);
    }

    @Override
    public boolean support(Class<?> clazz) {
        return super.isHandler(clazz);
    }

    @Override
    public void process(Class<?> clazz, boolean newClass) {
        // Clear existing mapping to register new classes
        clearExistingMapping();

        // Register only new classes - existing classes will be handled by the default RequestMappingHandlerMapping class
        if (newClass) {
            newCcontrollers.add(ClassUtils.getUserClass(clazz));
        } else { // remove the class from the current list because now the class is managed by the default handler mapping
            newCcontrollers.remove(ClassUtils.getUserClass(clazz));
        }
    }

    @Override
    public boolean execute() {
        // Re-map the methods
        for (Class<?> clazz : newCcontrollers) {
            final Class<?> userType = clazz;

            Set<Method> methods = HandlerMethodSelector.selectMethods(userType, new ReflectionUtils.MethodFilter() {
                @Override
                public boolean matches(Method method) {
                    return getMappingForMethod(method, userType) != null;
                }
            });

            for (Method method : methods) {
                RequestMappingInfo mapping = getMappingForMethod(method, userType);
                try {
                    Object handler = applicationContext.getBean(clazz);
                    registerHandlerMethod(handler, method, mapping);
                } catch (Exception e) {
                    logger.info("Failed to register the method. " + e.getMessage());
                }
            }
        }
        return true;
    }

    /**
     * Clear the two maps used to map the urls and the methods.
     */
    private void clearExistingMapping() {
        try {
            final Field urlMapField = ReflectionUtils.findField(AbstractHandlerMethodMapping.class, "urlMap");
            urlMapField.setAccessible(true);
            Map urlMap = (Map) urlMapField.get(this);
            urlMap.clear();

            final Field handlerMethodsField = ReflectionUtils.findField(AbstractHandlerMethodMapping.class, "handlerMethods");
            handlerMethodsField.setAccessible(true);
            Map m = (Map) handlerMethodsField.get(this);
            m.clear();
        } catch (Exception e) {
            log.error("Failed to clean the urlMap and the handlerMethods objects", e);
        }
    }
}