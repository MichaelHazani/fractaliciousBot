var express = require('express')
var app = express();
var moment = require('moment-timezone');
var bodyParser = require('body-parser');
var base64Img = require('base64-img');
var http = require('http');
var atob = require('atob');
var Twit = require('twit');
var creds = require('./ignore/creds.js');
var fs = require('fs');


var T = new Twit({
    consumer_key: creds.consumer_key,
    consumer_secret: creds.consumer_secret,
    access_token: creds.access_token_key,
    access_token_secret: creds.access_token_secret
});
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(__dirname + '/public'));

//get main page
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html')
});

//post image to twitter
app.post('/postImage', function (req, res) {
    console.log('received img data');

    var now = moment().tz('America/Los_Angeles').format('dddd[,] MMMM Do[,] YYYY');
    var base64Data = atob(req.body['imageBase64']);
    var edited64 = base64Data.replace(/^data:image\/\w+;base64,/, "");

    // alternatively, load png for testing
    // var b64content = fs.readFileSync('./1.png', { encoding: 'base64' })

    T.post('media/upload', { media: edited64 }, function (err, data, response) {
        var mediaIdStr = data.media_id_string;
        var altText = "Another photo by fractalicio.us bot!"
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

        T.post('media/metadata/create', meta_params, function (err, data, response) {
            if (!err) {
                var params = { status: now, media_ids: [mediaIdStr] }
                T.post('statuses/update', params, function (err, data, response) {
                })
            }
        })
        console.log("error: " + err);
        console.log("data: " + data);
        console.log("response: ");
        console.log(response);
    })
    res.send("done");
});


// test tweet
// app.get('/tweet', function (req, res) {
//     T.post('statuses/update', { status: 'hello world!' }, function (err, data, response) {
//         console.log(data)
//     });
// });

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});
