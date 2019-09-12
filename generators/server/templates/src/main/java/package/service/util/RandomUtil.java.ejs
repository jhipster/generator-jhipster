<%#
 Copyright 2013-2019 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://www.jhipster.tech/
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
package <%=packageName%>.service.util;

import org.apache.commons.lang3.RandomStringUtils;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

/**
 * Utility class for generating random Strings.
 */
public final class RandomUtil {

    private static final int DEF_COUNT = 20;

    private static final RandomUtil INSTANCE = new RandomUtil();

    public static RandomUtil getInstance() {
        return INSTANCE;
    }

    private final SecureRandom secureRandom;

    private RandomUtil() {
        try {
            secureRandom = SecureRandom.getInstanceStrong();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Unable to find secure algorithms.", e); //NOSONAR
        }
    }

    private String generateRandomAlphanumericString() {
        return RandomStringUtils.random(DEF_COUNT, 0, 0, true, true, null, secureRandom);
    }

    /**
     * Generate a password.
     *
     * @return the generated password.
     */
    public String generatePassword() {
        return generateRandomAlphanumericString();
    }

    /**
     * Generate an activation key.
     *
     * @return the generated activation key.
     */
    public String generateActivationKey() {
        return generateRandomAlphanumericString();
    }

    /**
     * Generate a reset key.
     *
     * @return the generated reset key.
     */
    public String generateResetKey() {
        return generateRandomAlphanumericString();
    }
    <%_ if (authenticationType === 'session' && !reactive) { _%>

    /**
     * Generate a unique series to validate a persistent token, used in the
     * authentication remember-me mechanism.
     *
     * @return the generated series data.
     */
    public String generateSeriesData() {
        return generateRandomAlphanumericString();
    }

    /**
     * Generate a persistent token, used in the authentication remember-me mechanism.
     *
     * @return the generated token data.
     */
    public String generateTokenData() {
        return generateRandomAlphanumericString();
    }
    <%_ } _%>
}
