package <%=packageName%>.config.elasticsearch;

import static org.apache.commons.lang.StringUtils.uncapitalize;
import static org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization;

import <%=packageName%>.config.JHipsterProperties;

import java.io.Serializable;
import javax.persistence.PostPersist;
import javax.persistence.PostRemove;
import javax.persistence.PostUpdate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.data.elasticsearch.repository.ElasticsearchCrudRepository;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;

public class ElasticSearchUpdater<T> {

    private Logger logger = LoggerFactory.getLogger(getClass());
  
    private static BeanFactory beanFactory;
  
    @PostPersist
    @PostUpdate
    public void save(T entity) {
        if (updateOnCommit()) {
            registerSynchronization(new TransactionSynchronizationAdapter() {
                @Override
                public void afterCommit() {
                  saveEntity(entity);
                }
            });
        } else {
            saveEntity(entity);
        }
    }

    private void saveEntity(T entity) {
        ElasticsearchCrudRepository<T, Serializable> repository = repositoryFor(entity);
        if (repository != null) {
            logger.debug("Saving entity in ES : {}", entity);
            repository.save(entity);
            logger.debug("Saved entity in ES : {}", entity);
        } else {
            logger.debug("No ES repository found for entity {}", entity);
        }
    }
  
    @PostRemove
    public void remove(T entity) {
        if (updateOnCommit()) {
            registerSynchronization(new TransactionSynchronizationAdapter() {
                @Override
                public void afterCommit() {
                  removeEntity(entity);
                }
            });
        } else {
            removeEntity(entity);
        }
    }
  
    private void removeEntity(T entity) {
        ElasticsearchCrudRepository<T, Serializable> repository = repositoryFor(entity);
        if (repository != null) {
            logger.debug("Removing entity from ES : {}", entity);
            repository.delete(entity);
            logger.debug("Removed entity from ES : {}", entity);
        } else {
            logger.debug("No ES repository found for entity {}", entity);
        }
    }

    private boolean updateOnCommit() {
        JHipsterProperties properties = beanFactory.getBean(JHipsterProperties.class);
        return properties.getElasticSearch().isUpdateOnCommit();
    }
  
    @SuppressWarnings("unchecked")
    private ElasticsearchCrudRepository<T, Serializable> repositoryFor(T entity) {
        String repositoryName = repositoryNameFor(entity);
    
        ElasticsearchCrudRepository<T, Serializable> repository = null;
        try {
            repository = beanFactory.getBean(repositoryName, ElasticsearchCrudRepository.class);
        } catch (NoSuchBeanDefinitionException e) {
            logger.debug("No ElasticSearch repository found with name '{}'", repositoryName);
        }
        return repository;
    }
  
    private String repositoryNameFor(T entity) {
        String entityName = entity.getClass().getSimpleName();
        return uncapitalize(entityName) + "SearchRepository";
    }
  
    static void setBeanFactory(BeanFactory beanFactory) {
        ElasticSearchUpdater.beanFactory = beanFactory;
    }
}
