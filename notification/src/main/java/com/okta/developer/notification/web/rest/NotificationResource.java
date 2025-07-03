package com.okta.developer.notification.web.rest;

import com.okta.developer.notification.repository.NotificationRepository;
import com.okta.developer.notification.service.NotificationService;
import com.okta.developer.notification.service.dto.NotificationRest;
import com.okta.developer.notification.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.reactive.ResponseUtil;

/**
 * REST controller for managing {@link com.okta.developer.notification.domain.NotificationEntity}.
 */
@RestController
@RequestMapping("/api/notifications")
public class NotificationResource {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationResource.class);

    private static final String ENTITY_NAME = "notificationNotification";

    @Value("${jhipster.clientApp.name:notification}")
    private String applicationName;

    private final NotificationService notificationService;

    private final NotificationRepository notificationRepository;

    public NotificationResource(NotificationService notificationService, NotificationRepository notificationRepository) {
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
    }

    /**
     * {@code POST  /notifications} : Create a new notification.
     *
     * @param notificationRest the notificationRest to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new notificationRest, or with status {@code 400 (Bad Request)} if the notification has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<ResponseEntity<NotificationRest>> createNotification(@Valid @RequestBody NotificationRest notificationRest)
        throws URISyntaxException {
        LOG.debug("REST request to save Notification : {}", notificationRest);
        if (notificationRest.getId() != null) {
            throw new BadRequestAlertException("A new notification cannot already have an ID", ENTITY_NAME, "idexists");
        }
        return notificationService
            .save(notificationRest)
            .map(result -> {
                try {
                    return ResponseEntity.created(new URI("/api/notifications/" + result.getId()))
                        .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                        .body(result);
                } catch (URISyntaxException e) {
                    throw new RuntimeException(e);
                }
            });
    }

    /**
     * {@code PUT  /notifications/:id} : Updates an existing notification.
     *
     * @param id the id of the notificationRest to save.
     * @param notificationRest the notificationRest to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated notificationRest,
     * or with status {@code 400 (Bad Request)} if the notificationRest is not valid,
     * or with status {@code 500 (Internal Server Error)} if the notificationRest couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<ResponseEntity<NotificationRest>> updateNotification(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody NotificationRest notificationRest
    ) throws URISyntaxException {
        LOG.debug("REST request to update Notification : {}, {}", id, notificationRest);
        if (notificationRest.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, notificationRest.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return notificationRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                return notificationService
                    .update(notificationRest)
                    .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND)))
                    .map(result ->
                        ResponseEntity.ok()
                            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
                            .body(result)
                    );
            });
    }

    /**
     * {@code PATCH  /notifications/:id} : Partial updates given fields of an existing notification, field will ignore if it is null
     *
     * @param id the id of the notificationRest to save.
     * @param notificationRest the notificationRest to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated notificationRest,
     * or with status {@code 400 (Bad Request)} if the notificationRest is not valid,
     * or with status {@code 404 (Not Found)} if the notificationRest is not found,
     * or with status {@code 500 (Internal Server Error)} if the notificationRest couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<ResponseEntity<NotificationRest>> partialUpdateNotification(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody NotificationRest notificationRest
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Notification partially : {}, {}", id, notificationRest);
        if (notificationRest.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, notificationRest.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        return notificationRepository
            .existsById(id)
            .flatMap(exists -> {
                if (!exists) {
                    return Mono.error(new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound"));
                }

                Mono<NotificationRest> result = notificationService.partialUpdate(notificationRest);

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
     * {@code GET  /notifications} : get all the notifications.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of notifications in body.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<List<NotificationRest>> getAllNotifications() {
        LOG.debug("REST request to get all Notifications");
        return notificationService.findAll().collectList();
    }

    /**
     * {@code GET  /notifications} : get all the notifications as a stream.
     * @return the {@link Flux} of notifications.
     */
    @GetMapping(value = "", produces = MediaType.APPLICATION_NDJSON_VALUE)
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Flux<NotificationRest> getAllNotificationsAsStream() {
        LOG.debug("REST request to get all Notifications as a stream");
        return notificationService.findAll();
    }

    /**
     * {@code GET  /notifications/:id} : get the "id" notification.
     *
     * @param id the id of the notificationRest to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the notificationRest, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<ResponseEntity<NotificationRest>> getNotification(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Notification : {}", id);
        Mono<NotificationRest> notificationRest = notificationService.findOne(id);
        return ResponseUtil.wrapOrNotFound(notificationRest);
    }

    /**
     * {@code DELETE  /notifications/:id} : delete the "id" notification.
     *
     * @param id the id of the notificationRest to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public Mono<ResponseEntity<Void>> deleteNotification(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Notification : {}", id);
        return notificationService
            .delete(id)
            .then(
                Mono.just(
                    ResponseEntity.noContent()
                        .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
                        .build()
                )
            );
    }
}
