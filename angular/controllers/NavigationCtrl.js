angular.module('mixxtureApp')
  .controller('NavigationCtrl', function ($scope, $log, $state, UserService) {
    $scope.userLoggedIn = UserService.loggedIn();
    $scope.showNavigation = false;
    $scope.position = 'top';
    $scope.currentUser = UserService.currentUser();

    // API
    $scope.home = function() {
      $state.go('index.main');
    };

    $scope.broadcast = function() {
      $log.log('broadcast now baby');
      $state.go('broadcast');
    };

    $scope.search = function() {
      $log.log('search now');
      $state.go('search');
    };

    $scope.login = function() {
      $state.go('login');
    };

    $scope.logout = function() {
      UserService.logout();
    };

    // Event Handling
    $scope.$on('$firebaseSimpleLogin:login', function() {
      $scope.userLoggedIn = UserService.loggedIn();
      $scope.currentUser = UserService.currentUser();
      console.log('here', UserService.currentUser().displayName);
    });

    $scope.$on('$firebaseSimpleLogin:logout', function() {
      $scope.userLoggedIn = UserService.loggedIn();
      $scope.currentUser = UserService.currentUser();
    });

    $scope.$on('$stateChangeSuccess', function(event, to) {
      switch (to.name) {
        case 'index.main':
          $scope.showNavigation = true;
          $scope.position = 'top';
          break;

        case 'broadcast':
          $scope.showNavigation = true;
          $scope.position = 'bottom';
          break;

        default:
          $scope.showNavigation = false;
          $scope.position = 'top';
          break;
      }
    });

  });