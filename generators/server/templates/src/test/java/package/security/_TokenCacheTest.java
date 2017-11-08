<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.security;

import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

public class TokenCacheTest {

    @Test
    public void testConstructorThrows() {
        Throwable caught = catchThrowable(() -> new TokenCache<String>(-1l, 0l));
        assertThat(caught).isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    public void testAbsent() {
        TokenCache<String> cache = new TokenCache<>(100l, 0l);
        assertThat(cache.get("key")).isNull();
    }

    @Test
    public void testAccess() {
        TokenCache<String> cache = new TokenCache<>(100l, 0l);
        cache.put("key", "val");
        assertThat(cache.size()).isEqualTo(1);
        assertThat(cache.get("key")).isEqualTo("val");
    }

    @Test
    public void testReplace() {
        TokenCache<String> cache = new TokenCache<>(100l, 0l);
        cache.put("key", "val");
        cache.put("key", "foo");
        assertThat(cache.get("key")).isEqualTo("foo");
    }

    @Test
    public void testExpires() {
        TokenCache<String> cache = new TokenCache<>(1l, 0l);
        cache.put("key", "val");
        try {
            Thread.sleep(5l);
        } catch (InterruptedException x) {
            // This should not happen
            throw new Error(x);
        }
        assertThat(cache.get("key")).isNull();
    }

    @Test
    public void testFullPurge() {
        TokenCache<String> cache = new TokenCache<>(1l, 0l);
        cache.put("key", "val");
        try {
            Thread.sleep(5l);
        } catch (InterruptedException x) {
            // This should not happen
            throw new Error(x);
        }
        assertThat(cache.size()).isEqualTo(1);
        cache.purge();
        assertThat(cache.size()).isEqualTo(0);
    }

    @Test
    public void testPartialPurge() {
        TokenCache<String> cache = new TokenCache<>(5l, 0l);
        cache.put("key", "val");
        try {
            Thread.sleep(5l);
        } catch (InterruptedException x) {
            // This should not happen
            throw new Error(x);
        }
        cache.put("foo", "bar");
        assertThat(cache.size()).isEqualTo(2);
        cache.purge();
        assertThat(cache.size()).isEqualTo(1);
    }

    @Test
    public void testFullAutoPurge() {
        TokenCache<String> cache = new TokenCache<>(1l, 5l);
        cache.put("key", "val");
        try {
            Thread.sleep(10l);
        } catch (InterruptedException x) {
            // This should not happen
            throw new Error(x);
        }
        assertThat(cache.size()).isEqualTo(0);
    }

    @Test
    public void testPartialAutoPurge() {
        TokenCache<String> cache = new TokenCache<>(10l, 5l);
        cache.put("key", "val");
        try {
            Thread.sleep(10l);
            cache.put("foo", "bar");
            Thread.sleep(5l);
        } catch (InterruptedException x) {
            // This should not happen
            throw new Error(x);
        }
        assertThat(cache.size()).isEqualTo(1);
    }
}
