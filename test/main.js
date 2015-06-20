var File = require("vinyl"),
    expect = require("expect.js"),
    plugin = require("../"),
    lwip = require("lwip"),
    fs = require("fs");

var blackDot = new Buffer("R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=", "base64"), // 1x1 black GIF
    pillars = fs.readFileSync(__dirname + "/pillars-of-creation.jpg"),
    redSquare = new Buffer("iVBORw0KGgoAAAANSUhEUgAAAAQAAAAEAQMAAACTPww9AAAAA1BMVEX/AAAZ4gk3AAAACklEQVQI12OAAgAACAABod4++QAAAABJRU5ErkJggg==", "base64"), // 4x4 red PNG
    loremIpsum = new Buffer("Lorem ipsum dolor sit amet, consectetur adipiscing elit."),
    smallPDF = new Buffer("%PDF-1.\ntrailer<</Root<</Pages<</Kids[<</MediaBox[0 0 3 3]>>]>>>>>>");

describe("gulp-lwip", function() {
    it("should handle jpeg files", function(done) {
        plugin
            .scale(.5)
            .on("data", function(output) {
                expect(output.isBuffer()).to.be(true);
                lwip.open(output.contents, "jpg", function(err, img) {
                    if (err) return done(err);
                    
                    expect(img.width()).to.be(150);
                    done();
                });
            })
            .on("error", done)
            .write(new File({ contents: pillars }));
    });

    it("should handle png files", function(done) {
        plugin
            .saturate(-1)
            .on("data", function(output) {
                lwip.open(output.contents, "png", function(err, img) {
                    if (err) return done(err);
                    
                    var px = img.getPixel(2, 3);
                    expect(px.r).to.be(px.g);
                    expect(px.r).to.be(px.b);
                    done();
                });
            })
            .on("error", done)
            .write(new File({ contents: redSquare }));
    });

    it("should handle gif files", function(done) {
        plugin
            .resize(100, 50)
            .on("data", function(output) {
                lwip.open(output.contents, "gif", function(err, img) {
                    if (err) return done(err);

                    expect(img.height()).to.be(50);
                    done();
                });
            })
            .on("error", done)
            .write(new File({ contents: blackDot }));
    });

    it("should ignore unsopported files", function(done) {
        var processed = 0;
        [ loremIpsum, smallPDF ].forEach(function(buffer) {
            plugin
                .blur(2)
                .on("data", function(output) {
                    processed++;
                    expect(output.contents).to.be(buffer);
                    
                    if (processed === 2) done();
                })
                .write(new File({ contents: buffer }));
        });
    });
});