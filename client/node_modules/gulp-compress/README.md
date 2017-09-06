# gulp-compress

An easy-to-use module to compress your *.css , *.js and *.html files.

## Install

```
npm install gulp-compress
```

## Usage

```js
var gulp    = require('gulp'),
    options = {
       src: './src',
       dest: './dist'
    };

require('gulp-compress')(gulp, options);
```

There are few tasks added in your gulp:

 + `copy` : Copy files which are match [these glob](https://github.com/lmk123/gulp-compress/blob/master/index.js#L27) to `options.dest`
 + `compress-html`：Compress *.html files which are under `options.src` then output to `options.dest`
 + `compress-css`：Compress *.css files which are under `options.src` then output to `options.dest`
 + `compress-js`：Compress *.js files which are under `options.src` then output to `options.dest`
 + `compress`：It's run above tasks parallel.

Now use them like this!

```
gulp compress
```

You may need [gulp-es6-sass](https://www.npmjs.com/package/gulp-es6-sass) else :)
 
## Options

All options and its default value are list on [here](https://github.com/lmk123/gulp-compress/blob/master/index.js#L10). It's really self-explanation.

## API

```js
var gulp = require('gulp'),
     Compress = require('gulp-compress'),
     cps = Compress(gulp);
```

### Compress.minifyJs
Equal to `require('gulp-uglify')`. See more info at [gulp-uglify](https://www.npmjs.com/package/gulp-uglify).

### Compress.minifyHtml
Equal to `require('gulp-htmlmin')`. See more info at [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin).

### Compress.minifyCss
Equal to `require('gulp-minify-css')`. See more info at [gulp-minify-css](https://www.npmjs.com/package/gulp-minify-css).

### cps.copy([globs, dest])

Copy files from `globs` to `dest`.

 + `globs` {String|String[]} - Default value is `options.copyFiles`
 + `dest` {String} - Default value is `options.dest`

### cps.compressJs([globs, dest])

Compress js files from `globs` to `dest`.

 + `globs` {String|String[]} - Default value is `options.jsFiles`
 + `dest` {String} - Default value is `options.dest`
 
### cps.compressCss([globs, dest])

Compress css files from `globs` to `dest`.

 + `globs` {String|String[]} - Default value is `options.cssFiles`
 + `dest` {String} - Default value is `options.dest`

### cps.compressHtml([globs, dest])

Compress html files from `globs` to `dest`.

 + `globs` {String|String[]} - Default value is `options.htmlFiles`
 + `dest` {String} - Default value is `options.dest`
 
### cps.compress([callback])

Equal to `gulp compress`.

 + `callback` {Function}

## License
MIT
