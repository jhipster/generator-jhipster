package <%=packageName%>.config.reload.instrument;

import javassist.ClassPool;
import javassist.CtClass;
import javassist.LoaderClassPath;
import javassist.Modifier;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springsource.loaded.LoadtimeInstrumentationPlugin;

import java.security.ProtectionDomain;

/**
 *  Instrument the classes loaded at runtime.
 *  Be able to change the default behavior of a class before adding it in the ClassLoader
 */
public class JHipsterLoadtimeInstrumentationPlugin implements LoadtimeInstrumentationPlugin {

    private final Logger log = LoggerFactory.getLogger(JHipsterLoadtimeInstrumentationPlugin.class);

    @Override
    public boolean accept(String slashedTypeName, ClassLoader classLoader, ProtectionDomain protectionDomain, byte[] bytes) {
        return StringUtils.equals(slashedTypeName, "org/springframework/security/access/method/DelegatingMethodSecurityMetadataSource") ||
               StringUtils.equals(slashedTypeName, "org/springframework/aop/framework/ProxyCreatorSupport");
    }

    @Override
    public byte[] modify(String slashedClassName, ClassLoader classLoader, byte[] bytes) {
        ClassPool classPool = new ClassPool();
        classPool.appendClassPath(new LoaderClassPath(classLoader));

        try {
            // Remove final from a class definition to be able to proxy it. @See JHipsterReloadWebSecurityConfig class
            if (StringUtils.equals(slashedClassName, "org/springframework/security/access/method/DelegatingMethodSecurityMetadataSource")) {
                CtClass ctClass = classPool.get("org.springframework.security.access.method.DelegatingMethodSecurityMetadataSource");
                ctClass.setModifiers(Modifier.PUBLIC);

                return ctClass.toBytecode();
            }

            // Change the super class from ProxyCreator to JHipsterProxyCreator.
            // By default the AdvisedSupport class uses caching See ProxyCreator.methodCache variable
            // The JHipsterProxyCreator class will just clear the caching
            if (StringUtils.equals(slashedClassName, "org/springframework/aop/framework/ProxyCreatorSupport")) {
                CtClass ctClass = classPool.get("org.springframework.aop.framework.ProxyCreatorSupport");
                ctClass.setSuperclass(classPool.get("<%=packageName%>.config.reload.instrument.JHipsterAdvisedSupport"));
                return ctClass.toBytecode();
            }
        } catch (Exception e) {
            log.error("Failed to modify the DelegatingMethodSecurityMetadataSource class", e);
        }

        return bytes;
    }
}
