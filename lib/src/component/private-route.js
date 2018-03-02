"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_redux_1 = require("react-redux");
var react_router_dom_1 = require("react-router-dom");
exports.PrivateRouteComponent = function (_a) {
    var Component = _a.component, isAuthenticated = _a.isAuthenticated, rest = __rest(_a, ["component", "isAuthenticated"]);
    var renderRedirect = function (props) {
        return isAuthenticated ? (React.createElement(Component, __assign({}, props))) : (React.createElement(react_router_dom_1.Redirect, { to: {
                pathname: '/login',
                search: props.location.search,
                state: { from: props.location }
            } }));
    };
    if (!Component)
        throw new Error("A component needs to be specified for private route for path " + rest.path);
    return React.createElement(react_router_dom_1.Route, __assign({}, rest, { render: renderRedirect }));
};
var mapStoreToProps = function (_a) {
    var authentication = _a.authentication;
    return ({
        isAuthenticated: authentication.isAuthenticated
    });
};
/**
 * A route wrapped in an authentication check so that routing happens only when you are authenticated.
 * Accepts same props as React router Route.
 */
exports.PrivateRoute = react_redux_1.connect(mapStoreToProps, null, null, { pure: false })(exports.PrivateRouteComponent);
//# sourceMappingURL=private-route.js.map