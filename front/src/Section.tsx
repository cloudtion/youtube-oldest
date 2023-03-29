
import React from 'react';

export default function Section(props : {style? : React.CSSProperties, children: React.ReactNode}){

    return (
        <div className='section' style={props.style}>{ props.children }</div>
    );
}