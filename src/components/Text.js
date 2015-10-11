import React from 'react';


export const init = (str = '') => (
  str
);


export const view = ({ model = init(), style, handlers }) => (
  React.DOM.span({ style, ...handlers }, model)
);
