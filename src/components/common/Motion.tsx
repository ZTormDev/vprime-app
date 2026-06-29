import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

type AnimatedEntranceProps = {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedEntrance({
  children,
  delay = 0,
  distance = 10,
  duration = 260,
  style,
}: AnimatedEntranceProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [delay, distance, duration, opacity, translateY]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

type AnimatedPressableProps = PressableProps & {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

type AnimatedPulseProps = {
  style?: StyleProp<ViewStyle>;
  minOpacity?: number;
  maxOpacity?: number;
  duration?: number;
};

type IdleDeadline = {
  didTimeout: boolean;
  timeRemaining: () => number;
};

type IdleCallbackHandle = number | ReturnType<typeof setTimeout>;
type IdleGlobal = typeof globalThis & {
  requestIdleCallback?: (
    callback: (deadline: IdleDeadline) => void,
    options?: { timeout?: number }
  ) => IdleCallbackHandle;
  cancelIdleCallback?: (handle: IdleCallbackHandle) => void;
};

export function runWhenIdle(callback: () => void, timeout = 120) {
  const idleGlobal = globalThis as IdleGlobal;

  if (typeof idleGlobal.requestIdleCallback === "function") {
    const handle = idleGlobal.requestIdleCallback(() => callback(), { timeout });
    return () => idleGlobal.cancelIdleCallback?.(handle);
  }

  const handle = setTimeout(callback, Math.min(timeout, 32));
  return () => clearTimeout(handle);
}

export function AnimatedPulse({
  style,
  minOpacity = 0.45,
  maxOpacity = 1,
  duration = 1400,
}: AnimatedPulseProps) {
  const opacity = useRef(new Animated.Value(maxOpacity)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: minOpacity,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: maxOpacity,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 0.92,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [duration, maxOpacity, minOpacity, opacity, scale]);

  return <Animated.View style={[style, { opacity, transform: [{ scale }] }]} />;
}

export function AnimatedPressable({
  children,
  contentStyle,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  style,
  ...props
}: AnimatedPressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateScale = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = typeof style === "function" ? undefined : style;

  return (
    <Animated.View style={[animatedStyle, { transform: [{ scale }] }]}>
      <Pressable
        {...props}
        onPressIn={(event) => {
          animateScale(pressedScale);
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          animateScale(1);
          onPressOut?.(event);
        }}
        style={typeof style === "function" ? style : [styles.pressableFill, contentStyle]}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressableFill: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
});
