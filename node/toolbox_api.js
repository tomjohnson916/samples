'user strict';
var passport = require('passport')
  , path = require('path')
  , config = require('../src/config')
  , pass_local = require('./pass-local')
  , User = require('../models/user').User
  , Profile = require('../models/profile').Profile
  , Audio = require('../models/audio').Audio
  , Video = require('../models/video').Video
  , Image = require('../models/image').Image
  , AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: config.aws_credentials.key,
  secretAccessKey: config.aws_credentials.secret
});

var header_information = {
  list: {
    title: 'Media Library',
    sub_title: 'View Your Content'
  },
  upload: {
    title: 'Media Library',
    sub_title: 'Upload/ Sync Content'
  }
}

module.exports = function(app) {
  app.get(['/toolbox/library', '/toolbox/library/'], function (req, res) {
    res.redirect('/toolbox/library/upload');
  });

  app.get('/toolbox/library/:view', function (req, res) {
    var params = {
      Bucket: config.aws.static_bucket,
      Prefix: path.join('users', req.user.id.toString(), 'images')
    };

    var locals = {
      title: 'Mixxture: library',
      user: req.user,
      user_id: (req.user) ? req.user.id : null,
      static_host: config.services.static.url,
      header: header_information[req.params.view],
      category: 'library',
      view: 'toolbox/library/' + req.params.view + '.html',
      view_name: req.params.view
    }

    Image.find({user_id: req.user.id}, function(err,data) {
      console.log('got images', data.length);
      req.user.images = data.reverse();
      for(var i = 0; i < req.user.images.length; i++){
        req.user.images[i].display_name = (req.user.images[i].settings.title) ? req.user.images[i].settings.title.substr(0,24): req.user.images[i].name.substr(0,24);
      }
      Video.find({user_id: req.user.id}, function(err,data) {
        req.user.videos = data;
        Audio.find({user_id: req.user.id}, function(err,data) {
          req.user.audio = data;
          res.render('toolbox', locals);
        });
      });
    });
  });

  app.post('/toolbox/library/upload', function (req,res) {
    console.log('Upload Files to Library');

    var folderLocation;

    if(req.body.mimetype.search('image') != -1) {
      folderLocation = 'images';
    } else if (req.body.mimetype.search('audio') != -1) {
      folderLocation = 'audio';
    } else if (req.body.mimetype.search('video') != -1) {
      folderLocation = 'video'
    } else {
      folderLocation = 'unknown'
    }

    var params = {
      Bucket: config.aws.static_bucket,
      Key: path.join('users', req.user.id.toString(), folderLocation, req.body.filename.toString()),
      CopySource: path.join(config.aws.upload_bucket, req.body.key)
    };

    var s3 = new AWS.S3();
    s3.copyObject(params, function (err, data) {
      if (err) {
        res.send(500, err.message);
      }

      if (data) {
        switch(folderLocation)
        {
          case 'images':
            Image.register({
              user_id: req.user.id,
              name: req.body.filename,
              key: path.join(params.Bucket, params.Key),
              mimetype: req.body.mimetype,
              size: req.body.size,
              url: "//" + path.join(params.Bucket, params.Key),
              isWritable: req.body.isWritable
            }, function (err, image) {
              var deleteS3 = new AWS.S3();
              deleteS3.deleteObject({Bucket: config.aws.upload_bucket, Key: req.body.key}, function (err, data) {
                if (err) {
                  console.log('There was an Error deleting the original object:', path.join(config.aws.upload_bucket, req.body.key))
                } else {
                  console.log('original deleted', data);
                }
              })
              res.send(200, path.join(params.Bucket, params.Key));
            })
            break;

          case 'audio':
            Audio.register({
              user_id: req.user.id,
              name: req.body.filename,
              key: path.join(params.Bucket, params.Key),
              mimetype: req.body.mimetype,
              size: req.body.size,
              url: "//" + path.join(params.Bucket, params.Key),
              isWritable: req.body.isWritable
            }, function (err, image) {
              var deleteS3 = new AWS.S3();
              deleteS3.deleteObject({Bucket: config.aws.upload_bucket, Key: req.body.key}, function (err, data) {
                if (err) {
                  console.log('There was an Error deleting the original object:', path.join(config.aws.upload_bucket, req.body.key))
                } else {
                  console.log('original deleted', data);
                }
              })
              res.send(200, path.join(params.Bucket, params.Key));
            })
            break;

          case 'video':
            Video.register({
              user_id: req.user.id,
              name: req.body.filename,
              key: path.join(params.Bucket, params.Key),
              mimetype: req.body.mimetype,
              size: req.body.size,
              url: "//" + path.join(params.Bucket, params.Key),
              isWritable: req.body.isWritable
            }, function (err, image) {
              var deleteS3 = new AWS.S3();
              deleteS3.deleteObject({Bucket: config.aws.upload_bucket, Key: req.body.key}, function (err, data) {
                if (err) {
                  console.log('There was an Error deleting the original object:', path.join(config.aws.upload_bucket, req.body.key))
                } else {
                  console.log('original deleted', data);
                }
              })
              res.send(200, path.join(params.Bucket, params.Key));
            })
            break;

          case 'unknown':
            console.log('Unknown Asset',path.join(params.Bucket, params.Key));
            break;
        }
      }
      res.send(200, path.join(params.Bucket, params.Key));
    });
  })



  app.delete('/toolbox/library/delete/:asset_type/:object_id', function (req,res,next) {
    console.log('delete AUTH double check');
    console.log('type:', req.params.asset_type, 'obj_id:', req.params.object_id);

    if( req.user )
    {


    }

    next();
  })

  app.delete('/toolbox/library/delete/:asset_type/:object_id', function(req, res) {
    console.log('you would like to destroy object', req.params.object_id);

    switch(req.params.asset_type)
    {
      case 'image':
        Image.findByIdAndRemove(req.params.object_id, function(err,data) {
          if(err) {
            console.log('there was an error removing object');
            return res.send(500);
          }

          if(data)
          {
            console.log('removed', data.key.substr(config.aws.static_bucket.length+1));
            var params = {
              Bucket: config.aws.static_bucket,
              Key: data.key.substr(config.aws.static_bucket.length+1)
            };

            var s3 = new AWS.S3();
            s3.deleteObject(params, function(err,data) {
              if(err) {
                console.log('there was an error removing object from s3');
              }
              if(data) {
                console.log('removed data from s3', data);
              }
            });
          }
        })
        break;

      case 'audio':
        Audio.findByIdAndRemove(req.params.object_id, function(err,data) {
          if(err) {
            console.log('there was an error removing object');
            return res.send(500);
          }

          if(data)
          {
            console.log('removed', data.key.substr(config.aws.static_bucket.length+1));
            var params = {
              Bucket: config.aws.static_bucket,
              Key: data.key.substr(config.aws.static_bucket.length+1)
            };

            var s3 = new AWS.S3();
            s3.deleteObject(params, function(err,data) {
              if(err) {
                console.log('there was an error removing object from s3');
              }
              if(data) {
                console.log('removed data from s3', data);
              }
            });
          }
        })
        break;
    }



    res.send(200);
  })

  app.put('/toolbox/library/:type/:id/update/', function(req,res) {
    console.log('you are trying to update', req.params.type, req.params.id);
    switch(req.params.type){
      case 'image':
        Image.findByIdAndUpdate(req.params.id, req.body, function(err,data) {
          if(err) {
            console.log('there was an error updating object');
            //return res.send(500);
          }
          if(data)
          {
            console.log('success update', data);
          }
        })
        break;

      case 'audio':
        Audio.findByIdAndUpdate(req.params.id, req.body, function(err,data) {
          if(err) {
            console.log('there was an error updating object');
            //return res.send(500);
          }
          if(data)
          {
            console.log('success update', data);
          }
        })
        break;
    }
    res.send(200);
  })
}