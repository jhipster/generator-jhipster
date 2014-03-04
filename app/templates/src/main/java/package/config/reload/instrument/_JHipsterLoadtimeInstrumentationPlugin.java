package <%=packageName%>.config.reload.instrument;

import javassist.*;
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
               StringUtils.equals(slashedTypeName, "org/springframework/aop/framework/ProxyCreatorSupport") ||
               StringUtils.equals(slashedTypeName, "liquibase/ext/hibernate/snapshot/TableSnapshotGenerator") ||
               StringUtils.equals(slashedTypeName, "org/hibernate/jpa/HibernatePersistenceProvider") ||
               StringUtils.equals(slashedTypeName, "org/springframework/data/repository/core/support/TransactionalRepositoryProxyPostProcessor");
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

            // Change the super class from TableSnapshotGenerator to JHipsterTableSnapshotGenerator.
            // Quick fix for a NPE. @see JHipsterTableSnapshotGenerator
            if (StringUtils.equals(slashedClassName, "liquibase/ext/hibernate/snapshot/TableSnapshotGenerator")) {
                CtClass ctClass = classPool.get("liquibase.ext.hibernate.snapshot.TableSnapshotGenerator");
                ctClass.setSuperclass(classPool.get("<%=packageName%>.config.reload.patch.liquibase.JHipsterTableSnapshotGenerator"));
                CtMethod ctMethod = ctClass.getDeclaredMethod("snapshotObject");
                ctMethod.setBody("{ return super.snapshotObject($1, $2);}");
                return ctClass.toBytecode();
            }

            // Add JHipsterPersistenceProvider class as the super class.
            // It will wrap the Hibernate entityManagerFactory to be able to reload it.
            if (StringUtils.equals(slashedClassName, "org/hibernate/jpa/HibernatePersistenceProvider")) {
                CtClass ctClass = classPool.get("org.hibernate.jpa.HibernatePersistenceProvider");
                ctClass.setSuperclass(classPool.get("<%=packageName%>.config.reload.instrument.hibernate.JHipsterPersistenceProvider"));
                CtMethod ctMethod = ctClass.getDeclaredMethod("createContainerEntityManagerFactory");
                ctMethod.setBody("{ return super.createContainerEntityManagerFactory($1, $2); }");
                return ctClass.toBytecode();
            }

            // Make TransactionalRepositoryProxyPostProcessor public to use by SpringLoader to initialize
            // the Jpa repository factory.
            if (StringUtils.equals(slashedClassName, "org/springframework/data/repository/core/support/TransactionalRepositoryProxyPostProcessor")) {
                CtClass ctClass = classPool.get("org.springframework.data.repository.core.support.TransactionalRepositoryProxyPostProcessor");
                ctClass.setModifiers(Modifier.PUBLIC);
                return ctClass.toBytecode();
            }
        } catch (Exception e) {
            log.error("Failed to modify the DelegatingMethodSecurityMetadataSource class", e);
        }
        return bytes;
    }
}
