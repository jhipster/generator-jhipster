package <%=packageName%>.domain.enumeration;

/**
 * The <%= enumName %> enumeration.
 */
public enum <%= enumName %> {
    <%- enumValues %>;
    <% if (enumValues.indexOf("(")!=-1){ %>
    private Object value;
		private <%= enumName %> (Object value){this.value = value;}
    
		@com.fasterxml.jackson.annotation.JsonValue
    public String toString(){return String.valueOf(this.value);}
    <% } %>
}
