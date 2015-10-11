import { WIDTH, HEIGHT, COURT_BUFFER, SECONDARY_COLOR, COURT_LINE_SIZE } from '../constants';

import * as Layer from './Layer';


export const view = () => (
  Layer.view({
    model: {
      x: COURT_BUFFER,
      y: (HEIGHT / 2) - (COURT_LINE_SIZE / 2),
      w: WIDTH - (COURT_BUFFER * 2),
      h: COURT_LINE_SIZE,
      fill: SECONDARY_COLOR
    }
  })
);
