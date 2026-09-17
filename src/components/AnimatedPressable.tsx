import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface AnimatedPressableProps extends TouchableWithoutFeedbackProps {
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  scaleTo = 0.95,
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: scaleTo,
      useNativeDriver: true,
      friction: 6,
      tension: 120,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
    onPressOut?.(e);
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...rest}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
