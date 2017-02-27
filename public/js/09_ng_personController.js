(function () {
    angular.module('myApp')
        .controller('personController', personController);

    // 2. Maak de eerste controller
    personController.$inject = ['$scope'];
    function personController($scope) {
        $scope.persons = [
            {id: 0, 'name': 'John'},
            {id: 1, 'name': 'Bob'},
            {id: 2, 'name': 'Bart'},
            {id: 3, 'name': 'Sandra'},
            {id: 4, 'name': 'Harry'},
            {id: 5, 'name': 'Peter'},
            {id: 6, 'name': 'Michiel'},
            {id: 7, 'name': 'Jeroen'},
            {id: 8, 'name': 'Irene'},
            {id: 9, 'name': 'Mike'}];
    }

})();
