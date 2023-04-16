import React, { useState, useEffect } from 'react';
import useVideos from './useVideos';
import ContentWrapper from './ContentWrapper';
import Section from './Section';
import VideoOverview from './VideoOverview';
import LoadingText from './LoadingText';

enum Sort {
    DateAscending = 1,
    DateDescending,
}

export default function App(){

    const [url, setUrl] = useState('');
    const [videos, setChannelId, loading] = useVideos();
    const [sort, setSort] = useState(Sort.DateAscending);
    const [searchQuery, setSearchQuery] = useState('');

    const current_year = (new Date()).getFullYear();

    function channelUrlGo(manual_url : string = null){
        
        const use_url = manual_url?? url;

        try{

            const match = use_url.match(/(?:youtube\.com\/(@[a-zA-Z0-9\-]+)\/?)|(?:youtube\.com\/((?:c|user|channel)\/[a-zA-Z0-9\-]+)\/?)/);;
            
            const [,handleMatch,legacyChannelMatch] = match;

            const new_channel_id = encodeURIComponent(handleMatch?? legacyChannelMatch);

            setChannelId(new_channel_id);
            
            window.history.pushState({}, null, new_channel_id);

        }catch(err){

            manual_url || alert('Invalid Channel URL. Please paste the URL of the youtube channel that you want to view.');
        }
    }

    useEffect(()=>{

        function paste(e : ClipboardEvent){

            try{
                
                const url = new URL(e.clipboardData.getData("text"));
                
                setUrl(url.href);
                channelUrlGo(url.href);

            }catch(err){}
        }

        const curr_url = new URL(window.location.href);
        
        if( curr_url.pathname.length > 1 ){

            const youtube_url = 'https://youtube.com/'+curr_url.pathname.substring(1);
            const decoded_url = decodeURIComponent(youtube_url);
            
            setUrl(decoded_url);
            channelUrlGo(decoded_url);
        }

        window.addEventListener('paste', paste);

        return ()=> window.removeEventListener('paste', paste);

    }, []);

    const regex_epression = /[a-zA-Z0-9]+/g;

    const filtered_videos = [...videos].filter(v=>{
        
        if( searchQuery.length < 1  ){
            return true;
        }

        const title_match = v.title.match(regex_epression);
        const search_match = searchQuery.match(regex_epression);

        if( !title_match || !search_match ){
            return false;
        }

        const title_str = title_match.join('').toLowerCase();

        return title_str.includes(search_match.join('').toLowerCase());
    });
    
    const sorted_videos = (sort===Sort.DateAscending)? filtered_videos : filtered_videos.reverse();
    
    const video_els = [];

    for(let i=0;i<Math.ceil(sorted_videos.length/3)*3;i++){
    
        video_els.push(

            sorted_videos[i]? 
            <VideoOverview key={sorted_videos[i].videoId} video={sorted_videos[i]}/>
            :
            // This is a spacer to keep the columns of videos even.
            <div key={'padding-'+i} className='video-overview'></div>
        );
    }console.log('rerender');

    return (
        <>
            <Section style={{backgroundColor: '#444444', paddingBottom: 60}}>
                <ContentWrapper>

                    <div>

                        <h1 style={{fontSize: 24}}>Youtube Oldest to Newest Channel Videos</h1>

                        <div id='channel-link-input'>

                            <label htmlFor='ChannelId'>Youtube Channel</label><br/>
                            <div id='channel-input-wrapper'>
                                <input 
                                    name='ChannelId' 
                                    type='text'
                                    placeholder='Paste channel link or id here...'
                                    value={url}
                                    onChange={e=>{ e.stopPropagation(); setUrl(e.target.value)}}
                                    onPaste={e=> e.stopPropagation()}
                                />
                                <button onClick={()=> channelUrlGo()}>Go</button>

                            </div>
                        </div>
                    </div>

                </ContentWrapper>
            </Section>
            
            <Section >    
                <ContentWrapper style={{backgroundColor: 'white'}}>

                    <div id='video-list-toolbar'>

                        <input 
                            type='search' 
                            placeholder='Search Videos'
                            onBlur={e=> setSearchQuery(e.target.value)}
                            onKeyDown={e=>{ e.key==='Enter' && (e.target as HTMLElement).blur()}}
                        />

                        <select value={sort} onChange={e=> setSort(parseInt(e.target.value) as Sort)}>
                            <option value={Sort.DateAscending}>Oldest to Newest</option>
                            <option value={Sort.DateDescending}>Newest to Oldest</option>
                        </select>

                    </div>

                    <div id='videos-list'>
                        { 
                            loading? 
                                <LoadingText/>
                                : 
                                video_els
                        }
                    </div>

                </ContentWrapper>
            </Section>

            <Section style={{paddingBottom: '6em'}}>
                
                <ContentWrapper>

                    { video_els.length>0? <hr/> : null }
                    
                    <h2>What is this tool for?</h2>
                    <p>
                        Youtube recently removed the ability to sort a channel's videos from oldest to newest. At the time of writing ({ current_year }), there are only two sorting options, "Recently Uploaded" and "Popular".
                    <br/><br/> 
                        While these options are fine most of the time, for those wanting to look back further to find a video they remember, this can be a real pain.
                    
                    <br/><br/>So, I made this tool to simplify the process of looking for old videos on my favorite channels.<br/>
                    Just go to the channel page of the channel that you want to look up. Copy the url, and paste it in the search bar above.</p>
                    
                    <br/>

                    <h2>How does this work?</h2>
                    <p>
                        In the background, the app is just loading the channel page you input and scrolling through as fast as possible to get a full list of videos.<br/>
                        This means that channels with more videos will take longer to load the first time you load them.
                        <br/><br/>

                        But, the results from the channel that you entered are saved to our server so that the next time you access the channel history, the results can be loaded very quickly. A channel's videos are cached and will only be updated if they're requested again after five days.
                    </p>

                    <br/>
                    
                    <h2>About Me</h2>
                    <p style={{textAlign: 'center'}}>
                        My name is William. I'm a web developer and am currently looking for work.<br/>You can see my resume and portfolio by <a href='https://williamjacobs.dev'>clicking here</a>.
                    </p>

                </ContentWrapper>
            </Section>

            <footer></footer>
        </>
    )
}