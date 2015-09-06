var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache');
var merge = require('merge-stream');

gulp.task('images', function(){
  gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('images/'));
});

gulp.task('fontawesome', function () {
    var fonts = gulp.src('./bower_components/fontawesome/fonts/*')
        .pipe(gulp.dest('./fonts'));

    var css = gulp.src('./bower_components/fontawesome/css/font-awesome.css')
        .pipe(gulp.dest('./css'));

    return merge(fonts, css);
});

gulp.task('scripts', function(){
  return gulp.src([
      'src/js/jquery.min.js',
      'src/js/**/*.js'
  ])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    // .pipe(jshint())
    // .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(babel())
    .pipe(gulp.dest('js/'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('js/'))
});

gulp.task('default', ['scripts', 'images', 'fontawesome']);

gulp.task('watch', function(){
  gulp.watch("src/js/**/*.js", ['scripts']);
  gulp.watch("src/images/**/*", ['images']);
  gulp.watch("bower_components/fontawesome/**/*", ['fontawesome']);
});
