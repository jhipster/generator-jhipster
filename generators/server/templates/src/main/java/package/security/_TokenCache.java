<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
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

import java.util.Iterator;
import java.util.LinkedHashMap;

/**
 * Simple time-limited cache for login tokens, necessary to avoid concurrent
 * requests invalidating one another. It uses a {@link java.util.LinkedHashMap}
 * to keep the tokens in order of expiration, and a dedicated low-priority purger
 * thread which periodically removes expired tokens from the map.
 */
public class TokenCache<T> {
<%_ /* TODO Should this class be in the server lib instead? */ _%>

    private final long expireMillis;
    private final long purgeMillis;

    private final LinkedHashMap<String, Value> map;
    private final Thread purger;
    private long latestWriteTime;

    /**
     * Construct a new TokenCache.
     * 
     * @param expireMillis Delay until tokens expire, in millis.
     * @param purgeMillis  Period of the purger thread, in millis. If this is
     *                     zero or negative, no automatic purging will be done. 
     * @throws IllegalArgumentException if expireMillis is non-positive.
     */
    public TokenCache(long expireMillis, long purgeMillis) {
        if (expireMillis <= 0l) {
            throw new IllegalArgumentException();
        }
        this.expireMillis = expireMillis;
        this.purgeMillis = purgeMillis;

        map = new LinkedHashMap<>(64, 0.75f);
        latestWriteTime = System.currentTimeMillis();

        if (purgeMillis <= 0l) {
            purger = null;
        } else {
            purger = new Thread(new Runnable() {
                @Override
                public void run() {
                    try {
                        while (!purger.isInterrupted()) {
                            Thread.sleep(TokenCache.this.purgeMillis);
                            purge();
                        }
                    } catch (InterruptedException x) {
                        // done
                    }
                }
            });
            purger.setName("tokenCachePurge");
            purger.setDaemon(true);
            purger.setPriority(Thread.MIN_PRIORITY);
            purger.start();
        }
    }

    /**
     * Get a token from the cache.
     * 
     * @param key The key to look for.
     * @return The token, if present and not yet expired, or null otherwise.
     */
    public synchronized T get(String key) {
        final Value val = map.get(key);
        final long time = System.currentTimeMillis();
        return val != null && time < val.expire ? val.token : null;
    }

    /**
     * Put a token in the cache.
     * If a token already exists for the given key, it is replaced.
     * 
     * @param key   The key to insert for.
     * @param token The token to insert.
     */
    public synchronized void put(String key, T token) {
        if (map.containsKey(key)) {
            map.remove(key);
        }
        final long time = System.currentTimeMillis();
        map.put(key, new Value(token, time + expireMillis));
        latestWriteTime = time;
    }

    /**
     * Get the number of tokens in the cache. Note, this may include expired
     * tokens, unless {@link #purge()} is invoked first.
     * 
     * @return The size of the cache.
     */
    public synchronized int size() {
        return map.size();
    }

    /**
     * Remove expired entried from the map. This will be called periodically
     * by the purger thread, but could be manually invoked if desired.
     */
    public synchronized void purge() {
        if (map.size() > 0) {
            long time = System.currentTimeMillis();
            if (time - latestWriteTime > expireMillis) {
                // Everything in the map is expired, clear all at once
                map.clear();
            } else {
                // Iterate and remove until the first non-expired token
                Iterator<Value> values = map.values().iterator();
                do {
                    if (time >= values.next().expire) {
                        values.remove();
                    } else {
                        break;
                    }
                } while (values.hasNext());
            }
        }
    }


    private class Value {

        private final T token;
        private final long expire;

        Value(T token, long expire) {
            this.token = token;
            this.expire = expire;
        }
    }

}
