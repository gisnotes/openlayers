/**
 * Demo API tokens used in examples. Running JS keeps `value` so hosted maps
 * work. Displayed source replaces `value` with `cloak`. Optional `examples/.env`
 * entries named `env` override `value` during `vite serve` only.
 */
export const demoTokens = [
  {
    env: 'MAPBOX_KEY',
    value:
      'pk.eyJ1IjoibG92ZXdob2lsb3ZlIiwiYSI6ImNscGV2bjhkZTFmamQya282Yzd0Zm1wazEifQ._J3OPz8jxEimR-uLcLpuug',
    cloak: 'Your Mapbox access token from https://mapbox.com/ here',
  },
  {
    env: 'MAPTILER_KEY',
    value: 'EPhPi7Zr1GTS500UybLu',
    cloak: 'Get your own API key at https://www.maptiler.com/cloud/',
  },
  {
    env: 'THUNDERFOREST_KEY',
    value: 'b978044c6f6f4038887e6b74fad5f99a',
    cloak: 'Your API key from https://www.thunderforest.com/docs/apikeys/ here',
  },
  {
    env: 'NEXTZEN_KEY',
    value: 'uZNs91nMR-muUTP99MyBSg',
    cloak: 'Your Nextzen API key from https://developers.nextzen.org/',
  },
];
