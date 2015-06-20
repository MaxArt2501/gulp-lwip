gulp-lwip
=========

[Gulp.js](http://gulpjs.com/) plugin wrapping [lwip](https://github.com/EyalAr/lwip) image manipulation library.

## Installation

You'll probably use this plugin together with gulp.js as build tool/task runner:

```bash
npm install --save-dev gulp-lwip
```

## Notes

The strong point of `lwip` is that it allows to manipulate images without external dependencies like ImageMagick or similar. However, this doesn't mean you won't need anything else: during the installation, source files will be compiled using [`node-gyp`](https://github.com/TooTallNate/node-gyp), which means Python and a C++ compiler will be used. In particular, Windows installations will need Visual Studio 2013 at least.

See `node-gyp`'s page for more informations.

## Usage

```js
var lwip = require("gulp-lwip");

gulp.src("./src/images/*.jpg")
    .pipe(lwip
        .scale(.5)
        .exportAs("png")
    )
    .pipe(gulp.dest("./assets/img/"));
```

`gulp-lwip`'s usage is similar to `lwip`'s in [batch mode](https://github.com/EyalAr/lwip#usage), chaining the desired filters one after the other, together with their parameters. Basically every processing filter can be used like that (`resize`, `blur`, `saturate` and so on). `paste` is unsupported at the moment. Check `lwip`'s documentation to further informations.

Getters like `width` or `getPixel` are, of course, not supported, while `writeFile` and `toBuffer` are replaced by `exportAs(format, parameters)`. `format` can be one of the formats accepted by lwip (i.e., `"jpg"`, `"png"` or `"gif"`), or `null`, meaning that the original format is used; the optional argument `parameters` is a plain object meant to provide specific parameters when outputting the image file. `exportAs` might *not* be the last method in the call chain.

## Tests

Tests are performed using [mocha](http://mochajs.org/). Execute `npm run test` after installing the development dependencies, or just `mocha` if you have a compatible version installed globally.

## License

MIT. See [LICENSE](LICENSE) for details.
