type <%= enumName %> =
    <%_ for (idx in enums) {
    if (idx != 0) { _%>| <%_ } _%>
"<%= enums[idx] %>"
<%_ } _%>;
