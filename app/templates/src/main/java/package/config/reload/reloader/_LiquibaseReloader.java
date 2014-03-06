package <%=packageName%>.config.reload.reloader;

import <%=packageName%>.config.reload.instrument.hibernate.JHipsterEntityManagerFactoryWrapper;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.jvm.JdbcConnection;
import liquibase.diff.DiffResult;
import liquibase.diff.compare.CompareControl;
import liquibase.diff.output.DiffOutputControl;
import liquibase.diff.output.changelog.DiffToChangeLog;
import liquibase.exception.LiquibaseException;
import liquibase.ext.hibernate.database.HibernateSpringDatabase;
import liquibase.ext.hibernate.database.connection.HibernateConnection;
import liquibase.integration.spring.SpringLiquibase;
import liquibase.resource.ClassLoaderResourceAccessor;
import liquibase.structure.DatabaseObject;
import liquibase.structure.core.*;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.filefilter.SuffixFileFilter;
import org.apache.commons.lang.StringUtils;
import org.hibernate.cfg.Configuration;
import org.hibernate.jpa.boot.internal.EntityManagerFactoryBuilderImpl;
import org.hibernate.jpa.boot.spi.Bootstrap;
import org.hibernate.service.ServiceRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.io.FileSystemResourceLoader;
import org.springframework.orm.jpa.persistenceunit.DefaultPersistenceUnitManager;
import org.springframework.orm.jpa.persistenceunit.SmartPersistenceUnitInfo;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

import javax.persistence.spi.PersistenceUnitInfo;
import javax.sql.DataSource;
import java.io.*;
import java.nio.file.FileSystems;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Compare the Hibernate Entity JPA and the current database.
 * If changes have been done, a new db-changelog-[SEQUENCE].xml file will be generated and the database will be updated
 */
public class LiquibaseReloader {

    private final Logger log = LoggerFactory.getLogger(LiquibaseReloader.class);

    public static final String CHANGELOG_FOLER = "src/main/resources/config/liquibase/changelog/";

    private ConfigurableApplicationContext applicationContext;
    private CompareControl compareControl;

    public LiquibaseReloader(ConfigurableApplicationContext applicationContext) {
        log.debug("Hot reloading JPA & Liquibase enabled");
        this.applicationContext = applicationContext;
        initCompareControl();
    }


