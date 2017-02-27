(function () {
    angular.module('myApp').controller('statusController', statusController);

    // 2. Maak de eerste controller
    //statusController.$inject = ['$scope'];
    function statusController($http, $scope, $interval) {
      $scope.modules = [];
      console.log('statusController is used');

      getAllModules($http, $scope);

      $interval(function() {
        getAllModules($http, $scope);
      }, 30*1000);
    }
})();

function getAllModules($http, $scope) {
  $http.get('/status/infra/allModules')
    .success(function(data){
      console.log('Modules are');
      console.log(data);
      $scope.modules = data;
      //return callback(data);
    })
    .error(function(data) {
      console.log('Error: ' + data);
      //return callback(null);
    });
};
