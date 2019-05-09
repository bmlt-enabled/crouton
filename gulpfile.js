const { watch, task, src, dest, series } = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');

let jsFiles = [
	'jquery-3.4.1.min.js',
	'bootstrap.min.js',
	'select2.full.min.js',
	'tablesaw.jquery.3.0.9.js',
	'handlebars-v4.0.12.js',
	'moment.js',
	'crouton-localization.js',
	'crouton-core.js',
	'spin.2.3.2.js',
	'punycode.js',
	'markerclusterer.js',
	'oms.min.js'
];
let cssFiles = [
	'select2.min.css',
	'bootstrap.min.css',
	'bmlt_tabs.css'
];
let distDir = 'croutonjs/dist';

task('js-files', () => {
	let jsFilesWithFullPath = [];
	for (let jsFile of jsFiles) {
		jsFilesWithFullPath.push('croutonjs/src/js/' + jsFile);
	}

	return src(jsFilesWithFullPath)
		.pipe(concat('crouton.js'))
		.pipe(dest(distDir))
		.pipe(minify({
			ext: {
				min:'.min.js'
			},
		}))
		.pipe(dest(distDir));
});

task('css-files', () => {
	let cssFilesWithFullPath = [];
	for (let cssFile of cssFiles) {
		cssFilesWithFullPath.push('croutonjs/src/css/' + cssFile);
	}

	return src(cssFilesWithFullPath)
		.pipe(concat('crouton.css'))
		.pipe(dest(distDir))
		.pipe(cleanCSS())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(dest(distDir))
});

task('default', series('js-files', 'css-files'));

task('watch', () => {
	watch([
		'croutonjs/src/js/*.js'
	], series('js-files'));

	watch([
		'croutonjs/src/css/*.css'
	], series('css-files'));
});

