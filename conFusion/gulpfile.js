// IMPORTANT javascript strict mode: http://www.w3schools.com/js/js_strict.asp
'use strict';
// import 'gulp plugins' and 'node modules' needed for our gulp tasks
var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync'),
    del = require('del'),
    ngannotate = require('gulp-ng-annotate'),
    debug = require('gulp-debug'), // gulp plugin to add log between 2 pipes
    merge = require('merge-stream');
// jshint
gulp.task('jshint', function() {
  return gulp.src('app/scripts/**/*.js')
             .pipe(jshint())
             .pipe(jshint.reporter(stylish));
});
// Clean
gulp.task('clean', function() {
    return del(['dist']);
});
// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('usemin', 'imagemin', 'copyfonts');
});
// usemin
gulp.task('usemin', ['jshint'], function() {
  /*
  there is a bug in recent gulp-usemin versions which prevents it to be used with many html files:
  it means that it does not work when gulp.src('./app/menu.html') is replaced with gulp.src('./app/*.html')
  - workaround
  use a previous version of gulp-usemin plugin:
  to do so put an "exact" vesion in package.json:
  "gulp-usemin": "0.3.11",
  - reference
  https://www.bountysource.com/issues/27928549-gulp-usemin-task-error
  */
  function doUsemin(srcFile, destDir) {
      return gulp.src(srcFile)
      //.pipe(debug({title: 'src -> usemin:'}))
      .pipe(usemin({
        css: [ minifycss(), rev() ],
        js: [ ngannotate(), uglify(), rev() ],
      }))
      //.pipe(debug({title: 'usemin -> dest:'}))
      .pipe(gulp.dest(destDir));
  }
  // the use of gulp.src('./app/**/*.html') does not keep the 'views' subfolder (even if the gulp.src() 'base' option is used)
  // workaround the task is called twice:
  var stream1 = doUsemin('./app/*.html', 'dist/');
  var stream2 = doUsemin('./app/views/*.html', 'dist/views');
  return merge(stream1, stream2);
});
// Images
gulp.task('imagemin', function() {
  return del(['dist/images']), gulp.src('app/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'))
    // to have a notification popup displayed by the OS:
    //.pipe(notify({ message: 'Images task complete' }))
    ;
});
// copyfonts: cette task copie ttes les fonts de font-awesome et de bootstrap dans notre 'distribution folder'
gulp.task('copyfonts', ['clean'], function() {
   gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
   .pipe(gulp.dest('./dist/fonts'));
   gulp.src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
   .pipe(gulp.dest('./dist/fonts'));
});
// Watch
gulp.task('watch', ['browser-sync'], function() {
  // Watch .js files (ATTENTION do not add spaces inside the curly braces below)
  gulp.watch('{app/scripts/**/*.js,app/styles/**/*.css,app/**/*.html}', ['usemin']);
  // Watch image files
  gulp.watch('app/images/**/*', ['imagemin']);
});
// browser-sync
gulp.task('browser-sync', ['default'], function () {
   var files = [
      'app/**/*.html',
      'app/styles/**/*.css',
      'app/images/**/*.png',
      'app/scripts/**/*.js',
      'dist/**/*'
   ];
   browserSync.init(files, {
      server: {
         baseDir: "dist",
         index: "index.html"
      },
      //port: 8000
   });
   // Watch any files in dist/, reload on change
   gulp.watch(['dist/**']).on('change', browserSync.reload);
});

