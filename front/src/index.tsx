import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './styles.scss';

const root_el = document.createElement('div');
      root_el.id = 'root';

document.body.appendChild(root_el);

const root = ReactDOM.createRoot(root_el);

root.render(<App/>);