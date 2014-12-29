'use strict';

/* Controllers */

angular.module('myApp.controller', []).
  controller('myCtrl', function($scope) {
    
    $scope.books = ["a","b","c"];
    $scope.x = "das ist x";
    
    
  });