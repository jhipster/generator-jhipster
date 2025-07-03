package com.okta.developer.notification.service.impl;

import com.okta.developer.notification.repository.NotificationRepository;
import com.okta.developer.notification.service.NotificationService;
import com.okta.developer.notification.service.dto.NotificationRest;
import com.okta.developer.notification.service.mapper.NotificationMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Service Implementation for managing {@link com.okta.developer.notification.domain.NotificationEntity}.
 */
@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;

    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(NotificationRepository notificationRepository, NotificationMapper notificationMapper) {
        this.notificationRepository = notificationRepository;
        this.notificationMapper = notificationMapper;
    }

    @Override
    public Mono<NotificationRest> save(NotificationRest notificationRest) {
        LOG.debug("Request to save Notification : {}", notificationRest);
        return notificationRepository.save(notificationMapper.toEntity(notificationRest)).map(notificationMapper::toDto);
    }

    @Override
    public Mono<NotificationRest> update(NotificationRest notificationRest) {
        LOG.debug("Request to update Notification : {}", notificationRest);
        return notificationRepository.save(notificationMapper.toEntity(notificationRest)).map(notificationMapper::toDto);
    }

    @Override
    public Mono<NotificationRest> partialUpdate(NotificationRest notificationRest) {
        LOG.debug("Request to partially update Notification : {}", notificationRest);

        return notificationRepository
            .findById(notificationRest.getId())
            .map(existingNotification -> {
                notificationMapper.partialUpdate(existingNotification, notificationRest);

                return existingNotification;
            })
            .flatMap(notificationRepository::save)
            .map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Flux<NotificationRest> findAll() {
        LOG.debug("Request to get all Notifications");
        return notificationRepository.findAll().map(notificationMapper::toDto);
    }

    public Mono<Long> countAll() {
        return notificationRepository.count();
    }

    @Override
    @Transactional(readOnly = true)
    public Mono<NotificationRest> findOne(Long id) {
        LOG.debug("Request to get Notification : {}", id);
        return notificationRepository.findById(id).map(notificationMapper::toDto);
    }

    @Override
    public Mono<Void> delete(Long id) {
        LOG.debug("Request to delete Notification : {}", id);
        return notificationRepository.deleteById(id);
    }
}
