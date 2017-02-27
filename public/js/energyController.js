(function () {
	// Best Practice: eerst module definieren, minify-safe $routeParams injecteren
	angular.module('myApp')
		.controller('energyController', energyController);

	// 2. Maak de detailcontroller
	//energyController.$inject = ['$routeParams'];
	function energyController ($scope, $http, $route, $filter, $interval) {
		var vm = this;
    vm.stop;
		console.log('Get Da Power');

		vm.options = {
				chart: {
					type: 'lineChart',
					height: 450,
					margin : {
							top: 20,
							right: 20,
							bottom: 40,
							left: 55
					},
					x: function(d){ return d.x; },
					y: function(d){ return d.y; },
					useInteractiveGuideline: true,
					dispatch: {
							stateChange: function(e){ console.log("stateChange"); },
							changeState: function(e){ console.log("changeState"); },
							tooltipShow: function(e){ console.log("tooltipShow"); },
							tooltipHide: function(e){ console.log("tooltipHide"); }
					},
					xAxis: {
							axisLabel: 'Time (ms)',
							tickFormat: function(d) { return d3.time.format('%m-%d :: %H:%M')(new Date(d));}
					},
					yAxis: {
							axisLabel: 'Voltage (v)',
							tickFormat: function(d){
									return d3.format('.02f')(d);
							},
							axisLabelDistance: -10
					},
					callback: function(chart){
							console.log("!!! lineChart callback !!!");
					},
			},
			title: {
					enable: true,
					text: 'Title for Line Chart'
			}
		};
		vm.data = [];

		vm.amounts = [10, 25, 50, 100, 200, 500, 1000];
		vm.selectedItem = 10;

		// Initialise data for the table
		getMeterData($http, vm.selectedItem, function(data){
			vm.powers = data;

			parseChartData(vm, $filter);
			console.log(vm.data);
		});

    vm.fight = function() {
			console.log('initialize interval');
			if ( angular.isDefined(vm.stop) ) return;

			vm.stop = $interval(function() {
				getMeterActual($http, function(data){
					console.log('int: actual power');
					console.log(data);
					parseActualData(vm, data);
				});
	    }, 30000);
		};

		// Initialise data for the table
		getMeterActual($http, function(data){
			console.log('actual power');
			console.log(data);
			parseActualData(vm, data);
			vm.fight();
		});

	  vm.selectionChanged = function(selected) {
		   console.log('Value ' + selected + ' selected');
			 vm.selectedItem = selected;

			 getMeterData($http, vm.selectedItem, function(data){
				 vm.powers = [];
				 vm.powers = data;
				 parseChartData(vm, $filter);
				 console.log(vm.powers);
			 });
			 console.log('Should have reloaded by now');
		}

		vm.stopFight = function() {
			console.log('try to kill interval');
			if (angular.isDefined(vm.stop)) {

				console.log('kill interval');
				$interval.cancel(vm.stop);
				vm.stop = undefined;
			}
		};

		$scope.$on("$destroy", function(){
			console.log('kill interval');
			// Make sure that the interval is destroyed too
			vm.stopFight();
    });
	}
})();

function parseActualData(vm, data){
	vm.actual = {};
	vm.actual.available = true;
	vm.actual.kwh_meter = data[0].kwh_meter;
	console.log('vm.actual.kwh_meter ' + vm.actual.kwh_meter)
	vm.actual.hh_meter = data[0].hh_meter;
	console.log('vm.actual.hh_meter ' + vm.actual.hh_meter)
	vm.actual.pv_meter = data[0].pv_meter;
	console.log('vm.actual.pv_meter ' + vm.actual.pv_meter)
};

function parseChartData(vm, $filter){
	vm.data = [];

	var line_kwh = {};
	line_kwh.key = "Energy Meter";
	line_kwh.strokeWidth = 2;
	//line_kwh.classed = "dashed";
	line_kwh.color = "#ff0000";
	line_kwh.values = [];
	//line_kwh.values.push({x:0,y:0});
	for (i in vm.powers) {
		var element = {};
		element.x = vm.powers[i].utc;
		element.y = -vm.powers[i].kwh_meter;
		line_kwh.values.push(element);
	}
	//line_kwh.values.push({x:num,y:0});
	vm.data.push(line_kwh);


	var line_hh = {};
	line_hh.key = "Household Meter";
	line_hh.strokeWidth = 2;
	//line_hh.classed = "dashed";
	line_hh.color = "#00ff00";
	line_hh.values = [];
	//line_hh.values.push({x:0,y:0});
	for (i in vm.powers) {
		var element = {};
		//console.log(vm.powers[i].timestamp);
		element.x = vm.powers[i].utc;
		element.y = vm.powers[i].hh_meter;
		line_hh.values.push(element);
	}
	//line_hh.values.push({x:num,y:0});
	vm.data.push(line_hh);


	var line_pv = {};
	line_pv.key = "Photovoltaic Meter";
	line_pv.strokeWidth = 2;
	line_pv.color = "#0000ff";
	line_pv.values = [];
	for (i in vm.powers) {
		var element = {};
		//console.log($filter('date')(vm.powers[i].timestamp, 'HH:mm:ss'));
		element.x = vm.powers[i].utc;
		element.y = -vm.powers[i].pv_meter;
		line_pv.values.push(element);
	}
	vm.data.push(line_pv);

	vm.api.refresh();
};

function getMeterData($http, amount, callback){
	console.log('getMeterData amount ' + amount);
	$http.get('/energymeterdata/' + amount)
		.success(function(data){
			return callback(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
			return callback(null);
		});
}

function getMeterActual($http, callback){
	console.log('getMeterActual');
	$http.get('/energymeterdata/actual')
		.success(function(data){
			return callback(data);
		})
		.error(function(data) {
			console.log('Error: ' + data);
			return callback(null);
		});
}
