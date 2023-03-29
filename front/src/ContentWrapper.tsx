
import React from 'react';

export default function ContentWrapper(props : {style? : React.CSSProperties, children: React.ReactNode}){

    return (
        <div className='content-wrapper' style={props.style}>{ props.children }</div>
    );
}