package com.okta.developer.gateway.web.rest;

import com.okta.developer.gateway.domain.UserData;
import com.okta.developer.gateway.repository.UserDataRepository;
import com.okta.developer.gateway.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.reactive.ResponseUtil;

/**
 * REST controller for managing {@link com.okta.developer.gateway.domain.UserData}.
 */
@RestController
@RequestMapping("/api/user-data")
@Transactional
public class UserDataResource {

    private static final Logger LOG = LoggerFactory.getLogger(UserDataResource.class);

    private static final String ENTITY_NAME = "userData";

    @Value("${jhipster.clientApp.name:gateway}")
    private String applicationName;

    private final UserDataRepository userDataRepository;

    public UserDataResource(UserDataRepository userDataRepository) {
        this.userDataRepository = userDataRepository;
    }

    /**
     * {@code POST  /user-data} : Create a new userData.
     *
     * @param userData the userData to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new userData, or with status {@code 400 (Bad Request)} if the userData has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public Mono<ResponseEntity<UserData>> createUserData(@RequestBody UserData userData) throws URISyntaxException {
        LOG.debug("REST request to save UserData : {}", userData);
        if (userData.getId() != null) {
            throw new BadRequestAlertException("A new userData cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return userDataRepository
            .save(userData)
            .map(result -> {
                try {
                    return ResponseEntity.created(new URI("/api/user-data/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /user-data/:id} : Updates an existing userData.
     *
     * @param id the id of the userData to save.
     * @param userData the userData to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userData,
     * or with status {@code 400 (Bad Request)} if the userData is not valid,
     * or with status {@code 500 (Internal Server Error)} if the userData couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<UserData>> updateUserData(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody UserData userData
    ) throws URISyntaxException {
        LOG.debug("REST request to update UserData : {}, {}", id, userData);
        if (userData.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userData.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return userDataRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return userDataRepository
                    .save(userData)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /user-data/:id} : Partial updates given fields of an existing userData, field will ignore if it is null
     *
     * @param id the id of the userData to save.
     * @param userData the userData to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated userData,
     * or with status {@code 400 (Bad Request)} if the userData is not valid,
     * or with status {@code 404 (Not Found)} if the userData is not found,
     * or with status {@code 500 (Internal Server Error)} if the userData couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public Mono<ResponseEntity<UserData>> partialUpdateUserData(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody UserData userData
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update UserData partially : {}, {}", id, userData);
        if (userData.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, userData.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return userDataRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<UserData> result = userDataRepository
                    .findById(userData.getId())
                    .map(existingUserData -> {
                        if (userData.getAddress() != null) {
                            existingUserData.setAddress(userData.getAddress());
                        }

                        return existingUserData;
                    })
                    .flatMap(userDataRepository::save);

                return result
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(res ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, res.getId().toString()))
                            .body(res)
                    );
            });
    }

    /**
     * {@code GET  /user-data} : get all the userData.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of userData in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<UserData>> getAllUserData() {
        LOG.debug("REST request to get all UserData");
        return userDataRepository.findAll().collectList();
    }

    /**
     * {@code GET  /user-data} : get all the userData as a stream.
     * @return the {@link Flux} of userData.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_NDJSON_VALUE)
    public Flux<UserData> getAllUserDataAsStream() {
        LOG.debug("REST request to get all UserData as a stream");
        return userDataRepository.findAll();
    }

    /**
     * {@code GET  /user-data/:id} : get the "id" userData.
     *
     * @param id the id of the userData to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the userData, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<UserData>> getUserData(@PathVariable("id") Long id) {
        LOG.debug("REST request to get UserData : {}", id);
        Mono<UserData> userData = userDataRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(userData);
    }

    /**
     * {@code DELETE  /user-data/:id} : delete the "id" userData.
     *
     * @param id the id of the userData to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteUserData(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete UserData : {}", id);
        return userDataRepository
            .deleteById(id)
            .then(
                Mono.just(
                    ResponseEntity.noContent()
                        .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
                        .build()
                )
            );
    }
}
