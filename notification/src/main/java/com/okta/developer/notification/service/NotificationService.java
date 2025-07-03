package com.okta.developer.notification.service;

import com.okta.developer.notification.service.dto.NotificationRest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Interface for managing {@link com.okta.developer.notification.domain.NotificationEntity}.
 */
public interface NotificationService {
    /**
     * Save a notification.
     *
     * @param notificationRest the entity to save.
     * @return the persisted entity.
     */
    Mono<NotificationRest> save(NotificationRest notificationRest);

    /**
     * Updates a notification.
     *
     * @param notificationRest the entity to update.
     * @return the persisted entity.
     */
    Mono<NotificationRest> update(NotificationRest notificationRest);

    /**
     * Partially updates a notification.
     *
     * @param notificationRest the entity to update partially.
     * @return the persisted entity.
     */
    Mono<NotificationRest> partialUpdate(NotificationRest notificationRest);

    /**
     * Get all the notifications.
     *
     * @return the list of entities.
     */
    Flux<NotificationRest> findAll();

    /**
     * Returns the number of notifications available.
     * @return the number of entities in the database.
     *
     */
    Mono<Long> countAll();

    /**
     * Get the "id" notification.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    Mono<NotificationRest> findOne(Long id);

    /**
     * Delete the "id" notification.
     *
     * @param id the id of the entity.
     * @return a Mono to signal the deletion
     */
    Mono<Void> delete(Long id);
}
