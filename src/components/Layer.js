import * as Section from './Section';

import convertToColor from '../utils/convertToColor';


const baseStyle = {
  position: 'absolute'
};


const computeStyles = (model) => {
  const styles = { ... baseStyle };

  styles.left = model.x;
  styles.top = model.y;
  styles.width = model.w;
  styles.height = model.h;
  styles.borderRadius = model.borderRadius;
  styles.opacity = model.opacity;

  if (model.fill) {
    styles.backgroundColor = convertToColor(model.fill);
  }

  if (model.borderColor) {
    styles.border = `${model.borderWidth}px ${model.borderStyle || 'solid'} ${convertToColor(model.borderColor)}`;
  }

  // styles.transition = 'top 0.25s ease-in, left 0.25s ease-in';

  return styles;
};


export const init = ({ x = 0, y = 0, fill, borderColor, borderWidth, borderStyle } = {}) => ({
  x, y, fill, borderColor, borderWidth, borderStyle
});


export const view = ({ model = init() }, ...children) => (
  Section.view({ style: computeStyles(model) }, ...children)
);
