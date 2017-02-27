/* after changing this file run '<%= clientPackageManager %> install' or '<%= clientPackageManager %> run webpack:build' */
/* tslint:disable */
<%_ if (useSass) { _%>
import '../content/scss/vendor.scss';
<%_} else { _%>
import '../content/css/vendor.css';
<%_ } _%>
