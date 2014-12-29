'use strict';

/* Controllers */

angular.module('myApp.controller', []).controller('myCtrl', function($scope, $http) {

    $http.get('/api/books').success(function(data, status, headers, config) {
        $scope.books = data;
    }).error(function(data, status, headers, config) {
        alert(status);
    });
});