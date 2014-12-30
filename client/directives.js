
angular.module('myApp').directive('genreTable', function() {
  return {
    restrict: 'E',
    replace: 'true',
    scope: {
      genre: '@',
      books: '=' 
    },
    templateUrl: 'genre-table.html'
  };
});