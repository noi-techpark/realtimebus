var gulp = require('gulp');
var concat = require('gulp-concat');  
var order = require('gulp-order');  
var minify = require('gulp-minify');
var rename = require('gulp-rename');  
var uglify = require('gulp-uglify');
var jsFiles = [
		'js/OpenLayers/proj4js.min.js',
		'js/moment-with-locales.min.js',
		'js/detect_device.js',
		'js/sasabus.js',
		'js/apiedi.js',
		'js/bus.js',
        	'js/i18n.js',
		'js/integreen.js',
  		'js/echarging.js',
		'js/bikesharing.js',
	        'js/carsharing.js',
	        'js/carpooling.js',
		'js/init.js',
		'js/radialProgress.js',
		'js/utility.js',
];  
    jsDest = 'scripts';
 
gulp.task('compress', function() {
    gulp.src(jsFiles)
    .pipe(order(jsFiles, { base: './' }))
    .pipe(concat('scripts.js'))
    .pipe(uglify({
	preserveComments:'all'
    }))
    .pipe(gulp.dest(jsDest))
});
