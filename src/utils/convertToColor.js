export default function convertToColor(value) {
  return `hsla(${value[0]}, ${value[1]}%, ${value[2]}%, ${value[3]})`;
}
