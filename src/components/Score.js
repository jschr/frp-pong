import { SCORE_SIZE, SECONDARY_COLOR } from '../constants';

import * as Text from './Text';

import convertToColor from '../utils/convertToColor';


export const init = (score) => (
  score
);


const style = {
  fontFamily: 'Helvetica Neue, Arial, sans-serif',
  color: convertToColor(SECONDARY_COLOR),
  fontSize: SCORE_SIZE
};


export const view = ({ model = init() }) => (
  Text.view({ style: { ...style, marginLeft: -(String(model).length - 1) * (SCORE_SIZE / 2) }, model: model })
);
