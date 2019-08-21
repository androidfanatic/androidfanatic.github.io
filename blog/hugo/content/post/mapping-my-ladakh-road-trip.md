---
title: "Mapping My Ladakh Road Trip"
date: 2019-08-21T23:30:51+05:30
draft: false
---

Back in May, I went on a week long road trip with two of my friends and we clicked a ton of photos along the way. The goal of this exercise is to visualize those photos on a interactive map.

<figure style="width: 75%; margin: auto; display: block; margin-bottom: 8px;">
  <img src="/img/08/the_plan.png" title="Image of planned route of the road trip"  >
  <figcaption style="font-size: 11px">
    Planned route starting from Delhi and ending at Pangong Lake.
  <figcaption>
</figure>

I started by curating all the photos and dumping them in a directory. The next step is to write a nodejs script to process these files.

To begin with, we will lists all the files in target folder and filters out jpegs. This is done to discard any png or mp4 files in the folder.

```js
const allFiles = fs.readdirSync(path.join(__dirname, 'files'));
const jpegs = allFiles.filter(file => /\.jpe?g$/i.test(file));
```

Next we will parse data out of all the selected jpegs. Given the asynchronous nature of <a href="https://github.com/gomfunkel/node-exif" target="_blank">EXIF</a> data extraction, we will create an array of promises that we'd later resolve using `Promise.all()` to get EXIF data of all these files in an array.

The result of these promises are structured in JSON format, that we'd then use to render the photos back on a map.

```js
// require ExifImage
const ExifImage = require('exif').ExifImage;

const allPromises = jpegs.map(jpeg => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join('files', jpeg);
      ExifImage({ image: filePath }, function (err, exifData) {
        if (err) { reject(err); }
        else if (exifData && exifData.gps 
          && exifData.gps.GPSLatitude
        ) {
          resolve({ jpeg, exifData });
        } else { resolve(); }
      });
    } catch (err) { reject(err); }
  });
});
```

To add these images on a map, we also need to either host the images somewhere and add a link to the JSON or base64 encode the image, include the encoded image in the JSON structure and then serve them on the map using HTML data URLs.

I picked the second approach because of its simplicity and used <a href="https://www.npmjs.com/package/sharp" target="_blank" title="Sharp NPM module">sharp</a> npm module to do so.

Instead of storing encoded values of full size images, we will resize the images to a maximum of 180 pixels using sharp, which works well enough for the visualization.

I also used the command `mogrify -auto-orient *.jpg` to auto orient some of the images in the folder that were oriented incorrectly but had the correct orientation information embedded in their exif data.

The modified script looks something like this:

```js
// require sharp
const sharp = require('sharp');

const allPromises = jpegs.map(jpeg => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join('files', jpeg);
      ExifImage({ image: filePath }, function (err, exifData) {
        if (err) { reject(err); }
        else if (exifData && exifData.gps && exifData.gps.GPSLatitude) {
          sharp(filePath)
            .resize(180)
            .toBuffer()
            .then(data => {
              resolve({
                jpeg,
                exifData,
                img: data.toString('base64')
              });
            }).catch(reject);
        } else { resolve(); }
      });
    } catch (err) { reject(err); }
  });
});
```

Finally we need to wait for all the promises to resolve with an array containing exif information of all images. I used <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all" target="_blank">`Promise.all()`</a> which does just that.

I also wrote two helper functions to convert GPS data from Exif tags into latitude and longitude coordinates. I also used moment.js to parse the date-time of images and convert them into JavaScript timestamp. It worked out well with a bit of timezone correction.

After filtering the array to only include images that have meaningful GPS information
 and also sorting the result by timestamp, we have our final JSON ready to be served on a map.

```js
const moment = require('moment');

Promise.all(allPromises).then(allExifData => {
  const jpegWithCoords = allExifData
    .filter(data => data && data.jpeg && data.img)
    .map(({ jpeg, exifData, img }) => ({
      jpeg,
      coords: exifDataToLngLat(exifData.gps),
      timestamp: moment(
        exifData.exif.CreateDate,
        "YYYY:MM:dd hh:mm:ss"
      ).add(330, 'minutes').valueOf(),
      img,
    })).sort((a, b) => a.timestamp - b.timestamp);
  // write the file
  fs.writeFileSync(
    path.join(__dirname, 'files', 'places.json'),
    JSON.stringify(jpegWithCoords)
  );
}).catch(console.error)
```

Here are the two helper methods:

