
angular.module('myApp').directive('genreTable', function() {
  return {
    restrict: 'E',
    replace: 'true',
    scope: {
      books: '=' 
    },
    templateUrl: 'genre-table.html'
  };
});