    public void reloadEvent(List<Class> entities) {
        log.debug("Hot reloading JPA & Liquibase classes");
        try {
            final String packagesToScan = "<%=packageName%>.domain";

            // Build source datasource
            DataSource dataSource = applicationContext.getBean(DataSource.class);
            final JdbcConnection jdbcConnection = new JdbcConnection(dataSource.getConnection());
            Database sourceDatabase = getDatabaseSource();
            sourceDatabase.setConnection(jdbcConnection);

            // Build hibernate datasource
            Database hibernateDatabase = new HibernateSpringDatabase() {
                @Override
                public Configuration buildConfigurationFromScanning(HibernateConnection connection) {
                    String[] packagesToScan = connection.getPath().split(",");

                    for (String packageName : packagesToScan) {
                        log.info("Found package {}", packageName);
                    }

                    DefaultPersistenceUnitManager internalPersistenceUnitManager = new DefaultPersistenceUnitManager();

                    internalPersistenceUnitManager.setPackagesToScan(packagesToScan);

                    String dialectName = connection.getProperties().getProperty("dialect", null);
                    if (dialectName == null) {
                        throw new IllegalArgumentException("A 'dialect' has to be specified.");
                    }
                    log.info("Found dialect {}", dialectName);

                    internalPersistenceUnitManager.preparePersistenceUnitInfos();
                    PersistenceUnitInfo persistenceUnitInfo = internalPersistenceUnitManager.obtainDefaultPersistenceUnitInfo();
                    HibernateJpaVendorAdapter jpaVendorAdapter = new HibernateJpaVendorAdapter();
                    jpaVendorAdapter.setDatabasePlatform(dialectName);

                    Map<String, Object> jpaPropertyMap = jpaVendorAdapter.getJpaPropertyMap();
                    jpaPropertyMap.put("hibernate.archive.autodetection", "false");

                    if (persistenceUnitInfo instanceof SmartPersistenceUnitInfo) {
                        ((SmartPersistenceUnitInfo) persistenceUnitInfo).setPersistenceProviderPackageName(jpaVendorAdapter.getPersistenceProviderRootPackage());
                    }

                    EntityManagerFactoryBuilderImpl builder = (EntityManagerFactoryBuilderImpl) Bootstrap.getEntityManagerFactoryBuilder(persistenceUnitInfo,
                            jpaPropertyMap);
					
                    ServiceRegistry serviceRegistry = builder.buildServiceRegistry();
                    return builder.buildHibernateConfiguration(serviceRegistry);
                }
            };
            hibernateDatabase.setDefaultSchemaName("PUBLIC");
            hibernateDatabase.setDefaultCatalogName("");
            hibernateDatabase.setConnection(new JdbcConnection(
                    new HibernateConnection("hibernate:spring:" + packagesToScan + "?dialect=" + applicationContext.getEnvironment().getProperty("spring.jpa.database-platform"))));

            // Use liquibase to do a difference of schema between hibernate and database
            Liquibase liquibase = new Liquibase(null, new ClassLoaderResourceAccessor(), jdbcConnection);

            // Retrieve the difference
            DiffResult diffResult = liquibase.diff(hibernateDatabase, sourceDatabase, compareControl);

            // Build the changelogs if any changes
            DiffToChangeLog diffToChangeLog = new DiffToChangeLog(diffResult, new DiffOutputControl());

            // Ignore the database changeLog table
            ignoreDatabaseChangeLogTable(diffResult);
            ignoreDatabaseHibernateSequences(diffResult);

            // If no changes do nothing
            if (diffToChangeLog.generateChangeSets().size() == 0) {
                log.debug("JHipster reload - No database change");
                return;
            }

            // Write the db-changelog-[SEQUENCE].xml file
            String changeLogString = toChangeLog(diffToChangeLog);
            String changeLogName = "db-changelog-" + calculateNextSequence() + ".xml";
            final File changelogFile = FileSystems.getDefault().getPath(CHANGELOG_FOLER + changeLogName).toFile();
            final FileOutputStream out = new FileOutputStream(changelogFile);
            IOUtils.write(changeLogString, out);
            IOUtils.closeQuietly(out);
            log.debug("JHipster reload - the db-changelog file '{}' has been generated", changelogFile.getAbsolutePath());

            // Execute the new changelog on the database
            SpringLiquibase springLiquibase = new SpringLiquibase();
            springLiquibase.setResourceLoader(new FileSystemResourceLoader());
            springLiquibase.setDataSource(dataSource);
            springLiquibase.setChangeLog("file:" + changelogFile.getAbsolutePath());
            springLiquibase.setContexts("development");
            try {
                springLiquibase.afterPropertiesSet();
                log.debug("JHipster reload - Successful database update");
            } catch (LiquibaseException e) {
                log.error("Failed to reload the database", e);
            }

            // Ask to reload the EntityManager
            JHipsterEntityManagerFactoryWrapper.reload(entities);
        } catch (Exception e) {
            log.error("Failed to generate the db-changelog.xml file", e);
        }
    }

