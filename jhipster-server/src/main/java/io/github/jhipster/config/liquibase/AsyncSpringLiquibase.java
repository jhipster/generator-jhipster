/*
 * Copyright 2016-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.github.jhipster.config.liquibase;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.env.Environment;
import org.springframework.core.task.TaskExecutor;
import org.springframework.util.StopWatch;

import io.github.jhipster.config.JHipsterConstants;
import liquibase.exception.LiquibaseException;
import liquibase.integration.spring.SpringLiquibase;

/**
 * Specific liquibase.integration.spring.SpringLiquibase that will update the database asynchronously. <p> By default,
 * this asynchronous version only works when using the "dev" profile.<p> The standard
 * liquibase.integration.spring.SpringLiquibase starts Liquibase in the current thread: <ul> <li>This is needed if you
 * want to do some database requests at startup</li> <li>This ensure that the database is ready when the application
 * starts</li> </ul> But as this is a rather slow process, we use this asynchronous version to speed up our start-up
 * time: <ul> <li>On a recent MacBook Pro, start-up time is down from 14 seconds to 8 seconds</li> <li>In production,
 * this can help your application run on platforms like Heroku, where it must start/restart very quickly</li> </ul>
 */
public class AsyncSpringLiquibase extends SpringLiquibase {

    // named "logger" because there is already a field called "log" in "SpringLiquibase"
    private final Logger logger = LoggerFactory.getLogger(AsyncSpringLiquibase.class);

    private final TaskExecutor taskExecutor;

    private final Environment env;

    public AsyncSpringLiquibase(@Qualifier("taskExecutor") TaskExecutor taskExecutor, Environment env) {
        this.taskExecutor = taskExecutor;
        this.env = env;
    }

    @Override
    public void afterPropertiesSet() throws LiquibaseException {
        if (!env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_NO_LIQUIBASE)) {
            if (env.acceptsProfiles(JHipsterConstants.SPRING_PROFILE_DEVELOPMENT, JHipsterConstants
                .SPRING_PROFILE_HEROKU)) {
                taskExecutor.execute(() -> {
                    try {
                        logger.warn("Starting Liquibase asynchronously, your database might not be ready at startup!");
                        initDb();
                    } catch (LiquibaseException e) {
                        logger.error("Liquibase could not start correctly, your database is NOT ready: {}", e
                            .getMessage(), e);
                    }
                });
            } else {
                logger.debug("Starting Liquibase synchronously");
                initDb();
            }
        } else {
            logger.debug("Liquibase is disabled");
        }
    }

    protected void initDb() throws LiquibaseException {
        StopWatch watch = new StopWatch();
        watch.start();
        super.afterPropertiesSet();
        watch.stop();
        logger.debug("Liquibase has updated your database in {} ms", watch.getTotalTimeMillis());
        if (watch.getTotalTimeMillis() > 5_000) {
            logger.warn("Warning, Liquibase took more than 5 seconds to start up!");
        }
    }
}
