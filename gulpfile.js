const { watch, task, src, dest, series } = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const handlebars = require('gulp-handlebars');
const wrap = require('gulp-wrap');
const declare = require('gulp-declare');
const notify = require('gulp-notify');

let jsFilesNoJQuery = [
	'bootstrap.min.js',
	'select2.full.min.js',
	'tablesaw.jquery.3.0.9.js',
	'handlebars-v4.5.3.js',
	'moment.js',
	'moment-timezone.js',
	'crouton-localization.js',
	'templates.js',
	'crouton-default-templates.js',
	'crouton-core.js',
	'punycode.1.4.1.js',
	'markerclusterer.js',
	'oms-1.0.3.min.js',
	'fetch-jsonp.js',
	'promises-polyfill.js',
];
let jsFilesWithJquery = [
	'jquery-3.4.1.min.js',
].concat(jsFilesNoJQuery);
let cssFiles = [
	'select2.min.css',
	'bootstrap.min.css',
	'bmlt_tabs.css',
];
let distDir = 'croutonjs/dist';

task('js-files-nojquery', () => {
	let jsFilesWithFullPath = [];
	for (let jsFile of jsFilesNoJQuery) {
		jsFilesWithFullPath.push('croutonjs/src/js/' + jsFile);
	}

	return src(jsFilesWithFullPath)
		.pipe(concat('crouton.nojquery.js'))
		.pipe(dest(distDir))
		.pipe(minify({
			ext: {
				min:'.min.js'
			},
		}))
		.pipe(dest(distDir))
		.pipe(notify({message:"js-files-nojquery complete", wait: true}));
});

task('js-files', () => {
	let jsFilesWithFullPath = [];
	for (let jsFile of jsFilesWithJquery) {
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
		.pipe(dest(distDir))
		.pipe(notify({message: "js-files complete", wait: true}));
});

task('templates', function () {
	return src('croutonjs/src/templates/*.hbs')
		.pipe(handlebars())
		.pipe(wrap('Handlebars.template(<%= contents %>)'))
		.pipe(declare({
			namespace: 'hbs_Crouton.templates',
			noRedeclare: true, // Avoid duplicate declarations
		}))
		.pipe(concat('templates.js'))
		.pipe(dest('croutonjs/src/js'))
		.pipe(notify({message: "templates complete", wait: true}));
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
		.pipe(notify({message: "css-files complete", wait: true}));
});

task('default', series('templates', 'js-files', 'js-files-nojquery', 'css-files'));

task('watch', () => {
	watch([
		'croutonjs/src/templates/*.hbs'
	], series('templates'));

	watch([
		'croutonjs/src/js/*.js'
	], series('js-files', 'js-files-nojquery'));

	watch([
		'croutonjs/src/css/*.css'
	], series('css-files'));
});
