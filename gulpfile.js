const { watch, task, src, dest, series } = require('gulp');
const concat = require('gulp-concat');
const minify = require('gulp-minify');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const handlebars = require('gulp-handlebars');
const wrap = require('gulp-wrap');
const declare = require('gulp-declare');
const notify = require('gulp-notify');

let jsFilesCroutonNoCore = [
	'bootstrap.min.js',
	'transition.js',
	'select2.full.min.js',
	'tablesaw.jquery.3.0.9.js',
	'handlebars-v4.5.3.js',
	'moment.js',
	'moment-timezone.js',
	'crouton-localization.js',
	'templates.js',
	'crouton-default-templates.js',
	'punycode.1.4.1.js',
	'fetch-jsonp.js',
	'promises-polyfill.js',
];
let jsFilesCroutonNoCoreWithFullPath = jsFilesCroutonNoCore.map((f)=>'croutonjs/src/js/'+f);
let jsFilesCroutonCore = jsFilesCroutonNoCore.concat(['crouton-core.js']);
let jsFilesCroutonCoreWithFullPath = jsFilesCroutonCore.map((f)=>'croutonjs/src/js/'+f);
let jsFilesCroutonMap = [
	'meeting_map.js',
	'osmDelegate.js',
	'leaflet.js',
	'leaflet.markercluster.js'
];
let jsFilesGoogleMap = [
	'meeting_map.js',
	'gmapsDelegate.js',
	'google.markercluster.min.js',
];
let jsFilesCroutonMapWithFullPath = jsFilesCroutonMap.map((f)=>'croutonjs/meetingMap/js/'+f);
let jsFilesGoogleMapWithFullPath = jsFilesGoogleMap.map((f)=>'croutonjs/meetingMap/js/'+f);
let jsFilesNoJQueryWithFullPath = [
].concat(jsFilesCroutonCoreWithFullPath)
.concat(jsFilesCroutonMapWithFullPath);
let jsFilesWithJqueryWithFullPath = [
	'croutonjs/src/js/jquery-3.4.1.min.js',
].concat(jsFilesNoJQueryWithFullPath);

let cssFiles = [
	'select2.min.css',
	'bootstrap.min.css',
	'bmlt_tabs.css',
];
let cssMapFiles = [
	'leaflet.css',
	'MarkerCluster.css',
	'MarkerCluster.Default.css',
	'meeting_map.css',
];
let distDir = 'croutonjs/dist';

task('js-files-nojquery', () => {
	return src(jsFilesNoJQueryWithFullPath)
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
task('jsFilesCroutonCore', () => {
	return src(jsFilesCroutonCoreWithFullPath)
		.pipe(concat('crouton-core.js'))
		.pipe(dest(distDir))
		.pipe(minify({
			ext: {
				min:'.min.js'
			},
		}))
		.pipe(dest(distDir))
		.pipe(notify({message:"js-files-crouton-core complete", wait: true}));
});
task('jsFilesCroutonNoCore', () => {
	return src(jsFilesCroutonNoCoreWithFullPath)
		.pipe(concat('crouton-nocore.js'))
		.pipe(dest(distDir))
		.pipe(minify({
			ext: {
				min:'.min.js'
			},
		}))
		.pipe(dest(distDir))
		.pipe(notify({message:"js-files-crouton-nocore complete", wait: true}));
});
task('jsFilesCroutonMap', () => {
	return src(jsFilesCroutonMapWithFullPath)
		.pipe(concat('crouton-map.js'))
		.pipe(dest(distDir))
		.pipe(minify({
			ext: {
				min:'.min.js'
			},
		}))
		.pipe(dest(distDir))
		.pipe(notify({message:"jsFilesCroutonMap complete", wait: true}));
});

task('js-files', () => {

	return src(jsFilesWithJqueryWithFullPath)
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
let jsFilesGoogleWithFullPath = ['croutonjs/src/js/jquery-3.4.1.min.js'
].concat(jsFilesCroutonCoreWithFullPath)
.concat(jsFilesGoogleMapWithFullPath);
task('js-gmaps-files', () => {

	return src(jsFilesGoogleWithFullPath)
		.pipe(concat('crouton-gmaps.js'))
		.pipe(dest(distDir))
		.pipe(minify({
			ext: {
				min:'.min.js'
			},
		}))
		.pipe(dest(distDir))
		.pipe(notify({message: "js-gmaps-files complete", wait: true}));
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
	for (let cssFile of cssMapFiles) {
		cssFilesWithFullPath.push('croutonjs/meetingMap/css/' + cssFile);
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

task('default', series('templates', 'js-files', 'js-gmaps-files', 'js-files-nojquery', 'jsFilesCroutonMap', 'jsFilesCroutonCore', 'jsFilesCroutonNoCore', 'css-files'));

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
