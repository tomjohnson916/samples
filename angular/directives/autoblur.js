/* Blur to the next input field when maxlength is reached
 ---------------------------------------------------------------------- */
angular.module('mixxtureApp')
  .directive('autoBlur', function(){
  return {
    restrict: 'A',
    link: function(scope, elem, attrs){
      elem.bind('keyup', function(e){
        if( parseInt(attrs.maxlength) === elem.val().length ){
          elem.blur();
          angular.element('input[name="'+attrs.autoBlur+'"]').focus();
        }
      });
    }
  };
});