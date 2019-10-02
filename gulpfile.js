"use strict";
/*
 Запустите: `  npm install `


 Для начала работы и написания кода, нужно дать команду   ` gulp `


*Все, автообновление работает.
При редактировании любых файлов, браузер будет автоматически обновляться.*


 На JavaScript можно писать используя синтаксис ES6


 Команды для запуска:
- gulp - осуществит сборку проекта для РАБОТЫ, с MAP-файлами
- gulp build   - осуществит сборку проекта для продакшена, появится папка "dist" уровнем выше (ее размещаем на хостинге)


 в папке `app` - находятся файлы для работы. Именно там их нужно РЕДАКТИРОВАТЬ !


*/
var path = {
    dist: {
        html:  'dist/',
        js:    'dist/js',
        css:   'dist/css',
        img:   'dist/img',
		imgwork: 'dist/images',
        fonts: 'dist/fonts',
		libs: 'dist/libs'
    },
    src: {
		html:  'app/*.html',
        js:    'app/js/*.js',
        scss: 'app/sass/**/*.scss',
		css:   'app/css/',
        img:   'app/img/**/*.*',
        imgwork:   'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    watch: {
        html:  'app/*.html',
        js:    'app/js/*.js',
        css:   'app/css/',
        img:   'app/img/**/*.*',
		imgwork:   'app/images/**/*.*',
        fonts: 'app/fonts/**/*.*'
    },
    clean:     'dist'
};

/* подключаем gulp и плагины */
var gulp = require('gulp'), // подключаем Gulp
	sass = require('gulp-sass'), // модуль для компиляции SASS (SCSS) в CSS
	autoprefixer = require('gulp-autoprefixer'), // модуль для автоматической установки автопрефиксов
	browserSync = require('browser-sync').create(), // сервер для работы и автоматического обновления страниц
	useref = require('gulp-useref'), //парсит специфичные блоки и конкатенирует описанные в них стили и скрипты.
	cache = require('gulp-cache'), // модуль для кэширования
	plumber = require('gulp-plumber'), // модуль для отслеживания ошибок
	uglify = require('gulp-uglify'), // модуль для минимизации JavaScript
	sourcemaps = require('gulp-sourcemaps'), // модуль для генерации карты исходных файлов
	cleanCSS = require('gulp-clean-css'), // плагин для минимизации CSS
	minifyCss = require('gulp-minify-css'),
	gulpif = require('gulp-if'),
	imagemin = require('gulp-imagemin'), // плагин для сжатия PNG, JPEG, GIF и SVG изображений
	jpegrecompress = require('imagemin-jpeg-recompress'), // плагин для сжатия jpeg
	pngquant = require('imagemin-pngquant'), // плагин для сжатия png
	del = require('del'),
	replace = require('gulp-string-replace'), //автозамена строк
	rigger = require('gulp-rigger'), // модуль для импорта содержимого одного файла в другой
	runSequence = require('run-sequence'),
	babel = require('gulp-babel'), //преобразование скриптов с поддержкой ES6
	removeHtmlComments = require('gulp-remove-html-comments'); //удаление комментариев в html-файлах


gulp.task('sass', function () {
  return gulp.src(path.src.scss)
  .pipe(plumber()) // для отслеживания ошибок
   .pipe(sourcemaps.init()) // инициализируем sourcemap
   .pipe(sass()) // scss -> css
	.pipe(autoprefixer({overrideBrowserslist: ['last 2 versions'] , cascade: false }))
    .pipe(cleanCSS()) // минимизируем CSS
	.pipe(sourcemaps.write('./')) // записываем sourcemap
    .pipe(gulp.dest(path.src.css))  // выкладывание готовых файлов
	.pipe(browserSync.stream());
});

gulp.task('sass:build', function () {
  return gulp.src(path.src.scss)
  .pipe(plumber()) // для отслеживания ошибок
   .pipe(sass()) // scss -> css
	.pipe(autoprefixer({overrideBrowserslist: ['last 2 versions'] , cascade: false }))
    .pipe(cleanCSS()) // минимизируем CSS
    .pipe(gulp.dest(path.src.css))  // выкладывание готовых файлов
	.pipe(browserSync.stream());
});

gulp.task('build:delhtmlcomm', function () { //удаляем комментрари в PHP (html) 
  return gulp.src('dist/**/*.html')
    .pipe(removeHtmlComments())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
  gulp.watch('app/sass/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/css/*.css', browserSync.reload);
  gulp.watch('app/js/*.js', browserSync.reload);
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: './app'
    });
});

gulp.task('useref', function () { //сжатие всего остального
     gulp.src(path.src.html)
        .pipe(useref())  //парсит специфичные блоки и конкатенирует описанные в них стили и скрипты.
        .pipe(gulpif('*.css', minifyCss({processImport: false})))
        .pipe(gulp.dest('dist'));
});


gulp.task('script', () => {  //сжатие скриптов с поддержкой ES6
    return gulp.src('app/js/**/*')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.js))
});

gulp.task('images', function () {
    gulp.src(path.src.img) // путь с исходниками картинок
        .pipe(cache(imagemin([ // сжатие изображений
		    imagemin.gifsicle({interlaced: true}),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({plugins: [{removeViewBox: false}]})
		])))
        .pipe(gulp.dest(path.dist.img)); // выгрузка готовых файлов
});


gulp.task('browser-sync', function() {
    browserSync.init()
  });


gulp.task('fonts', function () {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest(path.dist.fonts))
});

gulp.task('clean', function () {
	del('dist');
});

gulp.task('build', function (callback) {
	runSequence('clean', 'sass:build', 'useref', 'images', 'fonts', 'script', 'build:delhtmlcomm', callback);
});

gulp.task('default', function (callback) {
	runSequence(['sass', 'browserSync', 'watch'], callback);
});