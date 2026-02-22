/**
 * AppBottomSheet
 *
 * Production-quality bottom sheet powered by @gorhom/bottom-sheet.
 * Features:
 *  - Native gesture-driven drag to dismiss
 *  - Keyboard-aware (moves up when keyboard opens)
 *  - Brand-styled handle + backdrop
 *  - Snap points configurable per use-case
 *  - Dark-mode aware
 *
 * Prerequisites already in project:
 *   react-native-reanimated, react-native-gesture-handler, @gorhom/bottom-sheet
 *
 * Usage:
 *   const sheetRef = useRef<BottomSheetRef>(null);
 *
 *   <AppBottomSheet ref={sheetRef} snapPoints={['40%', '75%']}>
 *     <View>...</View>
 *   </AppBottomSheet>
 *
 *   // Open:  sheetRef.current?.open()
 *   // Close: sheetRef.current?.close()
 */

import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableWithoutFeedback,
    Platform,
} from 'react-native';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView,
    BottomSheetHandle,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useColors } from '../../hooks';
import { useTheme } from '../../contexts';
import { fontFamilies } from '../../theme/typography';

export interface BottomSheetRef {
    open: (index?: number) => void;
    close: () => void;
}

interface AppBottomSheetProps {
    /** Snap points — e.g. ['40%', '75%'] or [300, 500] */
    snapPoints?: (string | number)[];
    /** Sheet title shown in the handle area */
    title?: string;
    /** Children rendered inside the scrollable content area */
    children: React.ReactNode;
    /** Called when sheet is closed */
    onClose?: () => void;
    /** Whether to enable scroll inside the sheet */
    scrollable?: boolean;
    /** Initial snap index (-1 means closed) */
    initialIndex?: number;
}

export const AppBottomSheet = forwardRef<BottomSheetRef, AppBottomSheetProps>(
    (
        {
            snapPoints: snapPointsProp,
            title,
            children,
            onClose,
            scrollable = true,
            initialIndex = -1,
        },
        ref,
    ) => {
        const colors = useColors();
        const { isDark } = useTheme();
        const sheetRef = useRef<BottomSheet>(null);

        const snapPoints = useMemo(() => snapPointsProp ?? ['50%', '85%'], [snapPointsProp]);

        // Expose open/close to parent via ref
        useImperativeHandle(ref, () => ({
            open: (index = 0) => sheetRef.current?.snapToIndex(index),
            close: () => sheetRef.current?.close(),
        }));

        const handleSheetChanges = useCallback(
            (index: number) => {
                if (index === -1) onClose?.();
            },
            [onClose],
        );

        // Backdrop dims & dismisses on tap
        const renderBackdrop = useCallback(
            (props: BottomSheetBackdropProps) => (
                <BottomSheetBackdrop
                    {...props}
                    appearsOnIndex={0}
                    disappearsOnIndex={-1}
                    opacity={0.5}
                    pressBehavior="close"
                />
            ),
            [],
        );

        const handleStyle = {
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
        };

        const handleIndicatorStyle = {
            backgroundColor: isDark ? '#475569' : '#CBD5E1',
            width: 40,
        };

        const Content = scrollable ? BottomSheetScrollView : View;

        return (
            <BottomSheet
                ref={sheetRef}
                index={initialIndex}
                snapPoints={snapPoints}
                onChange={handleSheetChanges}
                backdropComponent={renderBackdrop}
                handleStyle={handleStyle}
                handleIndicatorStyle={handleIndicatorStyle}
                backgroundStyle={{ backgroundColor: colors.card }}
                enablePanDownToClose
                keyboardBehavior={Platform.OS === 'ios' ? 'extend' : 'fillParent'}
                keyboardBlurBehavior="restore"
            >
                {title && (
                    <View style={[styles.titleContainer, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
                    </View>
                )}
                <Content
                    style={scrollable ? styles.scrollContent : styles.viewContent}
                    contentContainerStyle={scrollable ? styles.scrollContentContainer : undefined}
                >
                    {children}
                </Content>
            </BottomSheet>
        );
    },
);

AppBottomSheet.displayName = 'AppBottomSheet';

const styles = StyleSheet.create({
    titleContainer: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    title: {
        fontFamily: fontFamilies.heading,
        fontSize: 17,
        fontWeight: '700',
        textAlign: 'center',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    viewContent: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
});
