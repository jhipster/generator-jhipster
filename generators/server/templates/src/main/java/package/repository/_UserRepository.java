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

import <%=packageName%>.domain.User;
<%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
<%_ } _%>
<%_ if (databaseType === 'sql') { _%>
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
import org.springframework.data.mongodb.repository.MongoRepository;
<%_ } _%>
import org.springframework.stereotype.Repository;
<%_ if (databaseType === 'cassandra') { _%>
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.data.cassandra.repository.Query;
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
import java.util.List;
<%_ } _%>
import java.util.Optional;
<%_ if (databaseType !== 'cassandra') { _%>
import java.time.Instant;
<%_ } _%>
<%_ if (databaseType === 'sql') { _%>
/**
 * Spring Data JPA repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
/**
 * Spring Data MongoDB repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'cassandra') { _%>
/**
 * Cassandra repository for the User entity.
 */
<%_ } _%>
<%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
@Repository
public interface UserRepository extends <% if (databaseType === 'sql') { %>JpaRepository<User, Long><% } %><% if (databaseType === 'mongodb') { %>MongoRepository<User, String><% } %> {

    Optional<User> findOneByActivationKey(String activationKey);

    List<User> findAllByActivatedIsFalseAndCreatedDateBefore(Instant dateTime);

    Optional<User> findOneByResetKey(String resetKey);

    Optional<User> findOneByEmail(String email);

    Optional<User> findOneByLogin(String login);
    <%_ if (databaseType === 'sql') { _%>

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesById(<%= pkType %> id);

    @EntityGraph(attributePaths = "authorities")
    Optional<User> findOneWithAuthoritiesByLogin(String login);
    <%_ } _%>

    Page<User> findAllByLoginNot(Pageable pageable, String login);
}
<%_ } else if (databaseType === 'cassandra') { _%>
@Repository
public interface UserRepository extends CassandraRepository<User,String> {

    @Query("SELECT * FROM user WHERE activation_Key=?0 ALLOW FILTERING;")
    Optional<User> findOneByActivationKey(String activationKey);

    @Query("SELECT * FROM user WHERE reset_Key=?0 ALLOW FILTERING;")
    Optional<User> findOneByResetKey(String resetKey);

    @Query("SELECT * FROM user WHERE email=?0 ALLOW FILTERING;")
    Optional<User> findOneByEmail(String email);

    @Query("SELECT * FROM user WHERE login=?0 ALLOW FILTERING;")
    Optional<User> findOneByLogin(String login);
}
<%_ } _%>
