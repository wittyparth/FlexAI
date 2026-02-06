import React from 'react';
import { View, StyleSheet, ViewStyle, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../../hooks';

interface ProgressBarProps {
    progress: number; // 0 to 1
    height?: number;
    style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    height = 8,
    style,
}) => {
    const colors = useColors();

    // Animated width
    const animatedWidth = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(animatedWidth, {
            toValue: progress,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [progress]);

    const widthInterpolation = animatedWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={[styles.container, { height, backgroundColor: colors.border + '30' }, style]}>
            <Animated.View style={[styles.progress, { width: widthInterpolation }]}>
                <LinearGradient
                    colors={[colors.primary.main, '#5ea1ff'] as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradient}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        borderRadius: 4,
    },
    gradient: {
        flex: 1,
    },
});
