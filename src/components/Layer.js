import * as Section from './Section';


const baseStyle = {
  position: 'absolute'
};

const color = (value) => `hsla(${value[0]}, ${value[1]}%, ${value[2]}%, ${value[3]})`;

const computeStyles = (model) => {
  const styles = { ... baseStyle };

  styles.left = model.x;
  styles.top = model.y;
  styles.width = model.w;
  styles.height = model.h;
  styles.borderRadius = model.borderRadius;

  if (model.fill) {
    styles.backgroundColor = color(model.fill);
  }

  if (model.borderColor) {
    styles.border = `${model.borderWidth}px ${model.borderStyle || 'solid'} ${color(model.borderColor)}`;
  }

  return styles;
};


export const init = ({ x = 0, y = 0, fill, borderColor, borderWidth, borderStyle } = {}) => ({
  x, y, fill, borderColor, borderWidth, borderStyle
});


export const view = ({ model = init() }, ...children) => (
  Section.view({ style: computeStyles(model) }, ...children)
);
