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

            var filterStyleSelector = '.style-for-table';
            var tableStateRef;
            $scope.itemsByPage = 100;

            $scope.callServer = function(tableState) {


                tableStateRef=tableState;
                $scope.isLoading = true;
                $scope.isNotFound = false;
                $scope.isServerError = false;
                $scope.serverMessage = '';

                /* Переменные для запроса на сервер */
                var sort = tableState.sort;
                var predicate = sort.predicate || 'id';
                var reverse = sort.reverse || false;
                var search = tableState.search.predicateObject;
                var pagination = tableState.pagination;
                var start = pagination.start || 0;
                var number = pagination.number || $scope.itemsByPage;


                /* Запрос на сервер */
                Resource.get({
                        page : 1+(start/number),
                        size : number,
                        sort : predicate,
                        reverse : reverse,
                        search : search
                    },
                    function(pageable) {

                        if(pageable.content.length == 0){
                            $scope.isNotFound = true;
                        }
                        $scope.items = pageable.content;
                        tableState.pagination.numberOfPages = pageable.totalPages;
                        $scope.isLoading = false;
                        

                    },function(error){

                        $scope.isServerError = true;
                        $scope.isLoading = false;
                        $scope.serverMessage = error.status+' '+error.statusText;

                    });



                /* Работа с классами активных фильтров */
                // Получаю классы активных фильтров
                var inputs = document.querySelectorAll(".smart-table-filers input, .st-sort-ascent, .st-sort-descent");
                var selectorsArr = [];
                
                inputs.forEach(function(item) {
                    item = angular.element(item);
                    if (item.val() || item.hasClass('st-sort-ascent') || item.hasClass('st-sort-descent')) {
                        var attrClass = item.attr('class-for-filer');
                        selectorsArr.push(attrClass);
                    }
                });


                // Добавляю стили к столбцам
                var style = angular.element(document.querySelector(filterStyleSelector));
                var str = '.smart-table .' + selectorsArr.join(',.smart-table .') + '{ color: #428bca !important}';
                str = str + '.smart-table .' + selectorsArr.join(' input, .smart-table .') + ' input{ color: #428bca !important}';
                style.text(str);

            };


            /* Сброс фильтров */
            $scope.refreshFilter = function(){

                // Сброс фильтров диапазона
                angular.element(document.querySelectorAll(".number-range input, .date-range input")).val(null);
                // Сброс цвета активных столбцов
                angular.element(document.querySelector(filterStyleSelector)).text('');

                $scope.isNotFound = false;
                $scope.isLoading = true;
                $scope.isServerError = false;
                $scope.serverMessage = '';

                /* Запрос на сервер */
                Resource.get({},
                    function(pageable) {
                        $scope.items = pageable.content;
                        tableStateRef.pagination.numberOfPages = pageable.totalPages;
                        $scope.isLoading = false;
                    },function(error){

                        $scope.isServerError = true;
                        $scope.isLoading = false;
                        $scope.serverMessage = error.status+' '+error.statusText;

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