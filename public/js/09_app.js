(function () {
	// 1. Definieer de module/app in dit bestand en voeg dependencies toe
	angular.module('myApp', ['ngRoute', 'nvd3']);

	// 2. Routes configureren
	angular.module('myApp')
		.config(['$routeProvider', function ($routeProvider) {
			console.log('Router');
			$routeProvider
				.when('/', {
					templateUrl: 'views/status.html', // Default view
					controller: 'statusController'
				})
				.when('/nodes', {
					templateUrl: 'views/09_view01.html',
					controller: 'personController'
				})
				.when('/detail/:id/:name?', {
					templateUrl: 'views/09_viewDetail.html',
					controller: 'detailController',
					controllerAs: 'd'
				})
				.when('/steden', {
					templateUrl: 'views/09_view02.html',
					controller: 'citiesController',
					controllerAs: 'c'
				})
				.when('/energy', {
					templateUrl: 'views/energy_view.html',
					controller: 'energyController',
					controllerAs: 'e'
				})
				.when('/404', {
					templateUrl: 'views/404.html'
				})
				.otherwise({ redirectTo: '/404' });
		}]).config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
		}]);
})();
