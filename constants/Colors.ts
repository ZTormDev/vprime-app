/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#131313';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#e3e3e3',
    background: '#212121',
    card: 'rgba(255,255,255,0.075)',
    cardPress: 'rgba(255,255,255,0.25)',
    tabBar: '#121212',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
  red: {
    color: '#fe5858',
    highlighted: '#ffc1c1',
  },
  text: {
    highlighted: '#39ffca',
    active: '#3af1a2',
    dark: '#145e4b'
  }
};
