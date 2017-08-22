const gulp = require('gulp'),
      sass = require('gulp-sass'),
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify'),
      sourcemaps = require('gulp-sourcemaps'),
      postcss = require('gulp-postcss'),
      concat = require('gulp-concat'),
      gutil = require('gulp-util');

const autoprefixer = require('autoprefixer');

const child = require('child_process');
const bourbon = require('bourbon').includePaths;


// ===
// CSS
// ===

gulp.task('scss', function scss() {
  gulp.src('_scss/**/main.?(s)css')
    .pipe(sourcemaps.init())
    .pipe(sass({ includePaths: bourbon }))
    .pipe(postcss())
    .pipe(concat('main.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('css'));
});


// ==
// JS
// ==

gulp.task('js', function js () {
  gulp.src('_js/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('js'))
});


// ======
// JEKYLL
// ======

gulp.task('jekyll', function jekyll() {
  const jekyll = child.spawn('jekyll', ['build',
    '--watch',
    '--drafts'
  ]);

  function jekyllLogger(buffer) {
    buffer.toString()
      .split(/\n/)
      .forEach(message => gutil.log(`Jekyll: ${message}`));
  }

  jekyll.stdout.on('data', jekyllLogger);
  jekyll.stderr.on('data', jekyllLogger);
});

gulp.task('build', ['js', 'scss']);
gulp.task('default', ['build', 'jekyll', 'serve']);


// ============
// BROWSER SYNC
// ============

const browserSync = require('browser-sync').create(),
      siteRoot = '_site';

gulp.task('serve', function serve() {
  browserSync.init({
    ui: false,
    open: false,
    notify: false,

    host: '0.0.0.0',
    port: 3000,
    server: {
      baseDir: siteRoot
    }
  });

  gulp.watch('_scss/**/*.?(s)css', ['scss']);
  gulp.watch('css/**/*.?(s)css').on('change', browserSync.reload);

  gulp.watch('_js/**/*.js', ['js']);
  gulp.watch('js/**/*.js').on('change', browserSync.reload);

  gulp.watch('_site/**/*.html').on('change', browserSync.reload);
});
