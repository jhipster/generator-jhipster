package com.okta.developer.notification.domain;

import static com.okta.developer.notification.domain.NotificationEntityTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.okta.developer.notification.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class NotificationEntityTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(NotificationEntity.class);
        NotificationEntity notificationEntity1 = getNotificationEntitySample1();
        NotificationEntity notificationEntity2 = new NotificationEntity();
        assertThat(notificationEntity1).isNotEqualTo(notificationEntity2);

        notificationEntity2.setId(notificationEntity1.getId());
        assertThat(notificationEntity1).isEqualTo(notificationEntity2);

        notificationEntity2 = getNotificationEntitySample2();
        assertThat(notificationEntity1).isNotEqualTo(notificationEntity2);
    }
}
