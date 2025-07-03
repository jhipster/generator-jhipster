package com.okta.developer.notification.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import com.okta.developer.notification.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class NotificationRestTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(NotificationRest.class);
        NotificationRest notificationRest1 = new NotificationRest();
        notificationRest1.setId(1L);
        NotificationRest notificationRest2 = new NotificationRest();
        assertThat(notificationRest1).isNotEqualTo(notificationRest2);
        notificationRest2.setId(notificationRest1.getId());
        assertThat(notificationRest1).isEqualTo(notificationRest2);
        notificationRest2.setId(2L);
        assertThat(notificationRest1).isNotEqualTo(notificationRest2);
        notificationRest1.setId(null);
        assertThat(notificationRest1).isNotEqualTo(notificationRest2);
    }
}
