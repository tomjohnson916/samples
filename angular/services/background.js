'use strict';

angular.module('mixxtureApp.services')
  .factory('BackgroundService', function ($state, $rootScope, urls) {
    console.log('Background Service');

    var videoItems, posters, BV, player;

    videoItems = urls.backgroundVideos;
    posters = urls.backgrounds;

    BV = new $.BigVideo();
    BV.remove();
    BV.init();

    player = videojs.players['big-video-vid'];

    // Event Handlers
    // Determine background on state change
    $rootScope.$on('$stateChangeSuccess', function(event,to,toParams,from) {
      console.log('background change complete', from.name, to.name);
      switch(to.name) {
        case 'index.main':
          BV.show(posters[0], {ambient: true});
          player.removeClass('hidden');
          break;

        case 'broadcast':
          player.pause();
          player.addClass('hidden');
          break;

        case 'index.welcome':
        case 'login':
          BV.showPlaylist(videoItems, {ambient: true});
          player.removeClass('hidden');
          break;

        default:
          break;
      }
    });

    // Private API
    var $loadBackgroundItems = function(items) {
      BV.showPlaylist(items || videoItems, {ambient:true});
    };

    var $showBackground = function() {
      console.log('show');
      player.removeClass('hidden');
    };

    var $hideBackground = function() {
      console.log('hide');
      player.addClass('hidden');
    };

    // Public API
    return {
      loadBackgroundItems: function(items) {
        $loadBackgroundItems(items);
      },
      showBackground: function() {
        $showBackground();
      },
      hideBackground: function() {
        $hideBackground();
      },
      player: function() {
        return player;
      }
    };
  });
