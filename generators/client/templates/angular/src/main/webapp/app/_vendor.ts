// TODO some of the libraries are required for entity sub gen hence need to find ng2 alternatives for same
/* tslint:disable */
// import 'angular-aria';
// import 'angular-dynamic-locale';
// import 'angular-cache-buster';
// import 'angular-loading-bar';
// import 'ng-file-upload';

<%_ if (useSass) { _%>
import '../scss/vendor.scss';
<%_} else { _%>
import '../content/css/vendor.css';
<%_ } _%>

