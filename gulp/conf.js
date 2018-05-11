"use strict";

exports.paths = {
	src: "./src/",
	dist: "./dist/",
	testPage: "./test-page/",
	tmp: "./.tmp/",
	bowerComponents: './bower_components/'
};
var paths = exports.paths; // shorthand

exports.sourceSets = {
	scripts: [
		paths.src + "datepicker.js",
		paths.src + "datepicker-base/datepicker-base.service.js",
		paths.src + "time-utils/time-utils.service.js",
		paths.src + "moment-strict/moment-strict.service.js",
		paths.src + "datepicker-duration/datepicker-duration.directive.js",
		paths.src + "datepicker-date/datepicker-date.directive.js",
		paths.src + "datepicker-minimal/date-input.directive.js",
		paths.src + "datepicker-minimal/datepicker-minimal.directive.js",
		paths.src + "datepicker-year/datepicker-year.directive.js",
		paths.src + "datepicker-offset/datepicker-offset.directive.js"
	],
	templates: [
		paths.src + "**/*.html"
	],
	css: [
		paths.src + "**/*.css"
	],
	all: [
		paths.src + "**/*.@(js|html|css)"
	],

	testPage: [
		paths.testPage + "**.@(js|html|css)"
	]
};

exports.cleanDirs = [
	paths.dist,
	paths.tmp
];

exports.deploy = {
	projectName: 'lasp-datepicker',

	domain: 'ds-webapp-dev',
	adminProtocol: 'https',
	adminPort: '4848',
	ignoreCertificateErrors: true,
	target: 'dev',
	username: 'demo-deployer',
	password: 'JebediahKerman',
	displayPort: '28080',
	displayProtocol: 'http'

	// domain: 'localhost',
	// adminProtocol: 'http',
	// adminPort: '4848',
	// ignoreCertificateErrors: false,
	// target: undefined,
	// username: undefined,
	// password: undefined,
	// displayPort: '8080',
	// displayProtocol: 'http'
	
};

