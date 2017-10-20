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

package io.github.jhipster.service;

import java.util.Collection;
import javax.persistence.criteria.CriteriaBuilder.In;
import javax.persistence.metamodel.SetAttribute;
import javax.persistence.metamodel.SingularAttribute;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.domain.Specifications;
import org.springframework.transaction.annotation.Transactional;

import io.github.jhipster.service.filter.*;

/**
 * Base service for constructing and executing complex queries.
 *
 * @param <ENTITY> the type of the entity which is queried.
 */
@Transactional(readOnly = true)
public abstract class QueryService<ENTITY> {

    /**
     * Helper function to return a specification for filtering on a single field, where equality, and null/non-null
     * conditions are supported.
     *
     * @param filter the individual attribute filter coming from the frontend.
     * @param field  the JPA static metamodel representing the field.
     * @param <X>    The type of the attribute which is filtered.
     * @return a Specification
     */
    protected <X> Specification<ENTITY> buildSpecification(Filter<X> filter, SingularAttribute<? super ENTITY, X>
        field) {
        if (filter.getEquals() != null) {
            return equalsSpecification(field, filter.getEquals());
        } else if (filter.getIn() != null) {
            return valueIn(field, filter.getIn());
        } else if (filter.getSpecified() != null) {
            return byFieldSpecified(field, filter.getSpecified());
        }
        return null;
    }

    /**
     * Helper function to return a specification for filtering on a {@link String} field, where equality, containment,
     * and null/non-null conditions are supported.
     *
     * @param filter the individual attribute filter coming from the frontend.
     * @param field  the JPA static metamodel representing the field.
     * @return a Specification
     */
    protected Specification<ENTITY> buildStringSpecification(StringFilter filter, SingularAttribute<? super ENTITY,
        String> field) {
        if (filter.getEquals() != null) {
            return equalsSpecification(field, filter.getEquals());
        } else if (filter.getIn() != null) {
            return valueIn(field, filter.getIn());
        } else if (filter.getContains() != null) {
            return likeUpperSpecification(field, filter.getContains());
        } else if (filter.getSpecified() != null) {
            return byFieldSpecified(field, filter.getSpecified());
        }
        return null;
    }

    /**
     * Helper function to return a specification for filtering on a single {@link Comparable}, where equality, less
     * than, greater than and less-than-or-equal-to and greater-than-or-equal-to and null/non-null conditions are
     * supported.
     *
     * @param filter the individual attribute filter coming from the frontend.
     * @param field  the JPA static metamodel representing the field.
     * @param <X>    The type of the attribute which is filtered.
     * @return a Specification
     */
    protected <X extends Comparable<? super X>> Specification<ENTITY> buildRangeSpecification(RangeFilter<X> filter,
        SingularAttribute<? super ENTITY, X> field) {
        if (filter.getEquals() != null) {
            return equalsSpecification(field, filter.getEquals());
        } else if (filter.getIn() != null) {
            return valueIn(field, filter.getIn());
        }

        Specifications<ENTITY> result = Specifications.where(null);
        if (filter.getSpecified() != null) {
            result = result.and(byFieldSpecified(field, filter.getSpecified()));
        }
        if (filter.getGreaterThan() != null) {
            result = result.and(greaterThan(field, filter.getGreaterThan()));
        }
        if (filter.getGreaterOrEqualThan() != null) {
            result = result.and(greaterThanOrEqualTo(field, filter.getGreaterOrEqualThan()));
        }
        if (filter.getLessThan() != null) {
            result = result.and(lessThan(field, filter.getLessThan()));
        }
        if (filter.getLessOrEqualThan() != null) {
            result = result.and(lessThanOrEqualTo(field, filter.getLessOrEqualThan()));
        }
        return result;
    }

    /**
     * Helper function to return a specification for filtering on one-to-one or many-to-one reference. Usage:
     * <pre>
     *   Specification&lt;Employee&gt; specByProjectId = buildReferringEntitySpecification(criteria.getProjectId(),
     * Employee_.project, Project_.id);
     *   Specification&lt;Employee&gt; specByProjectName = buildReferringEntitySpecification(criteria.getProjectName(),
     * Employee_.project, Project_.name);
     * </pre>
     *
     * @param filter     the filter object which contains a value, which needs to match or a flag if nullness is
     *                   checked.
     * @param reference  the attribute of the static metamodel for the referring entity.
     * @param valueField the attribute of the static metamodel of the referred entity, where the equality should be
     *                   checked.
     * @param <OTHER>    The type of the referenced entity.
     * @param <X>        The type of the attribute which is filtered.
     * @return a Specification
     */
    protected <OTHER, X> Specification<ENTITY> buildReferringEntitySpecification(Filter<X> filter,
        SingularAttribute<? super ENTITY, OTHER> reference,
        SingularAttribute<OTHER, X> valueField) {
        if (filter.getEquals() != null) {
            return equalsSpecification(reference, valueField, filter.getEquals());
        } else if (filter.getIn() != null) {
            return valueIn(reference, valueField, filter.getIn());
        } else if (filter.getSpecified() != null) {
            return byFieldSpecified(reference, filter.getSpecified());
        }
        return null;
    }

