'use strict';

angular.module('<%=angularAppName%>')
    .directive('hasAnyRole', ['Principal', function (Principal) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var setVisible = function () {
                        element.removeClass('hidden');
                    },
                    setHidden = function () {
                        element.addClass('hidden');
                    },
                    defineVisibility = function (reset) {
                        var result;
                        if (reset) {
                            setVisible();
                        }

                        result = Principal.isInAnyRole(roles);
                        if (result) {
                            setVisible();
                        } else {
                            setHidden();
                        }
                    },
                    roles = attrs.hasAnyRole.replace(/\s+/g, '').split(',');

                if (roles.length > 0) {
                    defineVisibility(true);
                }
            }
        };
    }])
    .directive('hasRole', ['Principal', function (Principal) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var setVisible = function () {
                        element.removeClass('hidden');
                    },
                    setHidden = function () {
                        element.addClass('hidden');
                    },
                    defineVisibility = function (reset) {

                        if (reset) {
                            setVisible();
                        }

                        Principal.isInRole(role)
                            .then(function(result) {
                                if (result) {
                                    setVisible();
                                } else {
                                    setHidden();
                                }
                            });
                    },
                    role = attrs.hasRole.replace(/\s+/g, '');

                if (role.length > 0) {
                    defineVisibility(true);
                }
            }
        };
    }]);
