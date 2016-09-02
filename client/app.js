(function (ng) {
    angular.module(
        'app',
        [
            'ngCookies',
            'pascalprecht.translate',
            'tmh.dynamicLocale',
            'smart-table',
            'ui.bootstrap',
            'ngResource'
        ])
        .factory('Resource', function($resource) {
            // Настройка подключения к Rest API
            return $resource('http://movie:81/server/web/address/index/');
        })
        // i18n: LANGUAGE
        .config( function ($translateProvider) {

            // ADD LANG
            $translateProvider
                .useStaticFilesLoader({
                    prefix: 'assets/i18n/locale-',
                    suffix: '.json'
                })

                // REMEMBER
                .preferredLanguage('en')
                .fallbackLanguage('en')
                .useCookieStorage()

                // SECURITY
                .useSanitizeValueStrategy('escape');
        })
        // l10n: LOCALE
        .config(function(tmhDynamicLocaleProvider) {
            const locales = 'assets/angular/i18n/angular-locale_{{locale}}.js';
            tmhDynamicLocaleProvider

            // REMEMBER
                .localeLocationPattern(locales)
                .useCookieStorage();
        })
        .controller('LocaleCtrl', function($window, $scope, $translate, $cookieStore, tmhDynamicLocale, tmhDynamicLocaleCache, $rootScope, $locale){

            $scope.availableLocales = {
                'en-gb': 'English (GB)',
                'ru-ru': 'Русский (RU)'
            };

            // CHANGE LANG
            $scope.changeLocale = function(key) {
                $rootScope.model = {selectedLocale: key};
                // i18n
                var langKey = key.substring(0,2);
                $translate.use(langKey);
                // l10n
                tmhDynamicLocale.set(key);
            }

            // INIT
            $rootScope.$locale = $locale;
            var lang = $cookieStore.get('tmhDynamicLocale.locale');;
            if(!lang) {
                lang = $window.navigator.language || $window.navigator.userLanguage;
            }
            $scope.changeLocale(lang);

        })
        .controller('TableCtrl', function ($scope, Resource) {

            var tableStateRef;
            $scope.itemsByPage = 100;

            $scope.callServer = function(tableState) {
                $scope.isLoading = true;
                tableStateRef=tableState;
                var sort = tableState.sort;
                var predicate = sort.predicate || 'id';
                var reverse = sort.reverse || false;
                var search = tableState.search.predicateObject;
                var pagination = tableState.pagination;
                var start = pagination.start || 0;
                var number = pagination.number || $scope.itemsByPage;

                Resource.get({
                        page : 1+(start/number),
                        size : number,
                        sort : predicate,
                        reverse : reverse,
                        search : search
                    },
                    function(pageable) {
                        $scope.items = pageable.content;
                        tableState.pagination.numberOfPages = pageable.totalPages;
                        $scope.isLoading = false;
                    });
            };

            $scope.refreshFilter = function(){

                $scope.isLoading = true;
                Resource.get({},
                    function(pageable) {
                        $scope.items = pageable.content;
                        tableStateRef.pagination.numberOfPages = pageable.totalPages;
                        $scope.isLoading = false;
                    });

                tableStateRef.pagination.start = 1;
                tableStateRef.search.predicateObject = {};
                tableStateRef.sort.predicate = {};
            };

        })
        .directive('stDateRange', ['$timeout', function ($timeout) {
            return {
                restrict: 'E',
                require: '^stTable',
                scope: {
                    before: '=',
                    after: '='
                },
                templateUrl: 'view/stDateRange.html',

                link: function (scope, element, attr, table) {

                    var inputs = element.find('input');
                    var inputBefore = ng.element(inputs[0]);
                    var inputAfter = ng.element(inputs[1]);
                    var predicateName = attr.predicate;


                    [inputBefore, inputAfter].forEach(function (input) {

                        input.bind('blur', function () {


                            var query = {};

                            if (!scope.isBeforeOpen && !scope.isAfterOpen) {

                                if (scope.before) {
                                    query.before = scope.before;
                                }

                                if (scope.after) {
                                    query.after = scope.after;
                                }

                                scope.$apply(function () {
                                    table.search(query, predicateName);
                                })
                            }
                        });
                    });

                    function open(before) {
                        return function ($event) {
                            $event.preventDefault();
                            $event.stopPropagation();

                            if (before) {
                                scope.isBeforeOpen = true;
                            } else {
                                scope.isAfterOpen = true;
                            }
                        }
                    }

                    scope.openBefore = open(true);
                    scope.openAfter = open();
                }
            }
        }])
        .directive('stNumberRange', ['$timeout', function ($timeout) {
            return {
                restrict: 'E',
                require: '^stTable',
                scope: {
                    lower: '=',
                    higher: '='
                },
                templateUrl: 'view/stNumberRange.html',
                link: function (scope, element, attr, table) {
                    var inputs = element.find('input');
                    var inputLower = ng.element(inputs[0]);
                    var inputHigher = ng.element(inputs[1]);
                    var predicateName = attr.predicate;

                    [inputLower, inputHigher].forEach(function (input, index) {

                        input.bind('blur', function () {
                            var query = {};

                            if (scope.lower) {
                                query.lower = scope.lower;
                            }

                            if (scope.higher) {
                                query.higher = scope.higher;
                            }

                            scope.$apply(function () {
                                table.search(query, predicateName)
                            });
                        });
                    });
                }
            };
        }]);
})(angular);