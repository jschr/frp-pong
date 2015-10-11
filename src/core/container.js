import React from 'react';
import Rx from 'rx';
import merge from 'lodash.merge';
import isPlainObject from 'lodash.isplainobject';
import uniqueId from 'lodash.uniqueid';

export default function createContainer({ init, view, actions, update }) {
  const spec = {};

  spec.contextTypes = {
    appState: React.PropTypes.object
  };

  spec.getInitialState = function() {
    return init ? { model: init() } : {};
  };

  spec.render = function() {
    const model = this.state.model;
    const { children } = this.props;
    const context = this.context;

    return view({ model, context, ...this.actions }, ...children);
  };

  spec.componentWillMount = function() {
    const appState = this.context.appState;

    const setModel = (model) => {
      if (isPlainObject(model)) {
        this.setState({ model: merge({}, this.state.model, model) });
      } else {
        this.setState({ model });
      }
    };

    const modelState = appState.fork('__models__', uniqueId('m_'))(init());

    this.modelState = modelState;
    this.actions = actions();
    this.update = update({ appState, modelState, ...this.actions });

    this.subscription = Rx.Observable.merge(
      this.modelState.observe().do(setModel),
      this.update
    ).subscribe();
  };

  spec.componentWillUnmount = function() {
    this.subscription.dispose();

    this.modelState = null;
    this.actions = null;
    this.update = null;
    this.subscription = null;
  };

  const factory = React.createFactory(React.createClass(spec));

  return (props, ...children) => factory(props, children);
}
