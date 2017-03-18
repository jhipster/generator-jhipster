/* after changing this file run '<%= clientPackageManager %> run webpack:build:vendor' or '<%= clientPackageManager %> install' or '<%= clientPackageManager %> run webpack:build' */
/* tslint:disable */
<%_ if (useSass) { _%>
import '../content/scss/vendor.scss';
<%_} else { _%>
import '../content/css/vendor.css';
<%_ } _%>
