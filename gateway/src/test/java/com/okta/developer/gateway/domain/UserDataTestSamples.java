package com.okta.developer.gateway.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class UserDataTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static UserData getUserDataSample1() {
        return new UserData().id(1L).address("address1");
    }

    public static UserData getUserDataSample2() {
        return new UserData().id(2L).address("address2");
    }

    public static UserData getUserDataRandomSampleGenerator() {
        return new UserData().id(longCount.incrementAndGet()).address(UUID.randomUUID().toString());
    }
}
