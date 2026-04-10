import { Platform } from 'react-native';

const LogoLoop = Platform.select({
  web: () => require('./LogoLoop.web').default,
  native: () => require('./LogoLoop.native').default,
})();

export default LogoLoop;
