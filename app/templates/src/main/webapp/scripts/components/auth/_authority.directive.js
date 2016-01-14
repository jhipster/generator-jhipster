'use strict';

angular.module('<%=angularAppName%>')
    .directive('hasAnyAuthority', ['Principal', function (Principal) {
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

                        result = Principal.hasAnyAuthority(authorities);
                        if (result) {
                            setVisible();
                        } else {
                            setHidden();
                        }
                    },
                    authorities = attrs.hasAnyAuthority.replace(/\s+/g, '').split(',');

                if (authorities.length > 0) {
                    defineVisibility(true);
                }
            }
        };
    }])
    .directive('hasAuthority', ['Principal', function (Principal) {
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

                        Principal.hasAuthority(authority)
                            .then(function (result) {
                                if (result) {
                                    setVisible();
                                } else {
                                    setHidden();
                                }
                            });
                    },
                    authority = attrs.hasAuthority.replace(/\s+/g, '');

                if (authority.length > 0) {
                    defineVisibility(true);
                }
            }
        };
    }]);
