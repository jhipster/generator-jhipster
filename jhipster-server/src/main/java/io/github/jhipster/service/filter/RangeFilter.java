/*
 * Copyright 2017 the original author or authors.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
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

/**
 * Filter class for Comparable types, where less than / greater than / etc relations could be interpreted. It can be
 * added to a criteria class as a member, to support the following query parameters:
 * <pre>
 *      fieldName.equals=42
 *      fieldName.specified=true
 *      fieldName.specified=false
 *      fieldName.in=43,42
 *      fieldName.greaterThan=41
 *      fieldName.lessThan=44
 *      fieldName.greaterOrEqualThan=42
 *      fieldName.lessOrEqualThan=44
 * </pre>
 * Because problems with the type conversions, the descendant classes needs to be used, where the generic type parameter
 * is materalized.
 *
 * @param <FIELD_TYPE> the type of filter.
 * @see IntegerFilter
 * @see DoubleFilter
 * @see FloatFilter
 * @see LongFilter
 * @see LocalDateFilter
 * @see InstantFilter
 */
public class RangeFilter<FIELD_TYPE extends Comparable<? super FIELD_TYPE>> extends Filter<FIELD_TYPE> {

    private FIELD_TYPE greaterThan;
    private FIELD_TYPE lessThan;
    private FIELD_TYPE greaterOrEqualThan;
    private FIELD_TYPE lessOrEqualThan;

    public FIELD_TYPE getGreaterThan() {
        return greaterThan;
    }

    public RangeFilter<FIELD_TYPE> setGreaterThan(FIELD_TYPE greaterThan) {
        this.greaterThan = greaterThan;
        return this;
    }

    public FIELD_TYPE getGreaterOrEqualThan() {
        return greaterOrEqualThan;
    }

    public RangeFilter<FIELD_TYPE> setGreaterOrEqualThan(FIELD_TYPE greaterOrEqualThan) {
        this.greaterOrEqualThan = greaterOrEqualThan;
        return this;
    }

    public FIELD_TYPE getLessThan() {
        return lessThan;
    }

    public RangeFilter<FIELD_TYPE> setLessThan(FIELD_TYPE lessThan) {
        this.lessThan = lessThan;
        return this;
    }

    public FIELD_TYPE getLessOrEqualThan() {
        return lessOrEqualThan;
    }

    public RangeFilter<FIELD_TYPE> setLessOrEqualThan(FIELD_TYPE lessOrEqualThan) {
        this.lessOrEqualThan = lessOrEqualThan;
        return this;
    }

    @Override
    public String toString() {
        return "RangeFilter [" + (getGreaterThan() != null ? "greaterThan=" + getGreaterThan() + ", " : "")
            + (getGreaterOrEqualThan() != null ? "greaterOrEqualThan=" + getGreaterOrEqualThan() + ", " : "")
            + (getLessThan() != null ? "lessThan=" + getLessThan() + ", " : "")
            + (getLessOrEqualThan() != null ? "lessOrEqualThan=" + getLessOrEqualThan() + ", " : "")
            + (getEquals() != null ? "equals=" + getEquals() + ", " : "")
            + (getSpecified() != null ? "specified=" + getSpecified() : "")
            + (getIn() != null ? "in=" + getIn() : "")
            + "]";
    }

}
