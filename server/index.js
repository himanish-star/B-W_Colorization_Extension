const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const request = require('request');
const path = require('path');
const PythonShell = require('python-shell').PythonShell;

//command to bring in Caffe into development mode
// export PYTHONPATH=/home/soumya/caffe/python:$PYTHONPATH

const download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    // console.log('content-type:', res.headers['content-type']);
    // console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/images_hosted', express.static(__dirname + '/color_images'));

app.get('/', (req, res) => {
  res.send('API to handle BW colorization requests');
});

app.get('/emptyFolder', (req, res) => {
  const directory = ['color_images'];

  directory.forEach(dir => {
    fs.readdir(dir, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        fs.unlink(path.join(dir, file), err => {
          if (err) throw err;
        });
      }
    });
  });
  console.log('folder clean request');
  res.send('Cleaneed color_images folder');
});

app.post('/colorImages', async (request, response) => {
  const directory = ['bw_images'];

  directory.forEach(dir => {
    fs.readdir(dir, (err, files) => {
      if (err) throw err;
      for (const file of files) {
        fs.unlink(path.join(dir, file), err => {
          if (err) throw err;
        });
      }
    });
  });

  const { imageData } = request.body;
  const downloader = imageData.map(data => {
    return new Promise((res, rej) => {
      download(data.url, 'bw_images/bw-image-' + data.idx + '.png', function() {
        res('bw-image-' + data.idx + '.png');
      });
    });
  });

  const image_tags = await Promise.all(downloader);
  const colorup = image_tags.map(tag => {
    return new Promise((res, rej) => {
      const spawn = require("child_process").spawn;
      const process = spawn("python", ["./colorize.py",
        "-img_in",
        "../bw_images/" + tag,
        "-img_out",
        "../color_images/" + tag,
      ], {
        cwd: './colorization'
      }
      );
      process.stdout.on('data', function (data) {
        console.log('running');
      });

      process.stderr.on('data', function (data) {
        // console.log('under progress');
      });

      process.stderr.on('end', function() {
        console.log('done ' + tag);
        const pathToFile = './color_images/' + tag;
        res('done');
      });

    });
  });

  await Promise.all(colorup);
  let finalResults = [];
  fs.readdirSync('./color_images/').forEach(file => {
    finalResults.push(file);
  });
  response.send(JSON.stringify({m:finalResults}));
});

app.listen(5000, () => {
  console.log("your server has started and the website can be viewed at localhost:5000");
});

// command for colorization
// python ./colorize.py -img_in [[INPUT_IMG_PATH]] -img_out [[OUTPUT_IMG_PATH]]
