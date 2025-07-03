package com.okta.developer.notification.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class NotificationEntityTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static NotificationEntity getNotificationEntitySample1() {
        return new NotificationEntity().id(1L).title("title1");
    }

    public static NotificationEntity getNotificationEntitySample2() {
        return new NotificationEntity().id(2L).title("title2");
    }

    public static NotificationEntity getNotificationEntityRandomSampleGenerator() {
        return new NotificationEntity().id(longCount.incrementAndGet()).title(UUID.randomUUID().toString());
    }
}
