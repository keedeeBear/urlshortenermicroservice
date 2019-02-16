var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var base58 = require('./base58.js');

l
var Url = require('./model/url');

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name, { useNewUrlParser: true });

//{ useNewUrlParser: true } to MongoClient.connect.

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'view/index.html'));
});
1
app.post('/api/shorten', function(req, res){
  var longUrl = req.body.url;
  var shortUrl = '';

  // looks for the url in the db
  Url.findOne({long_url: longUrl}, function (err, doc){
    if (doc){
      shortUrl = config.webhost + base58.encode(doc._id);

      // if url exists, no extra legwork is needed
      res.send({'shortUrl': shortUrl});
    } else {
      // if it doesn't, you make a new url for this new link
      var newUrl = Url({
        long_url: longUrl
      });

      // save the new link
      newUrl.save(function(err) {
        if (err){
          console.log(err);
        }

        shortUrl = config.webhost + base58.encode(newUrl._id);

        res.send({'shortUrl': shortUrl});
      });
    }

  });

});

app.get('/:encoded_id', function(req, res){

  var base58Id = req.params.encoded_id;

  var id = base58.decode(base58Id);

  Url.findOne({_id: id}, function (err, doc){
    if (doc) {
      res.redirect(doc.long_url);
    } else {
      res.redirect(config.webhost);
    }
  });

});

var server = app.listen(3000, function(){
  console.log('Server listening on port 3000');
});