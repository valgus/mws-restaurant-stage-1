/*eslint-env node */

var gulp = require('gulp');
const babel = require('gulp-babel');
let cleanCSS = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine-phantom');
var uglify = require('gulp-uglify-es').default;
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['copy-html', 'copy-images', 'styles', 'scripts'], function() {
	gulp.watch('sass/**/*.scss', ['styles']);
	gulp.watch('js/**/*.js', ['lint']);
	gulp.watch('/index.html', ['copy-html']);
	gulp.watch('./dist/index.html').on('change', browserSync.reload);

	browserSync.init({
		server: './dist'
	});
});

gulp.task('dist', [
	'copy-html',
	'copy-images',
	'styles',
	'scripts-dist',
	'idb-uglify'
]);

gulp.task('scripts', function() {
	gulp.src('js/**/*.js')
		.pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
	gulp.src('js/**/*.js')
    .pipe(sourcemaps.init())
		// .pipe(babel({
    //     presets: ['es2015']
    // }))
		.pipe(uglify())
    .pipe(sourcemaps.write('../maps'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
	gulp.src('./*.html')
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
	gulp.src('img/*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
	return gulp.src('css/*.css')
		.pipe(concat('all.css'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/css'));
});


gulp.task('idb-uglify', function() {
	gulp.src('node_modules/idb/lib/idb.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});
