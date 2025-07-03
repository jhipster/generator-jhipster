package com.okta.developer.gateway.repository;

import com.okta.developer.gateway.domain.UserData;
import com.okta.developer.gateway.repository.rowmapper.UserDataRowMapper;
import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.convert.R2dbcConverter;
import org.springframework.data.r2dbc.core.R2dbcEntityOperations;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.data.r2dbc.repository.support.SimpleR2dbcRepository;
import org.springframework.data.relational.core.sql.Comparison;
import org.springframework.data.relational.core.sql.Condition;
import org.springframework.data.relational.core.sql.Conditions;
import org.springframework.data.relational.core.sql.Expression;
import org.springframework.data.relational.core.sql.Select;
import org.springframework.data.relational.core.sql.SelectBuilder.SelectFromAndJoin;
import org.springframework.data.relational.core.sql.Table;
import org.springframework.data.relational.repository.support.MappingRelationalEntityInformation;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.r2dbc.core.RowsFetchSpec;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC custom repository implementation for the UserData entity.
 */
@SuppressWarnings("unused")
class UserDataRepositoryInternalImpl extends SimpleR2dbcRepository<UserData, Long> implements UserDataRepositoryInternal {

    private final DatabaseClient db;
    private final R2dbcEntityTemplate r2dbcEntityTemplate;
    private final EntityManager entityManager;

    private final UserDataRowMapper userdataMapper;

    private static final Table entityTable = Table.aliased("user_data", EntityManager.ENTITY_ALIAS);

    public UserDataRepositoryInternalImpl(
        R2dbcEntityTemplate template,
        EntityManager entityManager,
        UserDataRowMapper userdataMapper,
        R2dbcEntityOperations entityOperations,
        R2dbcConverter converter
    ) {
        super(
            new MappingRelationalEntityInformation(converter.getMappingContext().getRequiredPersistentEntity(UserData.class)),
            entityOperations,
            converter
        );
        this.db = template.getDatabaseClient();
        this.r2dbcEntityTemplate = template;
        this.entityManager = entityManager;
        this.userdataMapper = userdataMapper;
    }

    @Override
    public Flux<UserData> findAllBy(Pageable pageable) {
        return createQuery(pageable, null).all();
    }

    RowsFetchSpec<UserData> createQuery(Pageable pageable, Condition whereClause) {
        List<Expression> columns = UserDataSqlHelper.getColumns(entityTable, EntityManager.ENTITY_ALIAS);
        SelectFromAndJoin selectFrom = Select.builder().select(columns).from(entityTable);
        // we do not support Criteria here for now as of https://github.com/jhipster/generator-jhipster/issues/18269
        String select = entityManager.createSelect(selectFrom, UserData.class, pageable, whereClause);
        return db.sql(select).map(this::process);
    }

    @Override
    public Flux<UserData> findAll() {
        return findAllBy(null);
    }

    @Override
    public Mono<UserData> findById(Long id) {
        Comparison whereClause = Conditions.isEqual(entityTable.column("id"), Conditions.just(id.toString()));
        return createQuery(null, whereClause).one();
    }

    private UserData process(Row row, RowMetadata metadata) {
        UserData entity = userdataMapper.apply(row, "e");
        return entity;
    }

    @Override
    public <S extends UserData> Mono<S> save(S entity) {
        return super.save(entity);
    }
}
