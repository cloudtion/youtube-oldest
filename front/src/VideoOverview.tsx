
import React from 'react';
import { VideoMeta } from './types';


export default function VideoOverview(props : {video : VideoMeta}){
    
    return (
        <div className='video-overview'>
            <a target='_blank' href={`https://youtube.com/watch?v=${props.video.videoId}`}>
                <img src={props.video.thumb.url} loading='lazy'/>
                <div className='video-title'>{ props.video.title }</div>
                <div className='video-meta-data'>{ `${props.video.shortViewCount} • ${props.video.publishedTime}`}</div>
            </a>
        </div>
    )
}