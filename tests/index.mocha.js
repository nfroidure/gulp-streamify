var gStreamify = require('../')
  , Stream = require('stream')
  , es = require('event-stream')
  , gutil = require('gulp-util')
  , assert = require('assert')
;

describe('gulp-streamify', function() {

  it('should pass null files through', function(done) {

      var stream = gStreamify(new Stream.PassThrough({objectMode: true}))
        , n = 0
        , fakeFile = new gutil.File({
          cwd: "/home/nfroidure/",
          base: "/home/nfroidure/test",
          path: "/home/nfroidure/test/file.js",
          contents: null
        })
        , fakeFile2 = new gutil.File({
          cwd: "/home/nfroidure/",
          base: "/home/nfroidure/test",
          path: "/home/nfroidure/test/file2.js",
          contents: null
        })
      ;

      stream.on('readable', function() {
        var newFile;
        while(newFile = stream.read()) {
          assert(newFile);
          assert.equal(newFile.cwd, "/home/nfroidure/");
          assert.equal(newFile.base, "/home/nfroidure/test");
          assert.equal(newFile.contents, null);
          if(++n == 1) {
            assert.equal(newFile.path, "/home/nfroidure/test/file.js");
          } else  {
            assert.equal(newFile.path, "/home/nfroidure/test/file2.js");
          }
        }
      });

      stream.on('end', function() {
        assert.equal(n, 2);
        done();
      });

      stream.write(fakeFile);
      stream.write(fakeFile2);
      stream.end();
    
  });

  describe('in stream mode', function() {

    it('should work', function(done) {

      var pluginStream = new Stream.Transform({objectMode: true});

      pluginStream._transform = function(file, unused, cb) {
        assert(file.contents instanceof Buffer);
        // Append some text
        file.contents = Buffer.concat([file.contents, Buffer('test')]);
        pluginStream.push(file);
        cb();
      };

      var stream = gStreamify(pluginStream)
        , n = 0
        , fakeFile = new gutil.File({
          cwd: "/home/nfroidure/",
          base: "/home/nfroidure/test",
          path: "/home/nfroidure/test/file.js",
          contents: new Stream.PassThrough()
        })
        , fakeFile2 = new gutil.File({
          cwd: "/home/nfroidure/",
          base: "/home/nfroidure/test",
          path: "/home/nfroidure/test/file2.js",
          contents: new Stream.PassThrough()
        })
      ;


      stream.on('readable', function() {
        var newFile;
        while(newFile = stream.read()) {
          assert(newFile);
          assert.equal(newFile.cwd, "/home/nfroidure/");
          assert.equal(newFile.base, "/home/nfroidure/test");
          assert(newFile.contents instanceof Stream);
          if(++n == 1) {
            assert.equal(newFile.path, "/home/nfroidure/test/file.js");
            newFile.contents.pipe(es.wait(function(err, data) {
              assert.equal(data, 'plipplaptest');
            }));
          } else  {
            assert.equal(newFile.path, "/home/nfroidure/test/file2.js");
            newFile.contents.pipe(es.wait(function(err, data) {
              assert.equal(data, 'ploppluptest');
            }));
          }
        }
      });

      stream.on('end', function() {
        assert.equal(n, 2);
        done();
      });

      stream.write(fakeFile);
      stream.write(fakeFile2);
      stream.end();

      fakeFile.contents.write('plip');
      fakeFile.contents.write('plap');
      fakeFile.contents.end();

      fakeFile2.contents.write('plop');
        fakeFile2.contents.write('plup');
        fakeFile2.contents.end();

      process.nextTick(function() {
      });

    });

  });

  describe('in buffer mode', function() {

    it('should work', function(done) {

      var pluginStream = new Stream.Transform({objectMode: true});

      pluginStream._transform = function(file, unused, cb) {
        assert(file.contents instanceof Buffer);
        // Append some text
        file.contents = Buffer.concat([file.contents, Buffer('test')]);
        pluginStream.push(file);
        cb();
      };

      var stream = gStreamify(pluginStream)
        , n = 0
        , fakeFile = new gutil.File({
          cwd: "/home/nfroidure/",
          base: "/home/nfroidure/test",
          path: "/home/nfroidure/test/file.js",
          contents: new Buffer('plipplap')
        })
        , fakeFile2 = new gutil.File({
          cwd: "/home/nfroidure/",
          base: "/home/nfroidure/test",
          path: "/home/nfroidure/test/file2.js",
          contents: new Buffer('plipplup')
        })
      ;


      stream.on('readable', function() {
        var newFile;
        while(newFile = stream.read()) {
          assert(newFile);
          assert.equal(newFile.cwd, "/home/nfroidure/");
          assert.equal(newFile.base, "/home/nfroidure/test");
          assert(newFile.contents instanceof Buffer);
          if(++n == 1) {
            assert.equal(newFile.path, "/home/nfroidure/test/file.js");
            assert.equal(newFile.contents.toString(), 'plipplaptest');
          } else  {
            assert.equal(newFile.path, "/home/nfroidure/test/file2.js");
            assert.equal(newFile.contents.toString(), 'plippluptest');
          }
        }
      });

      stream.on('end', function() {
        assert.equal(n, 2);
        done();
      });

      stream.write(fakeFile);
      stream.write(fakeFile2);
      stream.end();

    });

  });

});
