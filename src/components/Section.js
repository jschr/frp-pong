import React from 'react';


export const view = ({ handlers, style }, ...children) => (
  React.DOM.div({ style, ...handlers }, ...children)
);
