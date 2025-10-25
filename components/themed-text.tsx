import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const allStyles = StyleSheet.flatten([styles[type], style]);
  const fontSize = allStyles.fontSize ?? 16;
  const safeMultiplier = fontSize >= 24 ? 1.25 : 1.5;
  const calculatedLineHeight = Math.round(fontSize * safeMultiplier);
  const existingLineHeight = allStyles.lineHeight;
  const finalLineHeight =
    existingLineHeight && existingLineHeight >= fontSize
      ? existingLineHeight
      : calculatedLineHeight;
  return (
    <Text
      style={[
        { color },
        styles[type],
        style,        
        { lineHeight: finalLineHeight },
      ]}
      {...rest}
    />
  );
}


const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});