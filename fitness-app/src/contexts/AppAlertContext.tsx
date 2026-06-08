import React, { createContext, useContext, useCallback, useRef, useState } from 'react';
import { CustomAlert } from '../components/ui/CustomAlert';
import type { AppModalConfig, AlertButton, AlertType } from '../components/ui/CustomAlert';

// ─── Re-export types ────────────────────────────────────────────────────────
export type { AppModalConfig, AlertButton, AlertType };

// ─── Context ────────────────────────────────────────────────────────────────

interface AppAlertContextValue {
    /**
     * Show a custom alert imperatively — drop-in replacement for Alert.alert.
     *
     * @example
     * // Simple message
     * showAlert({ title: 'Saved', type: 'success' });
     *
     * // Confirmation with callbacks
     * showAlert({
     *   title: 'Delete?', message: 'This cannot be undone.', type: 'error',
     *   buttons: [
     *     { text: 'Cancel', style: 'cancel' },
     *     { text: 'Delete', style: 'destructive', onPress: doDelete },
     *   ],
     * });
     */
    showAlert: (config: AppModalConfig) => void;
    hideAlert: () => void;
}

const AppAlertContext = createContext<AppAlertContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function AppAlertProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AppModalConfig>({ title: '' });

    const showAlert = useCallback((cfg: AppModalConfig) => {
        setConfig(cfg);
        setVisible(true);
    }, []);

    const hideAlert = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <AppAlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <CustomAlert
                visible={visible}
                onDismiss={hideAlert}
                title={config.title}
                message={config.message}
                type={config.type}
                buttons={config.buttons}
            >
                {config.children}
            </CustomAlert>
        </AppAlertContext.Provider>
    );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAppAlert() {
    const ctx = useContext(AppAlertContext);
    if (!ctx) {
        throw new Error('useAppAlert must be used within AppAlertProvider');
    }
    return ctx;
}
