angular.module('mixxtureApp')
  .controller('CartCtrl', function(
  $scope,
  CartService
  ){

  $scope.items = CartService.items;

  $scope.code = CartService.code;

  $scope.remove = function(index){
    CartService.remove(index);
  };

  $scope.$watch(function(){
    return CartService.items;
  }, function(n,o){
    CartService.calculate_total();
    $scope.items = CartService.items;
  });

  $scope.applyCode = function(valid){
    if( valid ){
      CartService.checkCode($scope.code.input)
        .then(function(res){
          $scope.code.input = '';
          $scope.code.applied = res.data;
          $scope.code.error = false;
          CartService.calculate_total();
        })
        .catch(function(err){
          $scope.code.applied = '';
          $scope.code.error = true;
        });
    }
  };

  $scope.removeCode = function(){
    $scope.code.input = '';
    $scope.code.applied = '';
    $scope.code.error = false;
    CartService.removeCode();
    CartService.calculate_total();
  };

  $scope.$watch('code.input', function(n,o){
    if( !n ){ $scope.code.error = false; }
  });

  $scope.checkout = function(){
    window.location.href = '/checkout/';
  };

});