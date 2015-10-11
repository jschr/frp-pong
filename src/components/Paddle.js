import { HEIGHT, COURT_BUFFER, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_BUFFER, SECONDARY_COLOR } from '../constants';

import * as Layer from './Layer';

export const init = (position, x) => ({
  x,
  y: position === 'top' ?
    0 + COURT_BUFFER + PADDLE_BUFFER :
    HEIGHT - COURT_BUFFER - PADDLE_HEIGHT - PADDLE_BUFFER
});

export const view = ({ model = init() }, ...children) => (
  Layer.view({
    model: {
      x: model.x + COURT_BUFFER + PADDLE_BUFFER,
      y: model.y,
      w: PADDLE_WIDTH,
      h: PADDLE_HEIGHT,
      fill: SECONDARY_COLOR,
      borderRadius: 100
    }
  }, ...children)
);
