import { SECONDARY_COLOR } from '../constants';

import * as Text from './Text';

import convertToColor from '../utils/convertToColor';


export const init = (score) => (
  score
);


const style = {
  fontFamily: 'Helvetica Neue, Arial, sans-serif',
  color: convertToColor(SECONDARY_COLOR),
  fontSize: 60
};


export const view = ({ model = init() }) => (
  Text.view({ style, model: model })
);
