import React from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { useColors } from '../../hooks';
import { borderRadius } from '../../constants';

interface ProgressBarProps {
    progress: number; // 0 to 1
    height?: number;
    color?: string;
    trackColor?: string;
    style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 6, // Premium look is slightly thinner
    color,
    trackColor,
    style,
}) => {
    const colors = useColors();
    const activeColor = color || colors.primary[500];
    const track = trackColor || colors.neutral[200];

    // Animated width
    const animatedWidth = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: Math.max(0, Math.min(1, progress)),
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const widthInterpolation = animatedWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[
            styles.container, 
            { height, backgroundColor: track }, 
            style
        ]}>
            <Animated.View style={[
                styles.progress, 
                { 
                    width: widthInterpolation,
                    backgroundColor: activeColor
                }
            ]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: borderRadius.full,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
});
