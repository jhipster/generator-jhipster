package tech.jhipster.sample.config;

import java.util.Collections;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.beans.factory.InitializingBean;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.output.Slf4jLogConsumer;

public class MongoDbTestContainer implements InitializingBean, DisposableBean {

    /* private final long memoryInBytes = Math.round(1024 * 1024 * 1024 * 0.6);
    private final long memorySwapInBytes = Math.round(1024 * 1024 * 1024 * 0.8);
    private final long nanoCpu = Math.round(1_000_000_000L * 0.1); */
    private static final Logger log = LoggerFactory.getLogger(MongoDbTestContainer.class);

    private MongoDBContainer mongodbContainer;

    @Override
    public void destroy() {
        if (null != mongodbContainer && mongodbContainer.isRunning()) {
            mongodbContainer.stop();
        }
    }

    @Override
    public void afterPropertiesSet() {
        if (null == mongodbContainer) {
            mongodbContainer =
                new MongoDBContainer("mongo:6.0.2")
                    .withTmpFs(Collections.singletonMap("/testtmpfs", "rw"))
                    /* .withCommand(
                    "--nojournal --wiredTigerCacheSizeGB 0.25 --wiredTigerCollectionBlockCompressor none --slowOpSampleRate 0 --setParameter ttlMonitorEnabled=false --setParameter diagnosticDataCollectionEnabled=false --setParameter logicalSessionRefreshMillis=6000000 --setParameter enableFlowControl=false --setParameter oplogFetcherUsesExhaust=false --setParameter disableResumableRangeDeleter=true --setParameter enableShardedIndexConsistencyCheck=false --setParameter enableFinerGrainedCatalogCacheRefresh=false --setParameter readHedgingMode=off --setParameter loadRoutingTableOnStartup=false --setParameter rangeDeleterBatchDelayMS=2000000 --setParameter skipShardingConfigurationChecks=true --setParameter syncdelay=3600"
                )
                .withCreateContainerCmdModifier(cmd ->
                    cmd.getHostConfig().withMemory(memoryInBytes).withMemorySwap(memorySwapInBytes).withNanoCPUs(nanoCpu)
                ) */
                    .withLogConsumer(new Slf4jLogConsumer(log))
                    .withReuse(true);
        }
        if (!mongodbContainer.isRunning()) {
            mongodbContainer.start();
        }
    }

    public MongoDBContainer getMongoDBContainer() {
        return mongodbContainer;
    }
}
