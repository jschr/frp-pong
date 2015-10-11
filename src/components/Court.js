import { COURT_BUFFER, COURT_WIDTH, COURT_HEIGHT, COURT_LINE_SIZE, PRIMARY_COLOR } from '../constants';

import * as Layer from './Layer';


export const view = ({}, ...children) => (
  Layer.view({
    model: {
      x: COURT_BUFFER - COURT_LINE_SIZE,
      y: COURT_BUFFER - COURT_LINE_SIZE,
      w: COURT_WIDTH + (COURT_LINE_SIZE * 2),
      h: COURT_HEIGHT + (COURT_LINE_SIZE * 2),
      borderWidth: COURT_LINE_SIZE,
      borderColor: PRIMARY_COLOR,
      borderRadius: 8
    }
  }, ...children)
);
