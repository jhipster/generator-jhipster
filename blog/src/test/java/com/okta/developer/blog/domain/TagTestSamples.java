package com.okta.developer.blog.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class TagTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static Tag getTagSample1() {
        return new Tag().id(1L).name("name1");
    }

    public static Tag getTagSample2() {
        return new Tag().id(2L).name("name2");
    }

    public static Tag getTagRandomSampleGenerator() {
        return new Tag().id(longCount.incrementAndGet()).name(UUID.randomUUID().toString());
    }
}
