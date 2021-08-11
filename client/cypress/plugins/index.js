/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import socketIOClient from "socket.io-client";

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
	// `on` is used to hook into various events Cypress emits
	// `config` is the resolved Cypress config
	let socket;
	const ENDPOINT = "http://localhost:4000/";
	on("before:browser:launch", (browser, launchOptions) => {
		launchOptions.args.push("--use-fake-device-for-media-stream");
		launchOptions.args.push("--use-fake-ui-for-media-stream");

		return launchOptions;
	});
	on("task", {
		connect() {
			socket = socketIOClient(ENDPOINT);
			return new Promise((on) => {
				socket.on("connect", () => {
					on(socket.id);
				});
			});
		},
		join(name) {
			socket.emit("JOIN", name);
			return new Promise((on) => {
				socket.on("JOIN", (user) => {
					on(user);
				});
			});
		},
		requestUsers() {
			socket.emit("REQUEST_USERS");
			return new Promise((on) => {
				socket.on("REQUEST_USERS", (users) => {
					on(users);
				});
			});
		},
		clearUsers() {
			socket.emit("CLEAR_USERS");
			return null;
		},
		offer(dataString) {
			socket.emit("OFFER", dataString);
			return null;
		},
		onOffer() {
			return new Promise((on) => {
				socket.on("OFFER", (dataString) => {
					on(dataString);
				});
			});
		},
		answer(dataString) {
			socket.emit("ANSWER", dataString);
			return null;
		},
		onAnswer() {
			return new Promise((on) => {
				socket.on("ANSWER", (dataString) => {
					on(dataString);
				});
			});
		},
	});
};
