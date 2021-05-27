package de.vc.admin;

import java.util.Collections;
import java.util.concurrent.atomic.AtomicBoolean;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.testcontainers.containers.PostgreSQLContainer;

public class ReactiveSqlTestContainerExtension implements BeforeAllCallback {

    private static AtomicBoolean started = new AtomicBoolean(false);

    private static PostgreSQLContainer<?> container = new PostgreSQLContainer<>("postgres:13.2")
        .withDatabaseName("admin")
        .withTmpFs(Collections.singletonMap("/testtmpfs", "rw"));

    @Override
    public void beforeAll(ExtensionContext extensionContext) throws Exception {
        if (!started.get() && useTestcontainers()) {
            container.start();
            System.setProperty("spring.r2dbc.url", container.getJdbcUrl().replace("jdbc", "r2dbc"));
            System.setProperty("spring.r2dbc.username", container.getUsername());
            System.setProperty("spring.r2dbc.password", container.getPassword());
            System.setProperty("spring.liquibase.url", container.getJdbcUrl());
            System.setProperty("spring.liquibase.user", container.getUsername());
            System.setProperty("spring.liquibase.password", container.getPassword());
            started.set(true);
        }
    }

    private boolean useTestcontainers() {
        String systemProperties = StringUtils.defaultIfBlank(System.getProperty("spring.profiles.active"), "");
        String environmentVariables = StringUtils.defaultIfBlank(System.getenv("SPRING_PROFILES_ACTIVE"), "");

        return systemProperties.contains("testcontainers") || environmentVariables.contains("testcontainers");
    }
}
