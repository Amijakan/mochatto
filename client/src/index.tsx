import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import JoinPage from './JoinPage'
import RoomPage from './RoomPage'
import reportWebVitals from './reportWebVitals'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

ReactDOM.render(
	<React.StrictMode>
		<BrowserRouter>
			<Switch>
				<Route exact path="/" component={JoinPage} />
				<Route path="/RoomPage" component={RoomPage} />
			</Switch>
		</BrowserRouter>
	</React.StrictMode>,
	document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
