var minifyJS   = require( 'gulp-uglify' ) ,
    minifyCSS  = require( 'gulp-minify-css' ) ,
    minifyHTML = require( 'gulp-htmlmin' ) ,
    newer      = require('gulp-newer') ;

module.exports = main;

main.minifyJs = minifyJS;
main.minifyCss = minifyCSS;
main.minifyHtml = minifyHTML;

/**
 * @params {Gulp} gulp - 要附加任务的 gulp 对象，例如 require('gulp')
 * @params {Object} [options] - 设置
 * @params {String} [options.src] - 根目录
 * @params {String} [options.dest] - 目标目录
 *
 * @params {String|String[]} [options.copyFiles] - glob 表达式，匹配所有需要复制到目标文件夹的文件
 * @params {String|String[]} [options.jsFiles] - glob 表达式，匹配所有需要精简的 js 文件
 * @params {String|String[]} [options.cssFiles] - glob 表达式，匹配所有需要精简的 css 文件
 * @params {String|String[]} [options.htmlFiles] - glob 表达式，匹配所有需要精简的 html 文件
 *
 * @params {String|Boolean} [options.copyTaskName] - 执行复制操作的任务名字。设为 false 则不会创建这个任务。
 * @params {String|Boolean} [options.compressHtmlTaskName] - 精简 html 文件的任务的名字。设为 false 则不会创建这个任务。
 * @params {String|Boolean} [options.compressCssTaskName] - 精简 css 文件的任务的名字。设为 false 则不会创建这个任务。
 * @params {String|Boolean} [options.compressJsTaskName] - 精简 js 文件的任务的名字。设为 false 则不会创建这个任务。
 * @params {String|Boolean} [options.compress] - 组合上面四个操作的任务的名字。设为 false 则不会创建这个任务。
 */
function main( gulp , options ) {
    var options              = options || {} ,
        src                  = options.src || '.' ,
        dest                 = options.dest || 'dist' ,

        copyFiles            = options.copyFiles || src + '/**/*.{eot,svg,ttf,woff,jpg,png,gif,bmp}' ,
        jsFiles              = options.jsFiles || src + '/**/*.js' ,
        cssFiles             = options.cssFiles || src + '/**/*.css' ,
        htmlFiles            = options.htmlFiles || src + '/**/*.html' ,

        copyTaskName         = options.copyTaskName || 'copy' ,
        compressHtmlTaskName = options.compressHtmlTaskName || 'compress-html' ,
        compressCssTaskName  = options.compressCssTaskName || 'compress-css' ,
        compressJsTaskName   = options.compressJsTaskName || 'compress-js' ,
        compressTaskName     = options.compressTaskName || 'compress';

    copyTaskName && gulp.task( copyTaskName , function () {
        return copy();
    } );

    compressHtmlTaskName && gulp.task( compressHtmlTaskName , function () {
        return compressHtml();
    } );

    compressCssTaskName && gulp.task( compressCssTaskName , function () {
        return compressCss();
    } );

    compressJsTaskName && gulp.task( compressJsTaskName , function () {
        return compressJs();
    } );

    compressTaskName && copyTaskName && compressHtmlTaskName && compressCssTaskName && compressJsTaskName && gulp.task( compressTaskName , [
        copyTaskName , compressHtmlTaskName , compressCssTaskName , compressJsTaskName
    ] );

    function compressJs( path , myDest ) {
        return gulp.src( path || jsFiles )
            .pipe( minifyJS() )
            .pipe( gulp.dest( myDest || dest ) );
    }

    function compressCss( path , myDest ) {
        return gulp.src( path || cssFiles )
            .pipe( minifyCSS() )
            .pipe( gulp.dest( myDest || dest ) );
    }

    function compressHtml( path , myDest ) {
        return gulp.src( path || htmlFiles , { base : src } )
            .pipe( minifyHTML( {
                removeComments : true ,
                collapseWhitespace : true
            } ) )
            .pipe( gulp.dest( myDest || dest ) );
    }

    function copy( path , myDest ) {
        return gulp.src( path || copyFiles )
            .pipe(newer( myDest || dest ))
            .pipe( gulp.dest( myDest || dest ) );
    }

    return {
        copy : copy ,
        compressHtml : compressHtml ,
        compressCss : compressCss ,
        compressJs : compressJs ,
        compress : function ( cb ) {
            parallel( [ compressCss , compressHtml , compressJs , copy ] , cb );
        }
    }
}

/**
 * 平行执行多个任务
 * @param {Function[]} tasks - 任务数组
 * @param {Function} [cb] - 全部任务都完成的回调函数，可选。
 */
function parallel( tasks , cb ) {
    var count = 0 , all = tasks.length;

    tasks.forEach( function ( func ) {
        func().on( 'finish' , done );
    } );

    function done() {
        count += 1;
        if ( count === all ) {
            cb && cb();
        }
    }
}
