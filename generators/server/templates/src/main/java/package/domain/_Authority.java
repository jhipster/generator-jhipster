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
package <%=packageName%>.domain;

<% if (hibernateCache !== 'no' && databaseType === 'sql') { %>import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %><% if (databaseType === 'mongodb') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;<% } %><% if (databaseType === 'sql') { %>
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Column;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;

/**
 * An authority (a security role) used by Spring Security.
 */
<%_ if (databaseType === 'sql') { _%>
@Entity
@Table(name = "<%= jhiTablePrefix %>_authority")
    <%_ if (hibernateCache !== 'no') { _%>
        <%_ if (hibernateCache === 'infinispan') { _%>
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
        <%_ } else { _%>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
        <%_ } _%>
    <%_ } _%>
<%_ } _%>
<%_ if (databaseType === 'mongodb') { _%>
@Document(collection = "<%= jhiTablePrefix %>_authority")
<%_ } _%>
public class Authority implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull
    @Size(max = 50)
    @Id<% if (databaseType === 'sql') { %>
    @Column(length = 50)<% } %>
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        Authority authority = (Authority) o;

        return !(name != null ? !name.equals(authority.name) : authority.name != null);
    }

    @Override
    public int hashCode() {
        return name != null ? name.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "Authority{" +
            "name='" + name + '\'' +
            "}";
    }
}
