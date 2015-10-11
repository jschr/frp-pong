import Rx from 'rx';
import createContainer from '../core/container';

import { HEIGHT } from '../constants';


import * as Section from '../components/Section';

import Pong from './Pong';


const init = () => ({});


const actions = () => ({});


const containerStyle = {
  position: 'relative',
  height: HEIGHT
};


const view = () => (
  Section.view({},
    Section.view({ style: containerStyle }, Pong()),
    Section.view({ style: containerStyle }, Pong()),
    Section.view({ style: containerStyle }, Pong())
  )
);


const update = () => Rx.Observable.empty();


export default createContainer({ init, view, actions, update });
