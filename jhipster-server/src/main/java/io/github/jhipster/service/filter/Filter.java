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

import java.util.List;

/**
 * Base class for the various attribute filters.
 */
public class Filter<FIELD_TYPE> {

    private FIELD_TYPE equals;
    private Boolean specified;
    private List<FIELD_TYPE> in;

    public FIELD_TYPE getEquals() {
        return equals;
    }

    public void setEquals(FIELD_TYPE equals) {
        this.equals = equals;
    }

    public Boolean getSpecified() {
        return specified;
    }

    public void setSpecified(Boolean specified) {
        this.specified = specified;
    }

    public List<FIELD_TYPE> getIn() {
        return in;
    }

    public void setIn(List<FIELD_TYPE> in) {
        this.in = in;
    }

    @Override
    public String toString() {
        return "Filter ["
            + (getEquals() != null ? "equals=" + getEquals() + ", " : "")
            + (getIn() != null ? "in=" + getIn() : "")
            + (getSpecified() != null ? "specified=" + getSpecified() : "")
            + "]";
    }

}
