import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {easeIn, easeOut} from '../src/ol/easing.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';

// Pre-project landmark cities to Web Mercator coordinates
// 预先将欧洲主要城市经纬度转为 Web 墨卡托投影坐标
const london = fromLonLat([-0.12755, 51.507222]);
const moscow = fromLonLat([37.6178, 55.7517]);
const istanbul = fromLonLat([28.9744, 41.0128]);
const rome = fromLonLat([12.5, 41.9]);
const bern = fromLonLat([7.4458, 46.95]);

const view = new View({
  center: istanbul,
  zoom: 6,
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      preload: 4, // Preload 4 levels of tiles to prevent blank flash during fast animation / 预加载4层瓦片消除高速动画时的白屏闪烁
      source: new OSM(),
    }),
  ],
  view: view,
});

// A bounce easing method (from https://github.com/DmitryBaranovskiy/raphael).
// 经典弹跳缓动函数（弹跳回落模拟）
function bounce(t) {
  const s = 7.5625;
  const p = 2.75;
  let l;
  if (t < 1 / p) {
    l = s * t * t;
  } else {
    if (t < 2 / p) {
      t -= 1.5 / p;
      l = s * t * t + 0.75;
    } else {
      if (t < 2.5 / p) {
        t -= 2.25 / p;
        l = s * t * t + 0.9375;
      } else {
        t -= 2.625 / p;
        l = s * t * t + 0.984375;
      }
    }
  }
  return l;
}

// An elastic easing method (from https://github.com/DmitryBaranovskiy/raphael).
// 经典弹性衰减缓动函数（弹簧摆动阻尼模拟）
function elastic(t) {
  return (
    Math.pow(2, -10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1
  );
}

function onClick(id, callback) {
  document.getElementById(id).addEventListener('click', callback);
}

// 1. Clockwise / Counterclockwise rotation animations
// 顺时针与逆时针旋转 90 度动画
onClick('rotate-left', function () {
  view.animate({
    rotation: view.getRotation() + Math.PI / 2,
  });
});

onClick('rotate-right', function () {
  view.animate({
    rotation: view.getRotation() - Math.PI / 2,
  });
});

// 2. Rotate 360 around a specific geographic anchor point (Rome)
// 绕指定地理锚点（罗马）旋转整整 360 度（分为两个 180 度连续执行，避免最短弧度抵消）
onClick('rotate-around-rome', function () {
  // Rotation animation takes the shortest arc, so animate in two parts
  const rotation = view.getRotation();
  view.animate(
    {
      rotation: rotation + Math.PI,
      anchor: rome,
      easing: easeIn,
    },
    {
      rotation: rotation + 2 * Math.PI,
      anchor: rome,
      easing: easeOut,
    },
  );
});

// 3. Smooth pan to London with default easing
// 使用默认缓动平滑平移至伦敦
onClick('pan-to-london', function () {
  view.animate({
    center: london,
    duration: 2000,
  });
});

// 4. Elastic oscillation pan to Moscow
// 使用弹性缓动平移至莫斯科
onClick('elastic-to-moscow', function () {
  view.animate({
    center: moscow,
    duration: 2000,
    easing: elastic,
  });
});

// 5. Bounce pan to Istanbul
// 使用弹跳缓动平移至伊斯坦布尔
onClick('bounce-to-istanbul', function () {
  view.animate({
    center: istanbul,
    duration: 2000,
    easing: bounce,
  });
});

// 6. Spin and travel to Rome
// 旋转并前移至罗马
onClick('spin-to-rome', function () {
  // Rotation animation takes the shortest arc, so animate in two parts
  const center = view.getCenter();
  view.animate(
    {
      center: [
        center[0] + (rome[0] - center[0]) / 2,
        center[1] + (rome[1] - center[1]) / 2,
      ],
      rotation: Math.PI,
      easing: easeIn,
    },
    {
      center: rome,
      rotation: 2 * Math.PI,
      easing: easeOut,
    },
  );
});

/**
 * FlyTo flight animation: combines pan with two-stage zoom out and zoom in.
 * 飞行模拟动画：平移中心点，同时并发执行“先缩小高度拉高巡航、后放大降落目标”的两阶段变焦。
 * @param {Array<number>} location Target coordinates.
 * @param {function(boolean):void} done Completion callback.
 */
function flyTo(location, done) {
  const duration = 2000;
  const zoom = view.getZoom();
  let parts = 2;
  let called = false;
  function callback(complete) {
    --parts;
    if (called) {
      return;
    }
    if (parts === 0 || !complete) {
      called = true;
      done(complete);
    }
  }
  // Pan to target location
  // 轨迹中心点平移
  view.animate(
    {
      center: location,
      duration: duration,
    },
    callback,
  );
  // Two-stage zoom: zoom-1 during first half, zoom during second half
  // 两阶段变焦：前半段 zoom-1 升高视野，后半段 zoom 俯冲击中
  view.animate(
    {
      zoom: zoom - 1,
      duration: duration / 2,
    },
    {
      zoom: zoom,
      duration: duration / 2,
    },
    callback,
  );
}

onClick('fly-to-bern', function () {
  flyTo(bern, function () {});
});

/**
 * Automatic tour: iterates through cities with sequential flyTo animations.
 * 自动巡检漫游：依次递归调用 flyTo 串联多个目标城市。
 */
function tour() {
  const locations = [london, bern, rome, moscow, istanbul];
  let index = -1;
  function next(more) {
    if (more) {
      ++index;
      if (index < locations.length) {
        const delay = index === 0 ? 0 : 750;
        setTimeout(function () {
          flyTo(locations[index], next);
        }, delay);
      } else {
        alert('Tour complete / 巡视漫游已完成');
      }
    } else {
      alert('Tour cancelled / 巡视已被打断取消');
    }
  }
  next(true);
}

onClick('tour', tour);
