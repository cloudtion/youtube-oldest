const functions = require("firebase-functions");
const admin = require('firebase-admin');
const YoutubeChannel = require('./YoutubeChannel');

admin.initializeApp();

async function GetChannelVideos(channel_id, vidMetaCallback){

    let videos = [];

    try{
    
        videos = await (new YoutubeChannel(channel_id)).fetchVideos(vidMetaCallback);
    
    }catch(e){
        //console.error(e);
    }
        
    return videos;
}

function getChannel(channel_ref){

    return new Promise((resolve, error)=>{
        
        channel_ref.on('value', snapshot => resolve(snapshot.val()), error); 
    });
}

exports.getVideos = functions.https.onRequest(async (req, res) => {

    res.set('Access-Control-Allow-Origin', 'http://127.0.0.1:5000'); //'https://youtubeoldesttonewest.com');

    const root = admin.database().ref();

    try{
        
        if( !req.query.channel_id ){

            res.status(400).send({error: 'Missing required query param: "channel_id"'});
            return;
        }
        
        const channel_id = decodeURIComponent(req.query.channel_id);
        const channel_ref = root.child(`/channels/${channel_id}`);

        const five_days_ago = (new Date()).getTime() - (60 * 1000 * 60 * 24);
    
        const channel = await getChannel(channel_ref);

        if( channel && channel.videos_last_updated > five_days_ago ){
            
            res.set('Cache-Control', 'max-age=432000');
            
            channel.videos.forEach(vid_meta=>{

                res.write(JSON.stringify(vid_meta)+'\n');
            })

            res.end();
            return;
        }
        
        res.write(JSON.stringify({order: 'reverse'})+'\n');

        const fetched_videos = await GetChannelVideos(channel_id, (vid_meta)=>{

            res.write(JSON.stringify(vid_meta)+'\n');
        });
        
        res.end();

        await channel_ref.set({
            videos_last_updated: (new Date()).getTime(),
            videos: fetched_videos
        });

        

    }catch(err){

        console.error(err);
        res.status(400).send({error: 'Error fetching videos. Make sure that the channel link you provided is correct.'});
    }

});