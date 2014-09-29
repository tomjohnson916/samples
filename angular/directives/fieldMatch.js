/* Match the values of two fields
 ---------------------------------------------------------------------- */
angular.module('mixxtureApp')
  .directive('fieldMatch', function(){
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl){
      var match = angular.element('input[name="'+attrs.fieldMatch+'"]');
      elem.add(match).bind('keyup', function(){
        scope.$apply(function(){
          var isSame = elem.val() === match.val();
          ctrl.$setValidity('mismatch', isSame);
        });
      });
    }
  };
});