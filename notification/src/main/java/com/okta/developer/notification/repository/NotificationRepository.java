package com.okta.developer.notification.repository;

import com.okta.developer.notification.domain.NotificationEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC repository for the NotificationEntity entity.
 */
@SuppressWarnings("unused")
@Repository
public interface NotificationRepository extends ReactiveCrudRepository<NotificationEntity, Long>, NotificationRepositoryInternal {
    @Override
    <S extends NotificationEntity> Mono<S> save(S entity);

    @Override
    Flux<NotificationEntity> findAll();

    @Override
    Mono<NotificationEntity> findById(Long id);

    @Override
    Mono<Void> deleteById(Long id);
}

interface NotificationRepositoryInternal {
    <S extends NotificationEntity> Mono<S> save(S entity);

    Flux<NotificationEntity> findAllBy(Pageable pageable);

    Flux<NotificationEntity> findAll();

    Mono<NotificationEntity> findById(Long id);
    // this is not supported at the moment because of https://github.com/jhipster/generator-jhipster/issues/18269
    // Flux<NotificationEntity> findAllBy(Pageable pageable, Criteria criteria);
}
