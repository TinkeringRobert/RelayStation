(function () {
	'use strict';

	angular.module('myApp')
		.controller('menuController', menuController);

	// De routes worden hier uit een Constant gehaald voor eenduidige naamgeving.
	// In de homepage (09_ng_route_constants.html) worden de routes gebonden.
	menuController.$inject = ['ROUTES'];
	function menuController(ROUTES) {
		var vm         = this;
		vm.routeNamen  = ROUTES.namen;
		vm.routeSteden = ROUTES.steden;
	}

})();