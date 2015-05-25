package <%=packageName%>.web.rest.dto;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Container class to hold one ID. Used for receiving objects from the client side, 
 * where only the ID is relevant.
 *
 */
<% 
  var idType = (databaseType == 'sql' ? "Long" : "String");
%>@JsonIgnoreProperties(ignoreUnknown = true)
public class IdDTO implements Serializable {

    private static final long serialVersionUID = 1L;
    private <%= idType %> id;

    public IdDTO() {
    }

    public IdDTO(<%= idType %> id) {
        this.id = id;
    }

    public <%= idType %> getId() {
        return id;
    }

    public void setId(<%= idType %> id) {
        this.id = id;
    }

    @Override
    public String toString() {
        return "Id[" + id + ']';
    }
}
