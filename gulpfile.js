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
var buffer = require('vinyl-buffer');

// var jscs = require('gulp-jscs');
// var jshint = require('gulp-jshint');
//var mocha = require('gulp-mocha');
// var webpack = require('gulp-webpack');

var _is_dev_mode = false;

var onError = function(err) {
    console.log(err.toString());
    this.emit('end');
};

var _config_file = "";

/* ################################################################
 * META TASKS
 * ################################################################ */

gulp.task('default', ['config:load', 'bower', 'build:js', 'build:css', 'build:html']);

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

gulp.task('devmode', function() {
    _is_dev_mode = true;
});

gulp.task('watch', ['devmode', 'default'], function() {
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
    'copy:js',
    'compile:js:popup',
    'compile:js:content',
    'compile:js:options'
]);

// gulp.task('build:js', ['lint:js', /* 'test:js', */ 'copy:js', 'bundle:js']);
// gulp.task('lint:js', ['jscs', 'jshint']);
// gulp.task('test:js', [/*'flow', */ 'mocha']);
//
// gulp.task('clean:js', function (cb) {
//     del(['./web/js', './web/assets/js'], cb);
// });
//
//
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
           .pipe(plumber({
               errorHandler: onError
           }))
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
           .pipe(plumber({
               errorHandler: onError
           }))
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
           .pipe(plumber({
               errorHandler: onError
           }))
           .pipe(source('pronto-options.js'))
           .pipe(buffer())
           .pipe(sourcemaps.init({ loadMaps: true}))
           .pipe(sourcemaps.write("."))
           .pipe(gulp.dest("extension/build/js"));
});
//
// gulp.task('bundle:js', ['bower', 'clean:js'], function () {
//     return gulp.src('./build/js/main.js')
//         .pipe(webpack({
//             output: {
//                 filename: 'main.js'
//             },
//             externals: {
//                 // require("jquery") is external and available
//                 //  on the global var jQuery
//                 "jquery": "jQuery"
//             }
//         }))
//         .pipe(gulp.dest('./web/js'));
// });
//
//
// gulp.task('jscs', function() {
//     return gulp.src('./app/Resources/js/**/*.js')
//         .pipe(plumber({
//             errorHandler: onError
//         }))
//         .pipe(jscs({
//             'excludeFiles': ['*-min.js'],
//         }));
// });
//
//
// gulp.task('jshint', function() {
//     return gulp.src('./app/Resources/js/**/*.js')
//         .pipe(jshint('.jshintrc'))
//         .pipe(jshint.reporter('default'));
// });
//
//
// //gulp.task('mocha', function(cb) {
//     //return gulp.src('./test/mocha/*.js', {read: false})
//         //.pipe(mocha({reporter: 'mocha-silent-reporter'}));
// //});
//

/* ################################################################
 * SCSS/CSS TASKS
 * ################################################################ */

gulp.task('build:css', ['scss', 'minify:css', 'fontawesome']);


gulp.task('fontawesome', ['bower', 'scss'], function () {
    var fonts = gulp.src('./bower_components/fontawesome/fonts/*')
        .pipe(gulp.dest('./extension/build/fonts'));

    var css = gulp.src('./bower_components/fontawesome/css/font-awesome.css')
        .pipe(gulp.dest('./extension/build/css'));

    return merge(fonts, css);
});


gulp.task('clean:css', function (cb) {
    del(['./extension/build/css'], cb);
});


gulp.task('scss', ['bower', 'clean:css'], function () {
    var stream = gulp.src([
        './src/scss/popup.scss',
        './src/scss/injected.scss'
        ])
        .pipe(plumber({
            errorHandler: onError
        }));

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
