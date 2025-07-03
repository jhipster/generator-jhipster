package com.okta.developer.notification.service.mapper;

import static com.okta.developer.notification.domain.NotificationEntityAsserts.*;
import static com.okta.developer.notification.domain.NotificationEntityTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class NotificationMapperTest {

    private NotificationMapper notificationMapper;

    @BeforeEach
    void setUp() {
        notificationMapper = new NotificationMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getNotificationEntitySample1();
        var actual = notificationMapper.toEntity(notificationMapper.toDto(expected));
        assertNotificationEntityAllPropertiesEquals(expected, actual);
    }
}
