/**
 * Toast Context
 *
 * Usage anywhere in the app:
 *   const { showToast } = useToast();
 *   showToast({ message: 'Workout saved!', type: 'success' });
 */

import React, { createContext, useCallback, useContext, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ToastItem, ToastConfig, ToastType } from '../components/ui/Toast';

interface ShowToastOptions {
    message: string;
    type?: ToastType;
    duration?: number;
}

interface ToastContextValue {
    showToast: (opts: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue>({
    showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastConfig[]>([]);

    const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ShowToastOptions) => {
        const id = `${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Overlay container — sits above everything */}
            <View style={styles.overlay} pointerEvents="none">
                {toasts.map((toast, index) => (
                    <ToastItem
                        key={toast.id}
                        {...toast}
                        onDismiss={dismissToast}
                    />
                ))}
            </View>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 9999,
        // Allow touches through — pointerEvents="none" on View handles this
    },
});
