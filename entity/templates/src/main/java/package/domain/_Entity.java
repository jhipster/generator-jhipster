package <%=packageName%>.domain;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;

/**
 * A <%= entityClass %>.
 */
@Entity
@Table(name = "T_<%= name.toUpperCase() %>")
@Cache(usage = CacheConcurrencyStrategy.NONSTRICT_READ_WRITE)
public class <%= entityClass %> implements Serializable {

    @NotNull
    @Size(min = 0, max = 50)
    @Id
    private String id;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }

        <%= entityClass %> <%= entityInstance %> = (<%=entityClass %>) o;

        if (!id.equals(<%= entityInstance %>.id)) {
            return false;
        }

        return true;
    }

    @Override
    public int hashCode() {
        return id.hashCode();
    }

    @Override
    public String toString() {
        return "<%= entityClass %>{" +
                "id='" + id + '\'' +
                "}";
    }
}
