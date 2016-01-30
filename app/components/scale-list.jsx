import React from 'react';

let ScaleList = props => (
    <ul className="scale-list">
    {props.scales.map((scale, i) => (
        <li key={i}>{ scale.length }</li>
    ))}
    </ul>
);;

export default ScaleList
