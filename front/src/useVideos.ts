
import {useState, useEffect, useRef} from 'react';
import { VideoMeta, VideoMetaListDetails } from './types';
const fetchStream : any = require('fetch-readablestream');



export default function useVideos() : [VideoMeta[], (new_channel_url : string)=> void, boolean] {

    const [videos, setVideos] = useState<VideoMeta[]>([]);
    const videosRef = useRef<VideoMeta[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const videoIntervalRef = useRef(null);


    function readAllChunks(readableStream : any) {

        const reader = readableStream.getReader();
        const chunks : VideoMeta[] = [];
        let order = 'normal';
        let remaining_str = '';

        function pump() {

          return reader.read().then(({ value, done } : any) => {

            if (done) {
                
                setVideos(chunks);
                
                return chunks;
            }

            //const str = String.fromCharCode(...value);
            //const uint8array = new TextEncoder("utf-8").encode("Plain Text");
            const str = new TextDecoder().decode(value);

            str.split('\n').forEach((vid_meta_json:string, ind:number)=>{
              
                try{

                    let use_str : string = remaining_str + '' + vid_meta_json;
                    remaining_str = '';

                    const parsed : VideoMeta|VideoMetaListDetails = JSON.parse(use_str);

                    if( (parsed as VideoMetaListDetails).order ){
                        
                        order = (parsed as VideoMetaListDetails).order;
                        
                        return;
                        
                    }else{

                        chunks.push(parsed as VideoMeta);
                        
                        if( order === 'reverse' ){
                            
                            videosRef.current.unshift(parsed as VideoMeta);
                            
                        }else{
                            
                            videosRef.current.push(parsed as VideoMeta);
                        }

                        setVideos([...videosRef.current]);
                    }

                }catch(err){

                    remaining_str = vid_meta_json;
                }
            });            

            //clearInterval(videoIntervalRef.current);
            //
            return pump();
          });
        }

        setVideos(videosRef.current);

        setLoading(false);    

        return pump();
      }
       
      
    async function setChannelId(channel_id : string) {
        
        try{   

            videosRef.current = [];
            
            const channel_videos = localStorage.getItem('channel_videos');

            if( channel_videos ){

                const parsed = JSON.parse(channel_videos);

                if( parsed[channel_id] ){

                    setVideos(parsed[channel_id]);

                    return [parsed[channel_id], setChannelId];
                }
            }

            setLoading(true);
            
            const response : any = await fetchStream(`${process.env.VIDEOS_ENDPOINT}/${(channel_id)}`);
            const chunks : any = await readAllChunks(response.body);

            setVideos([...videosRef.current]);   
            clearInterval(videoIntervalRef.current);          
            setLoading(false);    

    
        }catch(err){

            if( err?.response?.data ){

                console.error(err.response.data);
            }
            console.error(err);
        }
    }

    return [videos, setChannelId, loading];
}