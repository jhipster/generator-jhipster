// TODO some of the libraries are required for entity sub gen hence need to find ng2 alternatives for same
/* tslint:disable */
// import 'angular-aria';
// import 'angular-dynamic-locale';
// import 'angular-cache-buster';
// import 'angular-loading-bar';
// import 'ng-file-upload';
// import 'ng-infinite-scroll';

<%_ if(useSass) { _%>
import '../scss/vendor.scss';
<%_} else { _%>
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
<%_ } _%>



import '../content/css/main.css';
<%_ if(useSass) { _%>
// import '../content/css/vendor.css'; deprecated???
<%_ } _%>
