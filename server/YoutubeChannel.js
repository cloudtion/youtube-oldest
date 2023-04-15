
const axios = require('axios');
const admin = require('firebase-admin');

class YoutubeChannel {

    constructor(channel_id){

        this.channel_id = channel_id;
        this.videos_url = `https://www.youtube.com/${channel_id}/videos`;

        this.videos = [];

        this.loaded_data = null;
        this.loaded = false;
    }
    
    dbChannelRef = ()=> admin.database().ref().child(`/channels/${this.channel_id}`);
    
    getChannelFromDB = ()=>{
    
        return new Promise((resolve, error)=>{
            
            if( this.loaded ){

                resolve(this.loaded_data);
                return;
            }
            
            this.dbChannelRef().on('value', snapshot =>{
            
                this.loaded = true;
                resolve(snapshot.val());
            
            }, error); 
        });
    }

    parseVideoFromRichItemRenderer = (richItemRenderer) => {

        try{

            const vr = richItemRenderer.content.videoRenderer;
            const {videoId} = vr;
            const title = vr.title.runs[0].text;
            const publishedTime = vr.publishedTimeText.simpleText || null;
            const description = vr.descriptionSnippet?.runs[0].text || null;
            const length = vr.lengthText.simpleText || null;
            const viewCount = vr.viewCountText.simpleText || null;
            const shortViewCount = vr.shortViewCountText.simpleText;
            const thumb = vr.thumbnail.thumbnails[vr.thumbnail.thumbnails.length-1];
        
            return {videoId, title, publishedTime, description, length, viewCount, shortViewCount, thumb};
            
        }catch(err){}

        return null;
    }

    
    fetchVideos = (onReversed, videosReceivedCallback) => {
        
        const five_days_ago = (new Date()).getTime() - (process.env.CACHE_TIME_SECONDS*1000);

        return new Promise( async (resolve, errorResolve)=>{

            try{ 
                
                const channel = await this.getChannelFromDB();

                if( channel && channel.videos_last_updated > five_days_ago ){
                    
                    channel.videos.forEach(vid_meta=>{
                        videosReceivedCallback(vid_meta);
                    });
                    // This channel's videos are cached in the database and already sorted oldest to newest.
                    return channel.videos;
                }

                // We call on reversed here to let the calling function know that the videos will be sorted newest to oldest.
                // This is because we have to scroll down the yt channel page to find the oldest videos.
                onReversed && onReversed();

                const {data} = await axios.get(this.videos_url);

                const api_key_match = data.match(/innertubeApiKey\"\:\"(.*?)\"/);
                const api_key = api_key_match[1];

                const match = data.match( /var ytInitialData \=(.*?);\<\/script/);
        
                const js_obj = match[1];
        
                const obj = JSON.parse(js_obj);
        
                const tabs = obj.contents.twoColumnBrowseResultsRenderer.tabs;
        
                const vid_tab = tabs.find(tab=> tab.tabRenderer.selected );
        
                const rgr = vid_tab.tabRenderer.content.richGridRenderer;
                
                const contents = rgr.contents.filter(c=> c.richItemRenderer != null);
                const last_c_i = rgr.contents.pop();

                contents.forEach(ci=>{
                    
                    try{

                        const vid_meta = this.parseVideoFromRichItemRenderer(ci.richItemRenderer);
                        
                        
                        if( vid_meta ){

                            if( videosReceivedCallback ){

                                videosReceivedCallback(vid_meta);
                            }
                            
                            this.videos.push(vid_meta);
                        }

                    }catch(err){

                        // Error parsing this video. This could be because it's a current livestream, upcoming video, etc.
                        // Ignore it.
                    }
                
                });
                
                try{
                    let continuation_token = last_c_i.continuationItemRenderer?.continuationEndpoint.continuationCommand.token;
            
                    while( continuation_token ){
                        
                        const response = await axios.post(`https://www.youtube.com/youtubei/v1/browse?key=${api_key}`, {
                            "context": {
                                "client": {
                                    "clientName": "WEB",
                                    "clientVersion": "2.20230216.01.00"
                                }
                            },
                            "continuation": continuation_token
                        });
                        
                        const rractions = response.data.onResponseReceivedActions[0];
                        const continuation_items = rractions.appendContinuationItemsAction.continuationItems.filter(c=> c.richItemRenderer != null);
            
                        const last_c_i = rractions.appendContinuationItemsAction.continuationItems.pop();
                        
                        continuation_token = last_c_i.continuationItemRenderer?.continuationEndpoint.continuationCommand.token;
        
                        continuation_items.forEach(ci=>{
            
                            const vid_meta = this.parseVideoFromRichItemRenderer(ci.richItemRenderer);
                                console.log(vid_meta);
                            if( videosReceivedCallback ){

                                videosReceivedCallback(vid_meta);
                            }
                            
                            this.videos.push(vid_meta);
                        });
                    }

                    this.videos = this.videos.reverse();
                    
                    await this.dbChannelRef().set({
                        videos_last_updated: (new Date()).getTime(),
                        videos: this.videos
                    });
                }catch(err){

                    console.error(err);
                }

                resolve(this.videos);

            }catch(err){
        
                //console.error(err);
                errorResolve(err);
            }
        });
    }
}

module.exports = YoutubeChannel;