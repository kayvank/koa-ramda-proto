import gulp from 'gulp'
import eslint from 'gulp-eslint'
import del from 'del'
import cache from 'gulp-cached'
import watch from 'gulp-watch'
import babel from 'gulp-babel'
import concat from 'gulp-concat'
import gutil from 'gulp-util'
import jsImport from 'gulp-js-import'
import flow from 'gulp-flowtype'
import ava from 'gulp-ava'
const plumber = require('gulp-plumber')
const exec = require('child_process').exec
const paths = {
  src: ['src/**/*.+(js|jsx|es6)'],
  test: ['test/**/*.+(js|jsx|es6)'],
  dist_src: 'build'
}

gulp.task('clean', () => del(paths.dist_src))

gulp.task('lint-test', () =>
  gulp
    .src(paths.test)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
)

gulp.task('lint-src', () =>
  gulp
    .src(paths.src)
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
)

gulp.task('lint', gulp.parallel('lint-src', 'lint-test'))

gulp.task(
  'build',
  gulp.series('clean', 'lint', () =>
    gulp
      .src(paths.src)
      .pipe(plumber())
      .pipe(babel())
      .pipe(flow())
      .pipe(gulp.dest(paths.dist_src))
  )
)

gulp.task('test', () =>
  gulp
    .src(paths.test)
    .pipe(flow())
    .pipe(babel())
    .pipe(ava({ verbose: true }))
)

gulp.task('dist', gulp.series('build', 'test'))

gulp.task('default', gulp.series('dist'))

gulp.task('watch', () =>
  gulp.watch(paths.src.concat(paths.test), gulp.parallel('default'))
)

gulp.task('watch-test', () =>
  gulp.watch(paths.src.concat(paths.test), gulp.parallel('test'))
)
