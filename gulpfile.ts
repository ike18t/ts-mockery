import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as clean from 'gulp-clean';
import * as runSequence from 'run-sequence';
import * as merge from 'merge2';

gulp.task('build', function() {
    const tsProject = ts.createProject('tsconfig.json');

    const tsResult = tsProject.src()
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest('./definitions')),
        tsResult.js.pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
    ]);
});

gulp.task('clean', function() {
    return gulp.src('dist', { read: false })
        .pipe(clean());
});

gulp.task('default', [], function(cb) {
    runSequence('clean', 'build', cb);
});
