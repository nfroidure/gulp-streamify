var Stream = require('stream')
  , gutil = require('gulp-util')
;

const PLUGIN_NAME = 'gulp-stream';

// Plugin function
function streamifyGulp(pluginStream) {

  var stream = Stream.Transform({objectMode: true});

  // Threat incoming files
  stream._transform = function(file, unused, done) {
     // When null just pass out
    if(file.isNull()) {
      stream.push(file); done();
      return;
    }
    // When buffer pass through the plugin
    if(file.isBuffer()) {
      stream.push(file); done();
      return;
    }

    // Wrap the stream
    var originalStream = file.contents
      , buf = new Buffer()
      , bufstream = new Stream.Writable()
      , newStream = new Stream.Readable()
    ;

    // Pending while no full buffer
    newStream._read = function() {
      newStream.push('');
    };

    // Buffer the stream
    bufstream._write = function(chunk, encoding, cb) {
      buf = Buffer.concat([buf, chunk], buf.length + chunk.length);
      cb();
    };

    // When buffered
    bufstream.on('finish', function(cb) {
      // Prepare to catch back the file
      pluginStream.once('data', function(file) {
        // Write the buffer only when datas are needed
        newStream._read = function() {
          // Write the content back to the stream
          newStream.push(file.contents);
          newStream.push(null);
        };
        // Pass the file out
        file.contents = newStream;
        stream.push(file);
        done();
      });
      // Send the buffer wrapped in a file
      file.contents = buf;
      pluginStream.write(file);
      cb();
    });

    originalStream.pipe(bufstream);

  };

  return stream;

}

// Export the plugin main function
module.exports = streamifyGulp;

