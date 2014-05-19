package <%=packageName%>.domain<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>;

<% if (hibernateCache != 'no' && prodDatabaseType != 'none') { %>import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;<% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;<% } %><% if (prodDatabaseType != 'none') { %>
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;<% } %>
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;

/**
 * An authority (a security role) used by Spring Security.
 */
<% if (prodDatabaseType != 'none') { %>@Entity
@Table(name = "T_AUTHORITY")<% if (hibernateCache != 'no') { %>
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)<% } %><% } %><% if (prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>
@Document(collection = "T_AUTHORITY")<% } %>
public class Authority implements Serializable {

    @NotNull
    @Size(min = 0, max = 50)<% if(prodDatabaseType != 'none' || nosqlDatabaseType != 'none') { %>
    @Id<% } %>
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

        if (name != null ? !name.equals(authority.name) : authority.name != null) {
            return false;
        }

        return true;
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
