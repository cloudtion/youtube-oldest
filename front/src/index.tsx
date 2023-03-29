import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './styles.scss';
import axios from 'axios';

declare global {
      interface Window { axios: any; }
}

window.axios = axios;

const root_el = document.createElement('div');
      root_el.id = 'root';

document.body.appendChild(root_el);

const root = ReactDOM.createRoot(root_el);

root.render(<App/>);