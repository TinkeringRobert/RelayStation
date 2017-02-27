(function () {
	'use strict';

	// Deze constant wordt als ROUTES geinjecteerd in zowel de
	// angular.module().config()-functie, als in de menuController.
	// Op die manier hoef je maar op 1 plek routes en -namen aan te passen
	// als je andere routes wilt, of je routing table wilt uitbreiden.
	angular.module('myApp')
		.constant('ROUTES', {
			root   : '/',
			namen  : '/persoonsnamen',
			steden : '/steden',
			energy : '/energy'
		})

})();
