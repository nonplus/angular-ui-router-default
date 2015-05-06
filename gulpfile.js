var gulp = require('gulp');
var bump = require('gulp-bump');

// Update bower and npm at once:
gulp.task('bump', function(){
	gulp.src(['./bower.json', './package.json'])
		.pipe(bump({type:'patch'}))
		.pipe(gulp.dest('./'));
});