    private void ignoreDatabaseChangeLogTable(DiffResult diffResult)
            throws Exception {
				
        Set<Table> unexpectedTables = diffResult
                .getUnexpectedObjects(Table.class);
		
        for (Table table : unexpectedTables) {
            if ("DATABASECHANGELOGLOCK".equalsIgnoreCase(table.getName())
                    || "DATABASECHANGELOG".equalsIgnoreCase(table.getName())) {
						
                diffResult.getUnexpectedObjects().remove(table);
			}
        }
        Set<Table> missingTables = diffResult
                .getMissingObjects(Table.class);
		
        for (Table table : missingTables) {
            if ("DATABASECHANGELOGLOCK".equalsIgnoreCase(table.getName())
                    || "DATABASECHANGELOG".equalsIgnoreCase(table.getName())) {
						
                diffResult.getMissingObjects().remove(table);
			}
        }
        Set<Column> unexpectedColumns = diffResult.getUnexpectedObjects(Column.class);
        for (Column column : unexpectedColumns) {
            if ("DATABASECHANGELOGLOCK".equalsIgnoreCase(column.getRelation().getName())
                    || "DATABASECHANGELOG".equalsIgnoreCase(column.getRelation().getName())) {
						
                diffResult.getUnexpectedObjects().remove(column);
			}
        }
        Set<Column> missingColumns = diffResult.getMissingObjects(Column.class);
        for (Column column : missingColumns) {
            if ("DATABASECHANGELOGLOCK".equalsIgnoreCase(column.getRelation().getName())
                    || "DATABASECHANGELOG".equalsIgnoreCase(column.getRelation().getName())) {
                diffResult.getMissingObjects().remove(column);
			}
        }
        Set<Index> unexpectedIndexes = diffResult.getUnexpectedObjects(Index.class);
        for (Index index : unexpectedIndexes) {
            if ("DATABASECHANGELOGLOCK".equalsIgnoreCase(index.getTable().getName())
                    || "DATABASECHANGELOG".equalsIgnoreCase(index.getTable().getName())) {
						
                diffResult.getUnexpectedObjects().remove(index);
			}
        }
        Set<Index> missingIndexes = diffResult.getMissingObjects(Index.class);
        for (Index index : missingIndexes) {
            if ("DATABASECHANGELOGLOCK".equalsIgnoreCase(index.getTable().getName())
                    || "DATABASECHANGELOG".equalsIgnoreCase(index.getTable().getName())) {
						
                diffResult.getMissingObjects().remove(index);
			}
        }
        Set<PrimaryKey> unexpectedPrimaryKeys = diffResult.getUnexpectedObjects(PrimaryKey.class);
        for (PrimaryKey primaryKey : unexpectedPrimaryKeys) {
            if ("DATABASECHANGELOGLOCK".equalsIgnoreCase(primaryKey.getTable().getName())
                    || "DATABASECHANGELOG".equalsIgnoreCase(primaryKey.getTable().getName())) {
						
                diffResult.getUnexpectedObjects().remove(primaryKey);
			}
        }
        Set<PrimaryKey> missingPrimaryKeys = diffResult.getMissingObjects(PrimaryKey.class);
        for (PrimaryKey primaryKey : missingPrimaryKeys) {
            if ("DATABASECHANGELOGLOCK".equalsIgnoreCase(primaryKey.getTable().getName())
                    || "DATABASECHANGELOG".equalsIgnoreCase(primaryKey.getTable().getName())) {
						
                diffResult.getMissingObjects().remove(primaryKey);
			}
        }
    }

    private void ignoreDatabaseHibernateSequences(DiffResult diffResult)
            throws Exception {
				
        Set<Table> unexpectedTables = diffResult
                .getUnexpectedObjects(Table.class);
		
        for (Table table : unexpectedTables) {
            if ("HIBERNATE_SEQUENCES".equalsIgnoreCase(table.getName())) {
                diffResult.getUnexpectedObjects().remove(table);
			}
        }
        Set<Table> missingTables = diffResult
                .getMissingObjects(Table.class);
		
        for (Table table : missingTables) {
            if ("HIBERNATE_SEQUENCES".equalsIgnoreCase(table.getName())) {
                diffResult.getMissingObjects().remove(table);
			}
        }
        Set<Column> unexpectedColumns = diffResult.getUnexpectedObjects(Column.class);
        for (Column column : unexpectedColumns) {
            if ("HIBERNATE_SEQUENCES".equalsIgnoreCase(column.getRelation().getName())) {
                diffResult.getUnexpectedObjects().remove(column);
			}
        }
        Set<Column> missingColumns = diffResult.getMissingObjects(Column.class);
        for (Column column : missingColumns) {
            if ("HIBERNATE_SEQUENCES".equalsIgnoreCase(column.getRelation().getName())) {
                diffResult.getMissingObjects().remove(column);
			}
        }
        Set<Index> unexpectedIndexes = diffResult.getUnexpectedObjects(Index.class);
        for (Index index : unexpectedIndexes) {
            if ("HIBERNATE_SEQUENCES".equalsIgnoreCase(index.getTable().getName())) {
                diffResult.getUnexpectedObjects().remove(index);
			}
        }
        Set<Index> missingIndexes = diffResult.getMissingObjects(Index.class);
        for (Index index : missingIndexes) {
            if ("HIBERNATE_SEQUENCES".equalsIgnoreCase(index.getTable().getName())) {
                diffResult.getMissingObjects().remove(index);
			}
        }
        Set<PrimaryKey> unexpectedPrimaryKeys = diffResult.getUnexpectedObjects(PrimaryKey.class);
        for (PrimaryKey primaryKey : unexpectedPrimaryKeys) {
            if ("HIBERNATE_SEQUENCES".equalsIgnoreCase(primaryKey.getTable().getName())) {
                diffResult.getUnexpectedObjects().remove(primaryKey);
			}
        }
        Set<PrimaryKey> missingPrimaryKeys = diffResult.getMissingObjects(PrimaryKey.class);
        for (PrimaryKey primaryKey : missingPrimaryKeys) {
            if ("HIBERNATE_SEQUENCES".equalsIgnoreCase(primaryKey.getTable().getName())) {
                diffResult.getMissingObjects().remove(primaryKey);
			}
        }
    }

