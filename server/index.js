require('dotenv').config();

const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const YoutubeChannel = require('./YoutubeChannel');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const PORT = process.env.PORT;
const CORS_WHITELIST = process.env.CORS_WHITELIST.split(',');


const corsOptions = {
  origin: function (origin, callback) {
    if (CORS_WHITELIST.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback('Not allowed by CORS');
    }
  }
}

const app = express();
app.use(cors(corsOptions));

app.get('/videos/:channel_id(*)', async (req, res)=>{
    
    try{
        
        if( !req.params.channel_id ){

            res.status(400).send({error: 'Missing required query param: "channel_id"'});
            return;
        }
        
        const channel_id = decodeURIComponent(req.params.channel_id);
        const yt_channel = new YoutubeChannel(channel_id);
        
        res.set('Cache-Control', `max-age=${process.env.CACHE_TIME_SECONDS}`);

     
        let i = 0;

        await yt_channel.fetchVideos(()=>{

            res.write(JSON.stringify({order: 'reverse'})+'\n');

        }, (vid_meta)=>{
            
            res.write(JSON.stringify(vid_meta)+'\n');
        });
        
        res.end();

    }catch(err){

        console.error(err);
        res.status(400).send({error: 'Error fetching videos. Make sure that the channel link you provided is correct.'});
    }
});

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`)
});