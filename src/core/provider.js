import React from 'react';
import createStore from './store';

const spec = {};

spec.childContextTypes = {
  appState: React.PropTypes.object
};

spec.getChildContext = function() {
  return {
    appState: createStore()
  };
};

spec.render = function() {
  const { children } = this.props;
  return children;
};

const factory = React.createFactory(React.createClass(spec));

export default (component) => factory({}, component);
