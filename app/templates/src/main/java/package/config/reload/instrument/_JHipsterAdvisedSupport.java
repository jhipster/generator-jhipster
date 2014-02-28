package com.mycompany.myapp.config.reload.instrument;

import org.springframework.aop.framework.AdvisedSupport;

import java.lang.reflect.Method;
import java.util.List;

/**
 * The AdvisedSupport is in charge to manage the advised associated to a method
 * By default, it used a cache which avoid to reload any advises like @RolesAllowed, @Timed etc...
 * The call to the method adviceChanged will clear the cache
 */
public class JHipsterAdvisedSupport extends AdvisedSupport {

    @Override
    public List<Object> getInterceptorsAndDynamicInterceptionAdvice(Method method, Class<?> targetClass) {
        adviceChanged();

        return super.getInterceptorsAndDynamicInterceptionAdvice(method, targetClass);
    }
}
