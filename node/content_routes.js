var passport = require('passport')
  , fs = require('fs')
  , config = require('../src/config')
  , pass_local = require('./pass-local')
  , User = require('../models/user').User
  , Image = require('../models/image').Image
  , Audio = require('../models/audio').Audio
  , Video = require('../models/video').Video
  , Profile = require('../models/profile').Profile
  , featured = require('../data/reservations')
  , facebook = require('../data/facebook');

module.exports = function(app) {

  // Home Page / ROOT Route
  app.get('/', function(req, res) {
    console.log('here', req.user);
    console.log('facebook items', facebook.data.length);
    Profile.find(function(err,data){
      res.render('home', { title: "Mixxture", user_id: (req.user) ? req.user.id : null, static_host: config.services.static.url, featured: featured.slice(featured.length-12, featured.length).reverse(), profiles: data, facebook_data: facebook.data });
    })
  });

  // find by slug
  app.get('/:slug', function(req, res) {
    console.log('find by slug', req.params.slug);

    Profile.findOne({slug: req.params.slug}, function(err, profile) {
      if( err ) return res.send(500);

      if(!profile) return res.send(404, "Sorry that is not a known user profile");

      if(profile) {
        Image.find({user_id: profile.user_id}, function(err,data) {
          profile.images = data.reverse();
          Audio.find({user_id: profile.user_id}, function(err,audio_data) {
            profile.audio = audio_data.reverse();
            Video.find({user_id: profile.user_id}, function(err,video_data) {
              profile.videos = video_data.reverse();

              if(profile.videos && profile.videos.length > 0)
              {
                profile.featured_video = profile.videos[profile.videos.length-1];
              }

              var locals = {
                title: 'Mixxture',
                profile: profile,
                profile_id: profile.id,
                user_id: (req.user) ? req.user.id : null,
                static_host: config.services.static.url
              };
              res.render('profile', locals);
            });

          })
        })
      } else {
        res.send(404, "Unknown User Profile");
      }
    })
  });
};