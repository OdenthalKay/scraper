'use strict';

/* Controllers */

angular.module('myApp.controller', []).controller('myCtrl', function($scope, $http) {

    $http.get('/api/books').success(function(data, status, headers, config) {
        // Warum ist das Datenobjekt ein Array??
        $scope.books = data[0];
    }).error(function(data, status, headers, config) {
        alert(status);
    });
});