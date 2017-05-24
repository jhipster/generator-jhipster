package <%= packageName %>.service.dto;

import java.io.Serializable;<% if (fieldsContainBigDecimal === true) { %>
import java.math.BigDecimal;<% } %>
<%_ for (idx in fields) { if (fields[idx].fieldIsEnum === true) { _%>
import <%= packageName %>.domain.enumeration.<%= fields[idx].fieldType %>;
<%_ } } _%>
import io.github.jhipster.service.filter.Filter;
import io.github.jhipster.service.filter.IntegerFilter;
import io.github.jhipster.service.filter.LongFilter;
import io.github.jhipster.service.filter.StringFilter;
import io.github.jhipster.service.filter.RangeFilter;
<%_ if (fieldsContainInstant === true) { _%>
import io.github.jhipster.service.filter.InstantFilter;<% } %>
<%_ if (fieldsContainLocalDate === true) { _%>
import io.github.jhipster.service.filter.LocalDateFilter;<% } %>
<%_ if (fieldsContainZonedDateTime === true) { _%>
import io.github.jhipster.service.filter.ZonedDateTimeFilter;<% } %>

<%_
  const referenceFilterType = '' + pkType + 'Filter';
  var filterVariables = [{name:'id', type: pkType, filterType:referenceFilterType,fieldInJavaBeanMethod:'Id' } ];
  var extraFilters = {};
  fields.forEach((field) => {
    const fieldType = field.fieldType;
    if (isFilterableType(fieldType)) {
      var filterType;
      if (field.fieldIsEnum == true) {
        filterType = fieldType + 'Filter';
        extraFilters[fieldType] = {type : filterType, superType: 'Filter<' + fieldType + '>', fieldType:fieldType};
      } else if (['LocalDate', 'ZonedDateTime', 'Instant', 'String', 'Long', 'Integer'].includes(fieldType)) {
        filterType = fieldType + 'Filter';
      } else if (['Float', 'Double', 'BigDecimal'].includes(fieldType)) {
        filterType = 'RangeFilter<' + fieldType + '>';
      } else {
        filterType = 'Filter<' + fieldType + '>';
      }
      filterVariables.push( { filterType : filterType,
            name: field.fieldName,
            type: fieldType,
            fieldInJavaBeanMethod: field.fieldInJavaBeanMethod });
    }
  });
  relationships.forEach((relationship) => {
    const relationshipType = relationship.relationshipType;
    if (relationshipType === 'many-to-one' || relationshipType === 'one-to-one') {
      filterVariables.push({ filterType : referenceFilterType,
            name: relationship.relationshipFieldName + 'Id',
            type: relationshipType,
            fieldInJavaBeanMethod: relationship.relationshipNameCapitalized + 'Id' });
    }
  });
_%>

/**
 * Criteria class for the <%= entityClass %> entity. This class is used in <%= entityClass %>Resource to
 * receive all the possible filtering options from the Http GET request parameters.
 * For example the following could be a valid requests:
 * <code> /<%= entityApiUrl %>?id.greaterThan=5&amp;attr1.contains=something&amp;attr2.specified=false</code>
 * As Spring is unable to properly convert the types, unless specific {@link Filter} class are used, we need to use
 * fix type specific filters.
 */
public class <%= entityClass %>Criteria implements Serializable {
<%_ Object.keys(extraFilters).forEach((key) => {
        extraFilter = extraFilters[key]; _%>
    /**
     * Class for filtering <%= key %>
     */
    public static class <%= extraFilter.type %> extends <%- extraFilter.superType %> {
    }

<%_ }); _%>
    private static final long serialVersionUID = 1L;

<%_ filterVariables.forEach((filterVariable) => { _%>

    private <%- filterVariable.filterType %> <%= filterVariable.name %>;
<%_ }); _%>

    public <%= entityClass %>Criteria() {
    }

<%_ filterVariables.forEach((filterVariable) => { _%>
    public <%- filterVariable.filterType %> get<%= filterVariable.fieldInJavaBeanMethod %>() {
        return <%= filterVariable.name %>;
    }

    public void set<%= filterVariable.fieldInJavaBeanMethod %>(<%- filterVariable.filterType %> <%= filterVariable.name %>) {
        this.<%= filterVariable.name %> = <%= filterVariable.name %>;
    }

<%_ }); _%>
    @Override
    public String toString() {
        return "<%= entityClass %>Criteria{" +
<%_ filterVariables.forEach((field) => { _%>
                (<%= field.name %> != null ? "<%= field.name %>=" + <%= field.name %> + ", " : "") +
<%_ }); _%>
            "}";
    }

}
