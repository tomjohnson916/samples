'use strict';

angular.module('mixxtureApp.services', ['ngCookies'])
  .factory('SessionService', function ($window, $rootScope, $log) {

    var COOKIE_NAME = 'xx';

    var sessionStorage = angular.fromJson($window.sessionStorage.getItem(COOKIE_NAME));
    var previousUserId = sessionStorage ? sessionStorage.uid : null;
    var isNewSession = !sessionStorage;
    var isNewUser = !previousUserId;
    var newStartTime = new Date().getTime();
    var defaultSession = { name: COOKIE_NAME, sessionId: 'sha256code', startTime: newStartTime, uid: previousUserId };

    $window.document.cookie = JSON.stringify(defaultSession);

    // API
    var updateSession = function(data) {
      $window.sessionStorage.setItem(COOKIE_NAME, angular.toJson(data));
      return $window.sessionStorage.getItem(COOKIE_NAME);
    };
    var removeSession = function() {
      $window.sessionStorage.removeItem(COOKIE_NAME);
    };
    //

    // Event Handling
    // On User Login, save the user id: uid
    $rootScope.$on('user:loginSuccess', function(event, user) {
      $log.log('received login success, update user id');
      $log.log('user', user.id, user);
      if(user.id) {
        var currentSession = angular.fromJson($window.sessionStorage.getItem(COOKIE_NAME));
        currentSession.uid = user.id;
        updateSession(currentSession);
      }
    });
    // On User Logout, clear the user id
    $rootScope.$on('user:logoutSuccess', function() {
      var currentSession = angular.fromJson($window.sessionStorage.getItem(COOKIE_NAME));
      currentSession.uid = null;
      updateSession(currentSession);
    });
    //

    // Session Init
    // Rules
    if($window.sessionStorage.getItem(COOKIE_NAME)) {
      var currentSession = angular.fromJson($window.sessionStorage.getItem(COOKIE_NAME));
      currentSession.startTime = newStartTime;
      updateSession(currentSession);
    } else {
      updateSession(defaultSession);
    }
    // Notify App of Session Start
    $rootScope.$broadcast('session:start', defaultSession);
    //

    // Public API here
    return {
      session: function(){
        return angular.fromJson($window.sessionStorage.getItem(COOKIE_NAME));
      },
      removeSession: function(){
        removeSession();
      },
      isNewSession: function(){
        return isNewSession;
      },
      isNewUser: function(){
        return isNewUser;
      }
    };
  });
