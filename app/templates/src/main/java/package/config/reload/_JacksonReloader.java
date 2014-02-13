package <%=packageName%>.config.reload;

import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.deser.DeserializerCache;
import com.fasterxml.jackson.databind.ser.SerializerCache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.BeanFactoryUtils;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.util.ReflectionUtils;

import javax.persistence.Entity;
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collection;

/**
 * Reloads Jackson classes.
 */
public class JacksonReloader {

    private static final Logger log = LoggerFactory.getLogger(JacksonReloader.class);

    private ConfigurableApplicationContext applicationContext;

    public JacksonReloader(ConfigurableApplicationContext applicationContext) {
        log.debug("Hot reloading Jackson enabled");
        this.applicationContext = applicationContext;
    }

    public void reloadEvent(String typename, Class<?> clazz) {
        log.debug("Hot reloading - checking if this is a Jackson class: " + typename);

        if (typename.startsWith("<%=packageName%>.domain")) {
            log.trace("This class is in the JPA package, checking if it is an entity");
            Annotation annotation = AnnotationUtils.findAnnotation(clazz, Entity.class);
            if (annotation != null) {
                log.debug("This is a JPA Entity, invalidating Jackson cache");
                invalidateJacksonCaches();
            }
        } else if (typename.startsWith("<%=packageName%>.web.rest.dto")) {
            log.debug("This is a REST DTO, invalidating Jackson cache");
            invalidateJacksonCaches();
        } else {
            log.debug("This class is not a JPA entity or a DTO, the Jackson cache is not invalidated");
        }
    }

    private void invalidateJacksonCaches() {
        try {
            ConfigurableListableBeanFactory beanFactory = applicationContext.getBeanFactory();
            Collection<ObjectMapper> mappers = BeanFactoryUtils
                    .beansOfTypeIncludingAncestors(beanFactory, ObjectMapper.class)
                    .values();

            for (ObjectMapper mapper : mappers) {
                log.trace("Flushing Jackson serializer cache");
                SerializerProvider serializerProvider = mapper.getSerializerProvider();
                Field serializerCacheField = serializerProvider.getClass().getSuperclass().getSuperclass().getDeclaredField("_serializerCache");
                ReflectionUtils.makeAccessible(serializerCacheField);
                SerializerCache serializerCache = (SerializerCache) serializerCacheField.get(serializerProvider);
                Method serializerCacheFlushMethod = SerializerCache.class.getDeclaredMethod("flush");
                serializerCacheFlushMethod.invoke(serializerCache);

                log.trace("Flushing Jackson deserializer cache");
                DeserializationContext deserializationContext = mapper.getDeserializationContext();
                Field deSerializerCacheField = deserializationContext.getClass().getSuperclass().getSuperclass().getDeclaredField("_cache");
                ReflectionUtils.makeAccessible(deSerializerCacheField);
                DeserializerCache deSerializerCache = (DeserializerCache) deSerializerCacheField.get(deserializationContext);
                Method deSerializerCacheFlushMethod = DeserializerCache.class.getDeclaredMethod("flushCachedDeserializers");
                deSerializerCacheFlushMethod.invoke(deSerializerCache);
            }
        } catch (Exception e) {
            log.warn("Could not hot reload Jackson class!");
            e.printStackTrace();
        }
    }
}
