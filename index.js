/*!
 * gulp-lwip
 * https://github.com/MaxArt2501/gulp-lwip
 *
 * Copyright (c) 2015 Massimo Artizzu
 * Licensed under the MIT license.
 */
"use strict";

var lwip = require("lwip"),
    fileType = require("file-type"),
    PluginError = require("gulp-util").PluginError,
    through = require("through2");

function isValidType(type) {
    return ~[ "jpg", "png", "gif" ].indexOf(type);
}

function lwipTask(actions, format, params) {
    var thru = through.obj(function(file, encoding, done) {
        if (file.isNull() || !actions.length && !format && !params) {
            // Nothing to do here
            this.push(file), done();
            return;
        }

        if (file.isBuffer()) {
            try {
                // Buffer mode
                var type = fileType(file.contents);
                if (!type || !isValidType(type.ext)) {
                    // Ignore unsupported files
                    this.push(file), done();
                    return;
                }
                    
                
                if (!actions.length && type.ext === format && !params) {
                    // No actions, and the file format is the same of the original
                    this.push(file), done();
                    return;
                }
                
                lwip.open(file.contents, type.ext, function(err, image) {
                    if (err)
                        return done(new PluginError("gulp-lwip", "Error opening the image: " + err.message));

                    function executeActions(i) {
                        if (i < actions.length) {
                            var action = actions[i][0],
                                args = actions[i].slice(1).concat(function(err, img) {
                                    if (err)
                                        return done(new PluginError("gulp-lwip", "Error processing the image: " + err.message));

                                    image = img;
                                    executeActions(i + 1);
                                });

                            image[action].apply(image, args);
                        } else {
                            image.toBuffer(format || type.ext, params || {}, function(err, buffer) {
                                if (err)
                                    return done(new PluginError("gulp-lwip", "Error writing the image: " + err.message));

                                file.contents = buffer;
                                done(null, file);
                            });
                        }
                    }

                    executeActions(0);
                });
            } catch (e) {
                done(new PluginError("gulp-lwip", e));
            }
        } else if (file.isStream()) {
            // Stream mode - not supported
            done(new PluginError("gulp-lwip", "Stream mode not supported"));
        } else done(new PluginError("gulp-lwip", "Invalid input type"));
    });

    thru.exportAs = function(type, par) {
        if (type != null) {
            type = String(type).toLowerCase();

            if (isValidType(type))
                format = type;
            else throw new PluginError("gulp-lwip", "Invalid image format")
        }
        if (par && typeof par === "object")
            params = par;

        return this;
    };

    var methods = [
        "resize", "scale", "contain", "cover", "rotate", "crop",
        "blur", "sharpen", "mirror", "flip", "border", "pad",
        "saturate", "lighten", "darken", "hue", "fade", "opacity", "setPixel"
    ];
    
    methods.forEach(function(method) {
        thru[method] = function() {
            var action = [ method ].concat([].slice.call(arguments));

            return lwipTask(actions.concat([ action ]), format, params);
        };
    });

    return thru;
}

module.exports = exports = lwipTask([]);
