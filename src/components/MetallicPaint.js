import { Platform } from 'react-native';

const MetallicPaint = Platform.select({
  web: () => require('./MetallicPaint.web').default,
  native: () => require('./MetallicPaint.native').default,
})();

export default MetallicPaint;
