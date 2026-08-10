/**
 * The project had no Babel config at all, which is why the app crashed on
 * launch with `Property 'SyntheticError' doesn't exist`: React Native ships
 * its own source as ESM + Flow and depends on this preset to transform it, so
 * every named import out of `react-native` resolved to `undefined`.
 *
 * `react-native-worklets/plugin` is what Reanimated 4 needs to turn a worklet
 * into something the UI thread can run — the streak toast, the like burst and
 * the welcome screen's swipe all go through it — and it has to stay last.
 */
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-worklets/plugin"],
  };
};
