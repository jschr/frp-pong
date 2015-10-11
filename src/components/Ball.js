import { BALL_SIZE, PRIMARY_COLOR } from '../constants';

import * as Layer from './Layer';


export const init = (x, y, velocity) => ({
  x,
  y,
  velocity
});


export const view = ({ model = init() }, ...children) => (
  Layer.view({
    model: {
      x: model.x,
      y: model.y,
      w: BALL_SIZE,
      h: BALL_SIZE,
      fill: PRIMARY_COLOR,
      borderRadius: 100
    }
  }, ...children)
);
