package <%=packageName%>.config.elasticsearch;

import static org.apache.commons.lang.math.RandomUtils.nextInt;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.util.ReflectionTestUtils.setField;

import javax.inject.Inject;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.aop.framework.Advised;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;

import <%=packageName%>.<%= mainClass %>;
import <%=packageName%>.config.JHipsterProperties;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.repository.search.UserSearchRepository;
import <%=packageName%>.service.UserService;


@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = <%= mainClass %>.class)
@WebAppConfiguration
@IntegrationTest
public class ElasticSearchUpdaterTest {

    @Inject
    private UserService userService;
    @Inject
    private UserRepository userRepository;
    @Inject
    private UserSearchRepository userSearchRepository;
    @Inject
    private ConfigurableBeanFactory beanFactory;
    private long countDb;
    private long countEs;
    @Inject
    private PlatformTransactionManager transactionManager;
    @Inject
    private JHipsterProperties properties;
    private boolean actualUpdateOnCommit;
    private TransactionTemplate transactionTemplate;

    @Before
    public void prepare() {
        transactionTemplate = new TransactionTemplate(transactionManager);
        userSearchRepository.deleteAll();
        countDb = userRepository.count();
        countEs = userSearchRepository.count();
        actualUpdateOnCommit = properties.getElasticSearch().isUpdateOnCommit();
        properties.getElasticSearch().setUpdateOnCommit(true);
    }

    private void mockElasticSearchUpdater() {
        // mock bean factory in ElasticSearchUpdater
        ConfigurableBeanFactory mock = mock(ConfigurableBeanFactory.class);
        when(mock.getBean(JHipsterProperties.class)).thenReturn(properties);
        ElasticSearchUpdater.setBeanFactory(mock);
    }

    private void mockSearchRepository() {
        // mock searchRepository call in service
        UserSearchRepository mock = mock(UserSearchRepository.class);
        setField(unwrap(userService), "userSearchRepository", mock);
    }

    @After
    public void restoreBeanFactory() {
        ElasticSearchUpdater.setBeanFactory(beanFactory);
        properties.getElasticSearch().setUpdateOnCommit(actualUpdateOnCommit);
    }

    @Test
    public void should_ES_contain_data_after_commit_with_ElasticSearchUpdater() {
        mockSearchRepository();
        saveUserAndCommit();
        assertUserSaved();
    }

    @Ignore
    @Test
    public void should_ES_contain_data_after_commit_without_ElasticSearchUpdater() {
        mockElasticSearchUpdater();
        saveUserAndCommit();
        assertUserSaved();
    }

    @Test
    public void should_ES_not_contain_data_after_rollback_with_ElasticSearchUpdater() {
        mockSearchRepository();
        saveUserAndRollback();
        assertUserNotSaved();
    }

    @Test
    public void should_ES_not_contain_data_after_rollback_without_ElasticSearchUpdater() {
        mockElasticSearchUpdater();
        saveUserAndRollback();
        assertUserNotSaved();
    }

    private void saveUserAndCommit() {
      transactionTemplate.execute(new TransactionCallback<Void>() {
          @Override
          public Void doInTransaction(TransactionStatus status) {
              saveUser();
              return null;
          }
      });
    }

    private void saveUserAndRollback() {
        transactionTemplate.execute(new TransactionCallback<Void>() {
            @Override
            public Void doInTransaction(TransactionStatus status) {
                saveUser();
                status.setRollbackOnly();
                return null;
            }
        });
    }

    private void saveUser() {
        String login = "user" + nextInt(10000);
        userService.createUserInformation(login, "pwd", "", "", login + "@me.com", "en");
    }

    private void assertUserSaved() {
        assertThat(userRepository.count()).isEqualTo(countDb + 1);
        assertThat(userSearchRepository.count()).isEqualTo(countEs + 1);
    }

    private void assertUserNotSaved() {
        assertThat(userRepository.count()).isEqualTo(countDb);
        assertThat(userSearchRepository.count()).isEqualTo(countEs);
    }

    @SuppressWarnings("unchecked")
    private static <T> T unwrap(T maybeCglibProxy) {
        if (AopUtils.isAopProxy(maybeCglibProxy) && maybeCglibProxy instanceof Advised) {
            try {
                Object target = ((Advised) maybeCglibProxy).getTargetSource().getTarget();
                return (T) target;
            } catch (Exception e) {
                throw new RuntimeException("Unable to unwrap proxy " + maybeCglibProxy, e);
            }
        }
        return maybeCglibProxy;
    }
}