    private String toChangeLog(DiffToChangeLog diffToChangeLog) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintStream printStream = new PrintStream(out, true, "UTF-8");
        diffToChangeLog.setChangeSetAuthor("jhipster");
        diffToChangeLog.print(printStream);
        printStream.close();
        return out.toString("UTF-8");
    }

    private void initCompareControl() {
        Set<Class<? extends DatabaseObject>> typesToInclude = new HashSet<>();
        typesToInclude.add(Table.class);
        typesToInclude.add(Column.class);
        typesToInclude.add(PrimaryKey.class);
        typesToInclude.add(ForeignKey.class);
        typesToInclude.add(UniqueConstraint.class);
        typesToInclude.add(Sequence.class);
        compareControl = new CompareControl(typesToInclude);
        compareControl.addSuppressedField(Table.class, "remarks");
        compareControl.addSuppressedField(Column.class, "remarks");
        compareControl.addSuppressedField(Column.class, "certainDataType");
        compareControl.addSuppressedField(Column.class, "autoIncrementInformation");
        compareControl.addSuppressedField(ForeignKey.class, "deleteRule");
        compareControl.addSuppressedField(ForeignKey.class, "updateRule");
        compareControl.addSuppressedField(Index.class, "unique");
    }

    /**
     * Calculate the next sequence used to generate the db-changelog file.
     *
     * The sequence is formatted as follow:
     *    leftpad with 0 + number
     * @return the next sequence
     */
    private String calculateNextSequence() {
        final File changeLogFolder = FileSystems.getDefault().getPath(CHANGELOG_FOLER).toFile();

        final File[] allChangelogs = changeLogFolder.listFiles((FileFilter) new SuffixFileFilter(".xml"));

        Integer sequence = 0;

        for (File changelog : allChangelogs) {
            String fileName = FilenameUtils.getBaseName(changelog.getName());
            String currentSequence = StringUtils.substringAfterLast(fileName, "-");
            int cpt = Integer.parseInt(currentSequence);
            if (cpt > sequence) {
                sequence = cpt;
            }
        }
        sequence++;
        return StringUtils.leftPad(sequence.toString(), 3, "0");
    }

    /**
     * @return the source database
     */
    private Database getDatabaseSource() {
        <% if (devDatabaseType == 'mysql') { %>return new liquibase.database.core.MySQLDatabase();<% } %>
        <% if (devDatabaseType == 'postgresql') { %>new return new liquibase.database.core.PostgresDatabase();<% } %>
        <% if (devDatabaseType == 'hsqldbMemory') { %>return new liquibase.database.core.HsqlDatabase();<% } %>
        <% if (devDatabaseType == 'h2Memory') { %>return new liquibase.database.core.H2Database();<% } %>
    }
}