    /**
     * Helper function to return a specification for filtering on one-to-many or many-to-many reference. Usage:
     * <pre>
     *   Specification&lt;Employee&gt; specByEmployeeId = buildReferringEntitySpecification(criteria.getEmployeId(),
     * Project_.employees, Employee_.id);
     *   Specification&lt;Employee&gt; specByEmployeeName = buildReferringEntitySpecification(criteria.getEmployeName(),
     * Project_.project, Project_.name);
     * </pre>
     *
     * @param filter     the filter object which contains a value, which needs to match or a flag if emptiness is
     *                   checked.
     * @param reference  the attribute of the static metamodel for the referring entity.
     * @param valueField the attribute of the static metamodel of the referred entity, where the equality should be
     *                   checked.
     * @param <OTHER>    The type of the referenced entity.
     * @param <X>        The type of the attribute which is filtered.
     * @return a Specification
     */
    protected <OTHER, X> Specification<ENTITY> buildReferringEntitySpecification(Filter<X> filter,
        SetAttribute<ENTITY, OTHER> reference,
        SingularAttribute<OTHER, X> valueField) {
        if (filter.getEquals() != null) {
            return equalsSetSpecification(reference, valueField, filter.getEquals());
        } else if (filter.getSpecified() != null) {
            return byFieldSpecified(reference, filter.getSpecified());
        }
        return null;
    }

    protected <X> Specification<ENTITY> equalsSpecification(SingularAttribute<? super ENTITY, X> field, final X value) {
        return (root, query, builder) -> builder.equal(root.get(field), value);
    }

    protected <OTHER, X> Specification<ENTITY> equalsSpecification(SingularAttribute<? super ENTITY, OTHER>
        reference, SingularAttribute<OTHER, X> idField,
        X value) {
        return (root, query, builder) -> builder.equal(root.get(reference).get(idField), value);
    }

    protected <OTHER, X> Specification<ENTITY> equalsSetSpecification(SetAttribute<? super ENTITY, OTHER> reference,
        SingularAttribute<OTHER, X> idField,
        X value) {
        return (root, query, builder) -> builder.equal(root.join(reference).get(idField), value);
    }

    protected Specification<ENTITY> likeUpperSpecification(SingularAttribute<? super ENTITY, String> field, final
    String value) {
        return (root, query, builder) -> builder.like(builder.upper(root.get(field)), wrapLikeQuery(value));
    }

    protected <X> Specification<ENTITY> byFieldSpecified(SingularAttribute<? super ENTITY, X> field, final boolean
        specified) {
        return specified ? (root, query, builder) -> builder.isNotNull(root.get(field)) : (root, query, builder) ->
            builder.isNull(root.get(field));
    }

    protected <X> Specification<ENTITY> byFieldSpecified(SetAttribute<ENTITY, X> field, final boolean specified) {
        return specified ? (root, query, builder) -> builder.isNotEmpty(root.get(field)) : (root, query, builder) ->
            builder.isEmpty(root.get(field));
    }

    protected <X> Specification<ENTITY> valueIn(SingularAttribute<? super ENTITY, X> field, final Collection<X>
        values) {
        return (root, query, builder) -> {
            In<X> in = builder.in(root.get(field));
            for (X value : values) {
                in = in.value(value);
            }
            return in;
        };
    }

    protected <OTHER, X> Specification<ENTITY> valueIn(SingularAttribute<? super ENTITY, OTHER> reference,
            SingularAttribute<OTHER, X> valueField, final Collection<X> values) {
        return (root, query, builder) -> {
            In<X> in = builder.in(root.get(reference).get(valueField));
            for (X value : values) {
                in = in.value(value);
            }
            return in;
        };
    }

    protected <X extends Comparable<? super X>> Specification<ENTITY> greaterThanOrEqualTo(SingularAttribute<? super
        ENTITY, X> field, final X value) {
        return (root, query, builder) -> builder.greaterThanOrEqualTo(root.get(field), value);
    }

    protected <X extends Comparable<? super X>> Specification<ENTITY> greaterThan(SingularAttribute<? super ENTITY,
        X> field, final X value) {
        return (root, query, builder) -> builder.greaterThan(root.get(field), value);
    }

    protected <X extends Comparable<? super X>> Specification<ENTITY> lessThanOrEqualTo(SingularAttribute<? super
        ENTITY, X> field, final X value) {
        return (root, query, builder) -> builder.lessThanOrEqualTo(root.get(field), value);
    }

    protected <X extends Comparable<? super X>> Specification<ENTITY> lessThan(SingularAttribute<? super ENTITY, X>
        field, final X value) {
        return (root, query, builder) -> builder.lessThan(root.get(field), value);
    }

    protected String wrapLikeQuery(String txt) {
        return "%" + txt.toUpperCase() + '%';
    }

}
