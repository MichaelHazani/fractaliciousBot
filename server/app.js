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
var Browser = require('zombie');

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
    // res.sendFile(__dirname + '/public/index.html')
    // res.write("all systems nominal!");
});

//actual tweetBot logic (from static images)
var counter = 0;
setInterval(function () {
    var now = moment().tz('America/Los_Angeles').format('dddd[,] MMMM Do[,] YYYY');

    var b64content = fs.readFileSync(__dirname + '/shots/flower' + counter + '.png', { encoding: 'base64' })

    T.post('media/upload', { media: b64content }, function (err, data, response) {
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
    //raise counter
    counter < 356 ? counter++ : counter = 0;

}, 86400);

//post image to twitter
// app.post('/postImage', function (req, res) {
//     console.log('received img data');

//     var now = moment().tz('America/Los_Angeles').format('dddd[,] MMMM Do[,] YYYY');

//load live data
// var base64Data = atob(req.body['imageBase64']);
// var edited64 = base64Data.replace(/^data:image\/\w+;base64,/, "");

// alternatively, load png
//     var b64content = fs.readFileSync('./1.png', { encoding: 'base64' })

//     T.post('media/upload', { media: b64content }, function (err, data, response) {
//         var mediaIdStr = data.media_id_string;
//         var altText = "Another photo by fractalicio.us bot!"
//         var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

//         T.post('media/metadata/create', meta_params, function (err, data, response) {
//             if (!err) {
//                 var params = { status: now, media_ids: [mediaIdStr] }
//                 T.post('statuses/update', params, function (err, data, response) {
//                 })
//             }
//         })
//         console.log("error: " + err);
//         console.log("data: " + data);
//         console.log("response: ");
//         console.log(response);
//     })
//     res.send("done");
// });

//save directly from front end call (for helper)
// var counter = 0;

// app.post('/saveImage', function (req, res) {
//     console.log('received data to save');
//     var base64Data = atob(req.body['imageBase64']);
//     var edited64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
//     require("fs").writeFile(__dirname + "/shots/flower" + counter + ".png", edited64, 'base64', { flag: 'w' }, function (err) {
//         console.log(err);
//     });
//     counter++;
// })

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
