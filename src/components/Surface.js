import { WIDTH, HEIGHT, BG_COLOR } from '../constants';

import * as Layer from './Layer';


export const view = ({}, ...children) => (
  Layer.view({
    model: {
      x: 0,
      y: 0,
      w: WIDTH,
      h: HEIGHT,
      fill: BG_COLOR
    }
  }, ...children)
);
