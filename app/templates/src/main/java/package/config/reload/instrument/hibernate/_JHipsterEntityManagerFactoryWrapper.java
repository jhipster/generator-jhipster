package <%=packageName%>.config.reload.instrument.hibernate;

import org.hibernate.jpa.boot.spi.Bootstrap;
import org.springframework.orm.jpa.persistenceunit.MutablePersistenceUnitInfo;

import javax.persistence.*;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.metamodel.Metamodel;
import javax.persistence.spi.PersistenceUnitInfo;
import java.util.List;
import java.util.Map;

/**
 * Wrapper around the Hibernate EntityManagerFactory. This will be used to reload the entity manager
 * when an Entity is reloaded.
 */
public class JHipsterEntityManagerFactoryWrapper implements EntityManagerFactory {

    private PersistenceUnitInfo info;
    private Map properties;
    private EntityManagerFactory entityManagerFactory;
    private static JHipsterEntityManagerFactoryWrapper instance;

    public JHipsterEntityManagerFactoryWrapper(PersistenceUnitInfo info, Map properties) {
        this.info = info;
        this.properties = properties;
        instance = this;
        build(null);
    }

    /**
     * Reload the Entity manager factory
     * @param entities list of entities to load
     */
    public static void reload(List<Class> entities) {
        instance.build(entities);
    }

    private void build(List<Class> entities) {
        // Add new entities if not exists
        if (entities != null) {
            MutablePersistenceUnitInfo mutablePersistenceUnitInfo = (MutablePersistenceUnitInfo) info;
            for (Class entity : entities) {
                mutablePersistenceUnitInfo.addManagedClassName(entity.getName());
            }
        }
        entityManagerFactory = Bootstrap.getEntityManagerFactoryBuilder(info, properties).build();
    }

    @Override
    public EntityManager createEntityManager() {
        return entityManagerFactory.createEntityManager();
    }

    @Override
    public EntityManager createEntityManager(Map map) {
        return entityManagerFactory.createEntityManager(map);
    }

    @Override
    public EntityManager createEntityManager(SynchronizationType synchronizationType) {
        return entityManagerFactory.createEntityManager(synchronizationType);
    }

    @Override
    public EntityManager createEntityManager(SynchronizationType synchronizationType, Map map) {
        return entityManagerFactory.createEntityManager(synchronizationType, map);
    }

    @Override
    public CriteriaBuilder getCriteriaBuilder() {
        return entityManagerFactory.getCriteriaBuilder();
    }

    @Override
    public Metamodel getMetamodel() {
        return entityManagerFactory.getMetamodel();
    }

    @Override
    public boolean isOpen() {
        return entityManagerFactory.isOpen();
    }

    @Override
    public void close() {
        entityManagerFactory.close();
    }

    @Override
    public Map<String, Object> getProperties() {
        return entityManagerFactory.getProperties();
    }

    @Override
    public Cache getCache() {
        return entityManagerFactory.getCache();
    }

    @Override
    public PersistenceUnitUtil getPersistenceUnitUtil() {
        return entityManagerFactory.getPersistenceUnitUtil();
    }

    @Override
    public void addNamedQuery(String name, Query query) {
        entityManagerFactory.addNamedQuery(name, query);
    }

    @Override
    public <T> T unwrap(Class<T> cls) {
        return entityManagerFactory.unwrap(cls);
    }

    @Override
    public <T> void addNamedEntityGraph(String graphName, EntityGraph<T> entityGraph) {
        entityManagerFactory.addNamedEntityGraph(graphName, entityGraph);
    }
}
