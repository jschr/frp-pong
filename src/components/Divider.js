import { WIDTH, HEIGHT, COURT_BUFFER, SECONDARY_COLOR } from '../constants';

import * as Layer from './Layer';


export const view = () => (
  Layer.view({
    model: {
      x: COURT_BUFFER,
      y: (HEIGHT / 2),
      w: WIDTH - (COURT_BUFFER * 2),
      borderWidth: 1,
      borderColor: SECONDARY_COLOR,
      opacity: 0.1
    }
  })
);
