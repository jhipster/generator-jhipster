package com.okta.developer.notification.service.mapper;

import com.okta.developer.notification.domain.NotificationEntity;
import com.okta.developer.notification.service.dto.NotificationRest;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link NotificationEntity} and its DTO {@link NotificationRest}.
 */
@Mapper(componentModel = "spring")
public interface NotificationMapper extends EntityMapper<NotificationRest, NotificationEntity> {}