```js
// convert degree, minutes, seconds
const convertDMSToDD = (degrees, minutes, seconds, direction) => {
  let dd = degrees + (minutes / 60) + (seconds / 3600);
  if (direction === 'S' || direction === 'W') {
    dd *= -1;
  }
  return dd;
}

// convert exif data to lngLat
const exifDataToLngLat = (exifData) => {
  const latDegree = exifData.GPSLatitude[0];
  const latMinute = exifData.GPSLatitude[1];
  const latSecond = exifData.GPSLatitude[2];
  const latDirection = exifData.GPSLatitudeRef;
  const lat = convertDMSToDD(latDegree, latMinute, latSecond, latDirection);

  const lngDegree = exifData.GPSLongitude[0];
  const lngMinute = exifData.GPSLongitude[1];
  const lngSecond = exifData.GPSLongitude[2];
  const lngDirection = exifData.GPSLongitudeRef;
  const lng = convertDMSToDD(lngDegree, lngMinute, lngSecond, lngDirection);
  return { lng, lat };
};
```

Once the JSON is ready, visualizing the data on map is pretty straightforward. Using <a href="https://docs.mapbox.com/mapbox-gl-js/example/custom-marker-icons/" target="_blank">mapbox-gl-js</a> and following snippet, we were able to visualize the data on maps.

```js
fetch('places.json').then(res => res.json()).then(places => {
  places.forEach(place => {
    const el = document.createElement('div');
    el.className = 'marker';
    el.innerText = '📌';
    el.onclick = () => {
      let removed = false;
      el.querySelectorAll('.imageElement').forEach(elem => {
        removed = true;
        elem.remove();
      })
      if (!removed) {
        const imgEl = document.createElement('div');

        imgEl.className = 'imgElement';
        const img = document.createElement('img');
        img.src = 'data:image/jpg;base64,' + place.img;
        const captionEl = document.createElement('p');
        captionEl.innerText = new Date(place.timestamp);

        imgEl.appendChild(img);
        imgEl.appendChild(captionEl);
        el.appendChild(imgEl);
      }
    }
    new mapboxgl.Marker(el)
      .setLngLat(place.coords)
      .addTo(map);
  })
}).catch(console.error);
```

And here's the final interactive map. Click on the pins to view photos and the time when they were taken.

<iframe src="/html/ladakh" style="width: 640px; height: 320px; border: 0px; margin: auto; display: block;"></iframe>

<p style="margin-top: 4px;">
  <a href="/html/ladakh" target="_blank"><strong>Click here to view this map in fullscreen</strong></a>
</p>

In the end, I'd say it was a fun exercise for me to create this app and re-explore these vast cold deserts and picturesque locations, using random photos clicked throughout the road trip. I hope you enjoyed the write-up.

<hr >

Here's the HTML part of this app that renders the map and the pins on map.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset='utf-8' />
  <title>Ladakh 2019</title>
  <meta name='viewport' content='initial-scale=1,maximum-scale=1'>
  <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.js'></script>
  <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v1.2.1/mapbox-gl.css' rel='stylesheet' />
  <style>
    html,
    body {
      margin: 0;
      padding: 0;
      height: 100%;
    }
    #map {
      width: 100%;
      height: 100%;
    }
    .marker {
      width: 12px;
      height: 12px;
      line-height: 12px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      font-size: 16px;
    }
    .imgEl {
      position: absolute;
      top: 0;
      font-size: 10px;
      color: #fff;
      background: rgba(0, 0, 0, 0.5);
      text-align: center;
    }
    .imgEl img {
      max-height: 180px;
    }
  </style>
</head>
<body>
  <div id='map'></div>
  <script>
    const base = 'http://13.126.70.198';
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v10',
      zoom: 6,
      maxZoom: 20,
      center: [76.5762, 33.7782],
      attributionControl: false,
    });
    const popup = new mapboxgl.Popup();
    map.on('load', () => {
      fetch('places.json').then(res => res.json()).then(places => {
        places.forEach(place => {
          const el = document.createElement('div');
          el.className = 'marker';
          el.innerText = '📌';
          el.onclick = () => {
            let removed = false;
            el.querySelectorAll('.imgEl').forEach(elem => {
              removed = true;
              elem.remove();
            })
            if (!removed) {
              const imgEl = document.createElement('div');
              imgEl.className = 'imgEl';
              const img = document.createElement('img');
              img.src = 'data:image/jpg;base64,' + place.img;
              const captionEl = document.createElement('div');
              captionEl.innerText = new Date(place.timestamp).toLocaleString();
              imgEl.appendChild(img);
              imgEl.appendChild(captionEl);
              el.appendChild(imgEl);
            }
          }
          new mapboxgl.Marker(el)
            .setLngLat(place.coords)
            .addTo(map);
        })
      }).catch(console.error);
    });
  </script>
</body>
</html>
```
