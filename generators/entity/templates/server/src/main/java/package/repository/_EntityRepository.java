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
package <%=packageName%>.repository;

import <%=packageName%>.domain.<%=entityClass%>;
import org.springframework.stereotype.Repository;
<% if (databaseType === 'sql') { %>
import org.springframework.data.jpa.repository.*;<% if (fieldsContainOwnerManyToMany==true) { %>
import org.springframework.data.repository.query.Param;<% } %>
<%_ let importList = fieldsContainOwnerManyToMany;
    for (r of relationships) {
        if (r.relationshipType === 'many-to-one' && r.otherEntityName === 'user') {
            importList = true;
        }
    }
    if (importList === true) {
_%>
import java.util.List;<% if (fieldsContainOwnerManyToMany === true) { %>
import java.util.Optional;<%_ } _%><% }} %>
<%_ if (databaseType === 'cassandra') { _%>
import java.util.UUID;
<%_ } _%>
<% if (databaseType === 'mongodb') { %>
import org.springframework.data.mongodb.repository.<% if (reactive) { %>Reactive<% } %>MongoRepository;<% } %><% if (databaseType === 'cassandra') { %>
import org.springframework.data.cassandra.repository.<% if (reactive) { %>Reactive<% } %>CassandraRepository;
<% } %>

<%_ if (databaseType === 'sql') { _%>
/**
 * Spring Data JPA repository for the <%= entityClass %> entity.
 */
<%_ } if (databaseType === 'mongodb') { _%>
/**
 * Spring Data MongoDB repository for the <%= entityClass %> entity.
 */
<%_ } if (databaseType === 'cassandra') { _%>
/**
 * Cassandra repository for the <%= entityClass %> entity.
 */
<%_ } _%>
@SuppressWarnings("unused")
@Repository
public interface <%=entityClass%>Repository extends <% if (databaseType === 'sql') { %>JpaRepository<% } %><% if (databaseType === 'mongodb') { %><% if (reactive) { %>Reactive<% } %>MongoRepository<% } %><% if (databaseType === 'cassandra') { %><% if (reactive) { %>Reactive<% } %>CassandraRepository<% } %><<%=entityClass%>, <%= pkType %>><% if (jpaMetamodelFiltering) { %>, JpaSpecificationExecutor<<%=entityClass%>><% } %> {
    <%_ for (idx in relationships) {
        if (relationships[idx].relationshipType === 'many-to-one' && relationships[idx].otherEntityName === 'user') { _%>

    @Query("select <%= entityTableName %> from <%= entityClass %> <%= entityTableName %> where <%= entityTableName %>.<%= relationships[idx].relationshipFieldName %>.login = ?#{principal.username}")
    List<<%= entityClass %>> findBy<%= relationships[idx].relationshipNameCapitalized %>IsCurrentUser();
    <%_ } } _%>
    <%_ if (fieldsContainOwnerManyToMany === true) { _%>
    @Query("select distinct <%= entityTableName %> from <%= entityClass %> <%= entityTableName %><% for (idx in relationships) {
    if (relationships[idx].relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { %> left join fetch <%=entityTableName%>.<%=relationships[idx].relationshipFieldNamePlural%><%} }%>")
    List<<%=entityClass%>> findAllWithEagerRelationships();

    @Query("select <%= entityTableName %> from <%= entityClass %> <%= entityTableName %><% for (idx in relationships) {
    if (relationships[idx].relationshipType === 'many-to-many' && relationships[idx].ownerSide === true) { %> left join fetch <%=entityTableName%>.<%=relationships[idx].relationshipFieldNamePlural%><%} }%> where <%=entityTableName%>.id =:id")
    Optional<<%=entityClass%>> findOneWithEagerRelationships(@Param("id") Long id);
    <%_ } _%>

}
