'use strict';

/**
 * @ngdoc overview
 * @name mixxtureApp
 * @description
 * # mixxtureApp
 *
 * Main module of the application.
 */
angular
  .module('mixxtureApp', [
    'firebase',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'ui.bootstrap',
    'mixxtureApp.services'
  ])
  .value('urls', {
    firebase: 'https://radiant-fire-2547.firebaseio.com/',
    broadcast: 'https://broadcast.mixxture.com/',
    backgroundVideos: [
      '/mp4/Sundance_DJ_002.mp4',
      '/mp4/Sundance_DJ_003.mp4',
      '/mp4/Sundance_DJ_004.mp4',
      '/mp4/Sundance_DJ_005.mp4'
    ],
    backgrounds: [
      'https://gp1.wac.edgecastcdn.net/806614/photos/photos.500px.net/76650049/52c3aee1f13bf547a3d8bede312766f1448cd31a/2048.jpg',
      'https://gp1.wac.edgecastcdn.net/806614/photos/photos.500px.net/61584605/97fd8f16f7ac378aeaf4cb176cea8017789c5225/2048.jpg',
      'https://gp1.wac.edgecastcdn.net/806614/photos/photos.500px.net/67449803/4fd6e23c2ddda2b44896bb01ab4447916c883bf3/2048.jpg'
    ]
  })
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $stateProvider
      .state('index', {
        url: '/',
        abstract: true,
        templateUrl: 'views/index.html'
      })
      .state('index.main', {
        url: '',
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .state('index.welcome', {
        url: '',
        templateUrl: 'views/welcome.html',
        controller: 'WelcomeCtrl'
      })
      .state('broadcast', {
        url: '/broadcast',
        templateUrl: 'views/broadcast/broadcastScreen.html',
        controller: 'BroadcastCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'views/login/login.html',
        controller: 'LoginCtrl'
      })
      .state('registered', {
        url: '/profile/',
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
      });

    $urlRouterProvider
      .otherwise('/');

    $locationProvider.html5Mode(true);
  })
  .run(function($rootScope, $state, $stateParams, $log, BackgroundService, SessionService,
                UserService) {

    var onFirstChangeStart = function (event, to, toParams, from) {
      if(to.name.indexOf('index') !== -1 && from.name.length === 0) {
        event.preventDefault();
        UserService.authClient.$getCurrentUser().then(function(user) {
          $rootScope.$$listeners.$stateChangeStart.shift();
          if(user) {
            console.log('started with a user');
            window.user = user;
            $state.go(to.name || 'index.main');
          } else {
            console.log('no user here');
            $state.go('index.welcome');
          }
        });
      }
    };

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$session = SessionService.session();
    $rootScope.$currentUser = UserService.currentUser();
    $rootScope.$on('$stateChangeStart', onFirstChangeStart);

    $log.log('session', SessionService.session());
    $log.log('newUser', SessionService.isNewUser());
    $log.log('newSession', SessionService.isNewSession());
  });
