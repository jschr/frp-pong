import ReactDOM from 'react-dom';
import provider from './core/provider';

import app from './containers/App';


const selector = document.currentScript.getAttribute('data-container');

ReactDOM.render(provider(app()), document.querySelector(selector));
