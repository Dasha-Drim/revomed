import React from 'react';
import ReactDOM from 'react-dom';
import { DateTime } from 'luxon';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';


import './index.scss';

let isCurrentBrowserSupported = () => {
	return navigator.mediaDevices && navigator.mediaDevices.getUserMedia && DateTime.now().zoneName;
}

if(isCurrentBrowserSupported()) {
	ReactDOM.render(
	    <App />,
	  document.getElementById('root')
	);
} else {
	ReactDOM.render(
	    <div className="UnsupportedBrowserAlert d-flex jusftify-content-center align-items-center align-content-center">
	    	<div className="p-5">
	    		<h1>Этот браузер не поддерживается</h1>
	    		<p>К сожалению, в этом браузере не работает видеосвязь и/или некорректно возвращаются часовые пояса. <br/> Пожалуйста, установите последнюю версия любого современного браузера (Google Chrome, Firefox, Safari)</p>
	    		<p>С Уважением, <br /> Команда Revomed</p>
	    	</div>
	    </div>,
	  document.getElementById('root')
	);
}


// If you want your app to work offline and load faster, you can change 
// unregister() to register() below. Note this comes with some pitfalls. 
// Learn more about service workers: https://cra.link/PWA 
serviceWorkerRegistration.register(); 

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
