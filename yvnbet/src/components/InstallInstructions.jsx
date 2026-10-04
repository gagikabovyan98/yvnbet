import React from 'react';
import { instructionBlocks } from '../format-content.mjs';
export default function InstallInstructions({text}) {
  return <div className="install-instructions">{instructionBlocks(text).map((block,i)=>
    block.type === 'heading' ? <h2 key={i}>{block.text}</h2> :
    block.type === 'label' ? <p key={i} className="eyebrow">{block.text}</p> :
    block.type === 'steps' ? <ol key={i}>{block.items.map((step,j)=><li key={j}><span>{step}</span></li>)}</ol> :
    <p key={i}>{block.text}</p>
  )}</div>;
}
