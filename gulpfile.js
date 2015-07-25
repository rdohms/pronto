'use strict';

var babel = require("gulp-babel");
var bower = require('gulp-bower');
var concat = require("gulp-concat");
var del = require('del');
var gulp = require('gulp');
var merge = require('merge-stream');
var minify_css = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require("gulp-rename");
var zip = require('gulp-zip');
var bump = require('gulp-bump');
var minimist = require('minimist');
var fs = require('fs');
var buffer = require('vinyl-buffer');
var jscs = require('gulp-jscs');
var jshint = require('gulp-jshint');

var knownOptions = {
  string: ['rel'],
  boolean: ['dev'],
  default: { rel: 'patch', dev: false }
};

var options = minimist(process.argv.slice(2), knownOptions);

var _config_file = "";
var _is_dev_mode = options.dev;

var onError = function(err) {
    console.log(err.toString());
    this.end ? this.end() : this.emit('end');
};

/* ################################################################
 * META TASKS
 * ################################################################ */

gulp.task('default', ['current_mode', 'config:load', 'bower', 'build:js', 'build:css', 'build:html']);

gulp.task('current_mode', function() {
    console.log((_is_dev_mode)? 'Development Mode':'Production Mode');
});

gulp.task('bower', function() {
    return bower();
});

gulp.task('config:load', function() {
    _config_file = (_is_dev_mode)? './config/dev.js' : './config/production.js';

    return gulp.src([_config_file])
        .pipe(rename("config.js"))
        .pipe(gulp.dest('./extension/build/js'));
});

gulp.task('clean', ['clean:js', 'clean:css']);

gulp.task('watch', ['default'], function() {
    gulp.watch('./src/scss/**/*.scss', ['build:css']);
    gulp.watch('./src/**/*.js', ['build:js']);
    gulp.watch('./config/**/*.js', ['build:js']);
    gulp.watch('./src/**/*.html', ['build:html']);
});

/* ################################################################
 * HTML TASKS
 * ################################################################ */

gulp.task('build:html', ['copy:html']);


gulp.task('clean:html', function (cb) {
    del(['./web/html'], cb);
});

gulp.task('copy:html', ['clean:html'], function () {
    gulp.src('./src/html/*')
        .pipe(gulp.dest('./extension/build/html'));
});

/* ################################################################
 * JAVASCRIPT TASKS
 * ################################################################ */

gulp.task('build:js', [
    'lint:js',
    'copy:js',
    'compile:js:fancy-settings',
    'compile:js:popup',
    'compile:js:content',
    'compile:js:options'
]);

gulp.task('lint:js', ['jscs']);

// gulp.task('clean:js', function (cb) {
//     del(['./web/js', './web/assets/js'], cb);
// });

gulp.task('jscs', function() {
    return gulp.src('./src/**/*.js')
        .on('error', onError)
        .pipe(jscs({
            'excludeFiles': ['*-min.js'],
            'esnext': true
        }));
});

// gulp.task('jshint', function() {
//     return gulp.src('./src/**/*.js')
//         .pipe(jshint({esnext: true}))
//         .pipe(jshint.reporter('default'));
// });

gulp.task('copy:js', ['bower', 'config:load'], function () {
    return gulp.src([
        './bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js'
    ]).pipe(gulp.dest('./extension/build/js'));
});

gulp.task("compile:js:content", ['copy:js'], function () {
    return browserify({
                entries: './src/js/pronto-content.js',
                debug: _is_dev_mode
           })
           .transform(babelify)
           .bundle()
           .on('error', onError)
           .pipe(source('pronto-content.js'))
           .pipe(buffer())
           .pipe(sourcemaps.init({ loadMaps: true}))
           .pipe(sourcemaps.write("."))
           .pipe(gulp.dest("extension/build/js"));
});

gulp.task("compile:js:popup", ['copy:js'], function () {
    return browserify({
                entries: './src/js/pronto-popup.js',
                debug: _is_dev_mode
           })
           .transform(babelify)
           .bundle()
            .on('error', onError)
           .pipe(source('pronto-popup.js'))
           .pipe(buffer())
           .pipe(sourcemaps.init({ loadMaps: true}))
           .pipe(sourcemaps.write("."))
           .pipe(gulp.dest("extension/build/js"));
});

gulp.task("compile:js:options", ['copy:js'], function () {
    return browserify({
                entries: './src/js/pronto-options.js',
                debug: _is_dev_mode
           })
           .transform(babelify)
           .bundle()
           .on('error', onError)
           .pipe(source('pronto-options.js'))
           .pipe(buffer())
           .pipe(sourcemaps.init({ loadMaps: true}))
           .pipe(sourcemaps.write("."))
           .pipe(gulp.dest("extension/build/js"));
});

gulp.task('compile:js:fancy-settings', ['copy:js'], function() {
    return gulp.src([
        './bower_components/fancy-settings/source/lib/**/*.js',
        './bower_components/fancy-settings/source/js/**/*.js'
    ])
    .pipe(concat('fancy-settings.js'))
    .pipe(gulp.dest('extension/build/js'))
});

/* ################################################################
 * SCSS/CSS TASKS
 * ################################################################ */

gulp.task('build:css', ['copy:css', 'scss', 'minify:css', 'fontawesome']);

gulp.task('fontawesome', ['bower', 'scss'], function () {
    var fonts = gulp.src('./bower_components/fontawesome/fonts/*')
        .pipe(gulp.dest('./extension/build/fonts'));

    var css = gulp.src('./bower_components/fontawesome/css/font-awesome.css')
        .pipe(gulp.dest('./extension/build/css'));

    return merge(fonts, css);
});

gulp.task('copy:css', ['bower', 'config:load'], function () {
    return gulp.src([
        './bower_components/fancy-settings/source/lib/default.css',
        './bower_components/fancy-settings/source/css/main.css',
        './bower_components/fancy-settings/source/css/setting.css'
    ])
    .pipe(concat('fancy-settings.css'))
    .pipe(gulp.dest('./extension/build/css'));
});

gulp.task('clean:css', function (cb) {
    del(['./extension/build/css'], cb);
});


gulp.task('scss', ['bower', 'clean:css'], function () {
    var stream = gulp.src([
        './src/scss/popup.scss',
        './src/scss/injected.scss',
        './src/scss/options.scss'
        ])
        .on('error', onError);

    if (_is_dev_mode) {
        stream = stream.pipe(sourcemaps.init());
    }

    stream = stream.pipe(sass({
        precision: 8
    }));

    if (_is_dev_mode) {
        stream = stream.pipe(sourcemaps.write());
    }

    stream = stream.pipe(gulp.dest('./extension/build/css'));
    return stream;
});



gulp.task('minify:css', ['scss'], function() {
    if (_is_dev_mode) {
        return;
    }

    return gulp.src('./extension/build/css/*.css')
        .pipe(minify_css({
            keepBreaks:true,
            roundingPrecision: -1
        }))
        .pipe(gulp.dest('./extension/build/css'));
});

/* ################################################################
 * Packaging
 * ################################################################ */
gulp.task('package:build', ['package:bump'], function() {
    if (_is_dev_mode) {
        return;
    }

    var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

    return gulp.src('extension/**/*')
        .pipe(zip('extension' + pkg.version + '.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('package:bump', ['config:load', 'build:js'], function() {
    if (_is_dev_mode) {
        return;
    }

    return gulp.src([
            '*.json',
            'extension/manifest.json'
        ], {base: "."})
        .pipe(bump({type: options.rel}))
        .pipe(gulp.dest('./'));
});
