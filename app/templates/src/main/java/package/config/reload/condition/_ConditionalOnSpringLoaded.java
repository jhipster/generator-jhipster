package <%=packageName%>.config.reload.condition;

import org.springframework.context.annotation.Conditional;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Configuration annotation for a conditional element that depends on the JVM property springLoaded.
 */
@Conditional(OnSpringLoadedCondition.class)
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.TYPE, ElementType.METHOD })
public @interface ConditionalOnSpringLoaded {

    /**
     * Expression should return {@code true} if the springLoaded JVM property has been set
     * or {@code false} if it has not been set.
     */
    String value() default "true";
}
