import olms from 'ol-mapbox-style';
import FullScreen from '../src/ol/control/FullScreen.js';

olms(
  'map',
  'https://api.maptiler.com/maps/outdoor-v2/style.json?key=EPhPi7Zr1GTS500UybLu',
).then(function (map) {
  map.addControl(new FullScreen());
});
