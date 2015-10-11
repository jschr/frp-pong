import { COURT_BUFFER, COURT_LINE_SIZE, BALL_SIZE, SECONDARY_COLOR } from '../constants';

import * as Layer from './Layer';

export const init = (x, y, velocity) => ({
  x,
  y,
  velocity
});

export const view = ({ model = init() }, ...children) => (
  Layer.view({
    model: {
      x: model.x + COURT_BUFFER - COURT_LINE_SIZE,
      y: model.y + COURT_BUFFER - COURT_LINE_SIZE,
      w: BALL_SIZE,
      h: BALL_SIZE,
      fill: SECONDARY_COLOR,
      borderRadius: 100
    }
  }, ...children)
);
