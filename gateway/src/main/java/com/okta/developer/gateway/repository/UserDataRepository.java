package com.okta.developer.gateway.repository;

import com.okta.developer.gateway.domain.UserData;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Spring Data R2DBC repository for the UserData entity.
 */
@SuppressWarnings("unused")
@Repository
public interface UserDataRepository extends ReactiveCrudRepository<UserData, Long>, UserDataRepositoryInternal {
    @Override
    <S extends UserData> Mono<S> save(S entity);

    @Override
    Flux<UserData> findAll();

    @Override
    Mono<UserData> findById(Long id);

    @Override
    Mono<Void> deleteById(Long id);
}

interface UserDataRepositoryInternal {
    <S extends UserData> Mono<S> save(S entity);

    Flux<UserData> findAllBy(Pageable pageable);

    Flux<UserData> findAll();

    Mono<UserData> findById(Long id);
    // this is not supported at the moment because of https://github.com/jhipster/generator-jhipster/issues/18269
    // Flux<UserData> findAllBy(Pageable pageable, Criteria criteria);
}
