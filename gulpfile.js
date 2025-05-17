const { watch, task, src, dest, series } = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const handlebars = require('gulp-handlebars');
const wrap = require('gulp-wrap');
const declare = require('gulp-declare');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');

let jsFilesCrouton = [
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
	'crouton-core.js',
	'meeting_map.js',
];
let jsFilesCroutonWithFullPath = jsFilesCrouton.map((f)=>'croutonjs/src/js/'+f);
let jsFilesLeafletMap = [
	'osmDelegate.js',
	'leaflet.js',
	'leaflet.markercluster.js'
];
let jsFilesGoogleMap = [
	'gmapsDelegate.js',
	'google.markercluster.min.js',
	'oms-1.0.3.min.js',
];
let jsFilesLeafletMapWithFullPath = jsFilesLeafletMap.map((f)=>'croutonjs/src/mapDelegates/js/'+f);
let jsFilesGoogleMapWithFullPath = jsFilesGoogleMap.map((f)=>'croutonjs/src/mapDelegates/js/'+f);
let jsFilesNoJQueryWithFullPath = [
].concat(jsFilesCroutonWithFullPath);

let jsFilesWithJqueryWithFullPath = [
	'croutonjs/src/js/jquery-3.4.1.min.js',
].concat(jsFilesNoJQueryWithFullPath)
.concat(jsFilesLeafletMapWithFullPath);

let cssFiles = [
	'select2.min.css',
	'bootstrap.min.css',
	'bmlt_tabs.css',
	'meeting_map.css',
];
let LeafletCssFiles = [
	'leaflet.css',
	'MarkerCluster.css',
	'MarkerCluster.Default.css',
];
let distDir = 'croutonjs/dist';

task('js-files-nojquery', () => {
	return src(jsFilesNoJQueryWithFullPath)
		.pipe(sourcemaps.init())
		.pipe(concat('crouton.nojquery.js'))
		.pipe(dest(distDir))
		.pipe(rename('crouton.nojquery.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write("./"))
		.pipe(dest(distDir))
		.pipe(notify({message:"js-files-nojquery complete", wait: true}));
});
task('jsFilesLeafletMap', () => {
	return src(jsFilesLeafletMapWithFullPath)
		.pipe(sourcemaps.init())
		.pipe(concat('crouton-map.js'))
		.pipe(dest(distDir))
		.pipe(rename('crouton-map.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write("./"))
		.pipe(dest(distDir))
		.pipe(notify({message:"jsFilesLeafletMap complete", wait: true}));
});

task('js-files', () => {
	return src(jsFilesWithJqueryWithFullPath)
		.pipe(sourcemaps.init())
		.pipe(concat('crouton.js'))
		.pipe(dest(distDir))
		.pipe(rename('crouton.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write("./"))
		.pipe(dest(distDir))
		.pipe(notify({message: "js-files complete", wait: true}));
});
let jsFilesGoogleWithFullPath = ['croutonjs/src/js/jquery-3.4.1.min.js'
].concat(jsFilesCroutonWithFullPath)
.concat(jsFilesGoogleMapWithFullPath);
task('js-gmaps-files', () => {
	return src(jsFilesGoogleWithFullPath)
		.pipe(sourcemaps.init())
		.pipe(concat('crouton-gmaps.js'))
		.pipe(dest(distDir))
		.pipe(rename('crouton-gmaps.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write("./"))
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
	for (let cssFile of LeafletCssFiles) {
		cssFilesWithFullPath.push('croutonjs/src/mapDelegates/css/' + cssFile);
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
task('css-core-files', () => {
	let cssFilesWithFullPath = [];
	for (let cssFile of cssFiles) {
		cssFilesWithFullPath.push('croutonjs/src/css/' + cssFile);
	}
	return src(cssFilesWithFullPath)
		.pipe(concat('crouton-core.css'))
		.pipe(dest(distDir))
		.pipe(cleanCSS())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(dest(distDir))
		.pipe(notify({message: "css-core-files complete", wait: true}));
});
task('css-leaflet-files', () => {
	let cssFilesWithFullPath = [];
	for (let cssFile of LeafletCssFiles) {
		cssFilesWithFullPath.push('croutonjs/src/mapDelegates/css/' + cssFile);
	}
	return src(cssFilesWithFullPath)
		.pipe(concat('crouton-leaflet.css'))
		.pipe(cleanCSS())
		.pipe(rename('crouton-leaflet.min.css'))
		.pipe(dest(distDir))
		.pipe(notify({message: "leaflet-css-files complete", wait: true}));
});
task('themes', function () {
    return src('croutonjs/src/templates/themes/*')
        .pipe(dest('croutonjs/dist/templates/themes'));
});
task('default', series('templates', 'js-files', 'js-gmaps-files', 'js-files-nojquery', 'jsFilesLeafletMap', 'css-files', 'css-core-files', 'css-leaflet-files', 'themes'));
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
