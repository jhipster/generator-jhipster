package <%=packageName%>.config.reload.instrument.hibernate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.persistence.EntityManagerFactory;
import javax.persistence.spi.PersistenceProvider;
import javax.persistence.spi.PersistenceUnitInfo;
import java.util.Map;

/**
 * Used to instrument the HibernatePersistenceProvider class
 * @see com.mycompany.myapp.config.reload.instrument.JHipsterLoadtimeInstrumentationPlugin
 */
public abstract class JHipsterPersistenceProvider implements PersistenceProvider {

    private Logger log = LoggerFactory.getLogger(JHipsterPersistenceProvider.class);

    public EntityManagerFactory createContainerEntityManagerFactory(PersistenceUnitInfo info, Map properties) {
        log.trace( "Starting createContainerEntityManagerFactory : {}", info.getPersistenceUnitName() );

        return new JHipsterEntityManagerFactoryWrapper(info, properties);
    }
}
