/* Watch broadcasts collection for errors, duplications
 ---------------------------------------------------------------------- */
angular.module('mixxtureApp')
  .directive("errorCheck", function($timeout) {
  return {
    restrict: "A",
    link: function(scope, elem, attrs){
      scope.$watchCollection('broadcasts', function(n,o){
        if( n.error || n.success ){
          $timeout(function(){
            scope.messages = {};
          }, 2000);
        }
      });
    }
  };
});