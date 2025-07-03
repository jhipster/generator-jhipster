package com.okta.developer.gateway.web.rest;

import com.okta.developer.gateway.domain.Authority;
import com.okta.developer.gateway.repository.AuthorityRepository;
import com.okta.developer.gateway.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.reactive.ResponseUtil;

/**
 * REST controller for managing {@link com.okta.developer.gateway.domain.Authority}.
 */
@RestController
@RequestMapping("/api/authorities")
@Transactional
public class AuthorityResource {

    private static final Logger LOG = LoggerFactory.getLogger(AuthorityResource.class);

    private static final String ENTITY_NAME = "adminAuthority";

    @Value("${jhipster.clientApp.name:gateway}")
    private String applicationName;

    private final AuthorityRepository authorityRepository;

    public AuthorityResource(AuthorityRepository authorityRepository) {
        this.authorityRepository = authorityRepository;
    }

    /**
     * {@code POST  /authorities} : Create a new authority.
     *
     * @param authority the authority to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new authority, or with status {@code 400 (Bad Request)} if the authority has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<ResponseEntity<Authority>> createAuthority(@Valid @RequestBody Authority authority) throws URISyntaxException {
        LOG.debug("REST request to save Authority : {}", authority);
        return authorityRepository
            .existsById(authority.getName())
            .flatMap(exists -> {
                if (exists) {
                    return Mono.error(new BadRequestAlertException("authority already exists", ENTITY_NAME, "idexists"));
                }
                return authorityRepository
                    .save(authority)
                    .map(result -> {
                        try {
                            return ResponseEntity.created(new URI("/api/authorities/" + result.getName()))
                                .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getName()))
                                .body(result);
                        } catch (URISyntaxException e) {
                            throw new RuntimeException(e);
                        }
                    });
            });
    }

    /**
     * {@code GET  /authorities} : get all the authorities.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of authorities in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<List<Authority>> getAllAuthorities() {
        LOG.debug("REST request to get all Authorities");
        return authorityRepository.findAll().collectList();
    }

    /**
     * {@code GET  /authorities} : get all the authorities as a stream.
     * @return the {@link Flux} of authorities.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_NDJSON_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Flux<Authority> getAllAuthoritiesAsStream() {
        LOG.debug("REST request to get all Authorities as a stream");
        return authorityRepository.findAll();
    }

    /**
     * {@code GET  /authorities/:id} : get the "id" authority.
     *
     * @param id the id of the authority to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the authority, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<ResponseEntity<Authority>> getAuthority(@PathVariable("id") String id) {
        LOG.debug("REST request to get Authority : {}", id);
        Mono<Authority> authority = authorityRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(authority);
    }

    /**
     * {@code DELETE  /authorities/:id} : delete the "id" authority.
     *
     * @param id the id of the authority to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<ResponseEntity<Void>> deleteAuthority(@PathVariable("id") String id) {
        LOG.debug("REST request to delete Authority : {}", id);
        return authorityRepository
            .deleteById(id)
            .then(
                Mono.just(
                    ResponseEntity.noContent().headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id)).build()
                )
            );
    }
}
