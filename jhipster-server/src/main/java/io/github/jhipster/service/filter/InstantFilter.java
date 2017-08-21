/*
 * Copyright 2017 the original author or authors.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.github.jhipster.service.filter;

import java.time.Instant;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;

/**
 * Filter class for {@link Instant} type attributes.
 * @see RangeFilter
 */
public class InstantFilter extends RangeFilter<Instant> {

    @Override
    @DateTimeFormat(iso = ISO.DATE_TIME)
    public void setEquals(Instant equals) {
        super.setEquals(equals);
    }

    @Override
    @DateTimeFormat(iso = ISO.DATE_TIME)
    public void setGreaterThan(Instant equals) {
        super.setGreaterThan(equals);
    }

    @Override
    @DateTimeFormat(iso = ISO.DATE_TIME)
    public void setGreaterOrEqualThan(Instant equals) {
        super.setGreaterOrEqualThan(equals);
    }

    @Override
    @DateTimeFormat(iso = ISO.DATE_TIME)
    public void setLessThan(Instant equals) {
        super.setLessThan(equals);
    }

    @Override
    @DateTimeFormat(iso = ISO.DATE_TIME)
    public void setLessOrEqualThan(Instant equals) {
        super.setLessOrEqualThan(equals);
    }

}
