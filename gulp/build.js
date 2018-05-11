"use strict";

var gulp = require("gulp");

var conf = require("./conf");
var paths = conf.paths;
var sourceSets = conf.sourceSets;

gulp.task("clean", function(cb) {

	var del = require("del");

	del(conf.cleanDirs, cb);
});

var concat;
gulp.task("_load_common_modules_build", function() {
	concat = require("gulp-concat");
});

gulp.task("build-scripts", ["_load_common_modules_build"], function() {

	var templateCache = require('gulp-angular-templatecache');
	var addSrc = require("gulp-add-src");
	var minifyHtml = require("gulp-minify-html");

	return gulp.src(sourceSets.templates)
		.pipe(minifyHtml({
			empty: true, // do not remove empty attributes
			spare: true, // do not remove redundate attributes
			quotes: true // do not remove arbitrary quotes
		}))
		.pipe(templateCache(
			"templates.js",
			{
				module: "laspDatePicker"
			}
		))
		.pipe(addSrc.prepend(sourceSets.scripts))
		.pipe(concat("lasp-datepicker.js"))
		.pipe(gulp.dest(paths.dist));
});

gulp.task("build-css", ["_load_common_modules_build"], function() {

	var csso = require("gulp-csso");

	return gulp.src(sourceSets.css)
		.pipe(concat("lasp-datepicker.css"))
		.pipe(csso())
		.pipe(gulp.dest(paths.dist));
})

gulp.task("build", ["build-scripts", "build-css"], function (cb) { cb(); });

gulp.task("cleanBuild", function(cb) {

	var runSequence = require("run-sequence");

	runSequence(
		"clean",
		"build",
		cb
	);
});
