(function () {
	// 1. Maak een JavaScript-variabele en Angular-module op basis van de HTML-directive
	// 2. Voeg een controller toe aan de de module.

	angular.module('myApp')
			.controller('citiesController',  citiesController);

	function citiesController ($http) {
		var vm = this;
		console.log('Get city');
		$http.get('/nodes')
			.success(function(data){
				console.log(data);
				vm.nodes = data;
			})
			.error(function(data) {
        console.log('Error: ' + data);
      });

		$http.get('/energymeterdata')
			.success(function(data){
				console.log(data);
				vm.powers = data;
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
		// $http.get('/meterdata')
		// 	.success(function(data){
		// 		console.log(data);
		// 		vm.powers = data;
		// 	})
		// 	.error(function(data) {
		// 		console.log('Error: ' + data);
		// 	});
		vm.cities = [
			{ 'name': 'New York', 'country': 'USA' },
			{ 'name': 'Los Angeles', 'country': 'USA' },
			{ 'name': 'Las Vegas', 'country': 'USA' },
			{ 'name': 'Amsterdam', 'country': 'NL' },
			{ 'name': 'Berlin', 'country': 'GER' },
			{ 'name': 'Rome', 'country': 'IT' },
			{ 'name': 'Paris', 'country': 'FR' },
			{ 'name': 'London', 'country': 'GB' },
			{ 'name': 'Liverpool', 'country': 'GB' },
			{ 'name': 'Madrid', 'country': 'SP' }
		];
	};

})();
