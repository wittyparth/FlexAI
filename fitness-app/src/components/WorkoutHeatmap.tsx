import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useColors } from '../hooks';

// ============================================================
// WORKOUT HEATMAP COMPONENT
// GitHub-style workout activity heatmap.
// Supports: weekly (7 days), monthly (5 weeks), yearly (52 weeks)
// with a tab-style toggle and proper sizing for each context.
// ============================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export type HeatmapRange = 'week' | 'month' | 'year';

interface HeatmapEntry {
    date: string;
    intensity: 0 | 1 | 2 | 3;
}

interface WorkoutHeatmapProps {
    data: HeatmapEntry[];
    mode?: '7day' | 'month'; // legacy - ignored when showToggle=true
    showToggle?: boolean;     // new: show weekly/monthly/yearly tabs
    defaultRange?: HeatmapRange;
    title?: string;
    showLegend?: boolean;
    compact?: boolean;        // compact mode = smaller cells for profile
    containerPaddingH?: number; // horizontal padding context
}

function getIntensityColor(intensity: 0 | 1 | 2 | 3, isDark: boolean): string {
    const paletteDark = ['#1C2538', '#1E3A5F', '#1D4ED8', '#3B82F6'];
    const paletteLight = ['#E8EEF8', '#BFDBFE', '#60A5FA', '#2563EB'];
    return isDark ? paletteDark[intensity] : paletteLight[intensity];
}

const INTENSITY_LABELS = ['Rest', 'Light', 'Moderate', 'Heavy'];
const INTENSITY_COLORS_DARK = ['#1C2538', '#1E3A5F', '#1D4ED8', '#3B82F6'];
const INTENSITY_COLORS_LIGHT = ['#E8EEF8', '#BFDBFE', '#60A5FA', '#2563EB'];

const TABS: { label: string; key: HeatmapRange }[] = [
    { label: 'Weekly', key: 'week' },
    { label: 'Monthly', key: 'month' },
    { label: 'Yearly', key: 'year' },
];

export function WorkoutHeatmap({
    data,
    mode = '7day',
    showToggle = false,
    defaultRange,
    title,
    showLegend = true,
    compact = false,
    containerPaddingH = 32,
}: WorkoutHeatmapProps) {
    const colors = useColors();
    const isDark = !!(
        colors.background === '#0A0E1A' ||
        colors.background?.startsWith('#0') ||
        colors.background?.startsWith('#1')
    );
    const mutedColor = colors.mutedForeground || '#6B7280';
    const textColor = colors.foreground || '#F1F5FF';
    const borderColor = colors.border || '#1F2D45';
    const cardBg = colors.card || '#131C2E';
    const primaryColor = '#3B82F6';

    // Determine initial range from legacy mode prop
    const legacyRange: HeatmapRange = mode === '7day' ? 'week' : 'month';
    const [range, setRange] = useState<HeatmapRange>(defaultRange || legacyRange);
    const activeRange = showToggle ? range : legacyRange;

    // ─── WEEK VIEW (7 days horizontal strip) ───
    if (activeRange === 'week') {
        const last7 = data.slice(-7);
        return (
            <View>
                {showToggle && (
                    <ToggleTabs range={range} setRange={setRange} isDark={isDark} primaryColor={primaryColor} cardBg={cardBg} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
                )}
                {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}
                <View style={styles.sevenDayRow}>
                    {last7.map((entry, idx) => {
                        const d = new Date(entry.date);
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })[0];
                        const isToday = idx === last7.length - 1;
                        const cellColor = getIntensityColor(entry.intensity, isDark);
                        return (
                            <View key={entry.date} style={styles.sevenDayItem}>
                                <View
                                    style={[
                                        styles.sevenDayCell,
                                        { backgroundColor: cellColor },
                                        isToday && { borderColor: primaryColor, borderWidth: 2 },
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.dayLabel,
                                        { color: isToday ? primaryColor : mutedColor },
                                        isToday && { fontWeight: '800' },
                                    ]}
                                >
                                    {dayName}
                                </Text>
                            </View>
                        );
                    })}
                </View>
                {showLegend && <IntensityLegend isDark={isDark} mutedColor={mutedColor} />}
            </View>
        );
    }

    // ─── MONTH VIEW (5 weeks × 7 days) ───
    if (activeRange === 'month') {
        const last35 = data.slice(-35);
        // Pad if needed
        while (last35.length < 35) {
            const padDate = new Date();
            padDate.setDate(padDate.getDate() - last35.length - 1);
            last35.unshift({ date: padDate.toISOString().split('T')[0], intensity: 0 });
        }
        const weeks: HeatmapEntry[][] = [];
        for (let i = 0; i < 35; i += 7) {
            weeks.push(last35.slice(i, i + 7));
        }

        // Calculate available width
        const availableWidth = SCREEN_WIDTH - containerPaddingH - (compact ? 20 : 22);
        const numWeeks = 5;
        const cellGap = compact ? 2 : 3;
        const cellSize = Math.floor((availableWidth - (numWeeks - 1) * cellGap) / numWeeks);

        // Month labels
        const monthLabels: { label: string; weekIndex: number }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, wi) => {
            if (week[0]) {
                const m = new Date(week[0].date).getMonth();
                if (m !== lastMonth) {
                    monthLabels.push({ label: MONTH_NAMES[m], weekIndex: wi });
                    lastMonth = m;
                }
            }
        });

        return (
            <View>
                {showToggle && (
                    <ToggleTabs range={range} setRange={setRange} isDark={isDark} primaryColor={primaryColor} cardBg={cardBg} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
                )}
                {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}

                {/* Month label row */}
                <View style={[styles.monthLabelRow, { gap: cellGap, paddingLeft: compact ? 18 : 22 }]}>
                    {weeks.map((_, wi) => {
                        const ml = monthLabels.find(x => x.weekIndex === wi);
                        return (
                            <View key={wi} style={[styles.monthLabelSlot, { width: cellSize }]}>
                                {ml && <Text style={[styles.monthLabel, { color: mutedColor }]}>{ml.label}</Text>}
                            </View>
                        );
                    })}
                </View>

                {/* Grid */}
                <View style={[styles.gridWrapper, { gap: compact ? 4 : 6 }]}>
                    {/* Day-of-week labels */}
                    <View style={[styles.dowColumn, { width: compact ? 14 : 16 }]}>
                        {WEEKDAY_INITIALS.map((d, i) => (
                            <Text
                                key={i}
                                style={[
                                    styles.dowLabel,
                                    { color: mutedColor, height: cellSize, fontSize: compact ? 8 : 9 },
                                ]}
                            >
                                {d}
                            </Text>
                        ))}
                    </View>
                    {/* Weeks */}
                    <View style={[styles.weeksRow, { gap: cellGap }]}>
                        {weeks.map((week, wi) => (
                            <View key={wi} style={[styles.weekCol, { gap: cellGap }]}>
                                {week.map((entry) => {
                                    const cellColor = getIntensityColor(entry.intensity, isDark);
                                    const isToday = entry.date === new Date().toISOString().split('T')[0];
                                    return (
                                        <View
                                            key={entry.date}
                                            style={[
                                                {
                                                    width: cellSize,
                                                    height: cellSize,
                                                    backgroundColor: cellColor,
                                                    borderRadius: Math.max(2, cellSize * 0.18),
                                                },
                                                isToday && { borderWidth: 1.5, borderColor: primaryColor },
                                            ]}
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>

                {showLegend && <IntensityLegend isDark={isDark} mutedColor={mutedColor} />}
            </View>
        );
    }

    // ─── YEAR VIEW (52 weeks × 7 days, GitHub-style) ───
    const last364 = data.slice(-364);
    while (last364.length < 364) {
        const padDate = new Date();
        padDate.setDate(padDate.getDate() - last364.length - 1);
        last364.unshift({ date: padDate.toISOString().split('T')[0], intensity: 0 });
    }
    const yearWeeks: HeatmapEntry[][] = [];
    for (let i = 0; i < 364; i += 7) {
        yearWeeks.push(last364.slice(i, i + 7));
    }

    // Small cells for year view to fit 52 weeks
    const yearCellGap = 2;
    const yearDowWidth = compact ? 14 : 16;
    const yearAvailWidth = SCREEN_WIDTH - containerPaddingH - yearDowWidth - yearCellGap;
    const yearCellSize = Math.floor((yearAvailWidth - (52 - 1) * yearCellGap) / 52);

    // Month label positions
    const yearMonthLabels: { label: string; weekIndex: number }[] = [];
    let lastYearMonth = -1;
    yearWeeks.forEach((week, wi) => {
        if (week[0]) {
            const m = new Date(week[0].date).getMonth();
            if (m !== lastYearMonth) {
                yearMonthLabels.push({ label: MONTH_NAMES[m], weekIndex: wi });
                lastYearMonth = m;
            }
        }
    });

    return (
        <View>
            {showToggle && (
                <ToggleTabs range={range} setRange={setRange} isDark={isDark} primaryColor={primaryColor} cardBg={cardBg} borderColor={borderColor} textColor={textColor} mutedColor={mutedColor} />
            )}
            {title && <Text style={[styles.title, { color: textColor }]}>{title}</Text>}

            {/* Month labels */}
            <View style={[styles.monthLabelRow, { gap: yearCellGap, paddingLeft: yearDowWidth + yearCellGap }]}>
                {yearWeeks.map((_, wi) => {
                    const ml = yearMonthLabels.find(x => x.weekIndex === wi);
                    return (
                        <View key={wi} style={[styles.monthLabelSlot, { width: yearCellSize }]}>
                            {ml && <Text style={[styles.monthLabel, { color: mutedColor, fontSize: 8 }]}>{ml.label}</Text>}
                        </View>
                    );
                })}
            </View>

            {/* Grid */}
            <View style={[styles.gridWrapper, { gap: yearCellGap }]}>
                <View style={[styles.dowColumn, { width: yearDowWidth }]}>
                    {WEEKDAY_INITIALS.map((d, i) => (
                        <Text
                            key={i}
                            style={[styles.dowLabel, { color: mutedColor, height: yearCellSize, fontSize: 8 }]}
                        >
                            {d}
                        </Text>
                    ))}
                </View>
                <View style={[styles.weeksRow, { gap: yearCellGap }]}>
                    {yearWeeks.map((week, wi) => (
                        <View key={wi} style={[styles.weekCol, { gap: yearCellGap }]}>
                            {week.map((entry) => {
                                const cellColor = getIntensityColor(entry.intensity, isDark);
                                return (
                                    <View
                                        key={entry.date}
                                        style={{
                                            width: yearCellSize,
                                            height: yearCellSize,
                                            backgroundColor: cellColor,
                                            borderRadius: Math.max(1, yearCellSize * 0.2),
                                        }}
                                    />
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>

            {showLegend && <IntensityLegend isDark={isDark} mutedColor={mutedColor} />}
        </View>
    );
}

// ─── TOGGLE TABS ───
function ToggleTabs({
    range, setRange, isDark, primaryColor, cardBg, borderColor, textColor, mutedColor,
}: {
    range: HeatmapRange;
    setRange: (r: HeatmapRange) => void;
    isDark: boolean;
    primaryColor: string;
    cardBg: string;
    borderColor: string;
    textColor: string;
    mutedColor: string;
}) {
    return (
        <View style={[styles.tabRow, { backgroundColor: isDark ? '#0D1526' : '#EEF2FF', borderColor }]}>
            {TABS.map(tab => {
                const isActive = range === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            isActive && { backgroundColor: isDark ? '#1A2540' : '#FFFFFF', borderColor: primaryColor + '60', borderWidth: 1 },
                        ]}
                        onPress={() => setRange(tab.key)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.tabLabel,
                                { color: isActive ? primaryColor : mutedColor, fontWeight: isActive ? '700' : '500' },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function IntensityLegend({ isDark, mutedColor }: { isDark: boolean; mutedColor: string }) {
    const palette = isDark ? INTENSITY_COLORS_DARK : INTENSITY_COLORS_LIGHT;
    return (
        <View style={styles.legend}>
            {([0, 1, 2, 3] as const).map(v => (
                <View key={v} style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendSwatch,
                            { backgroundColor: palette[v], borderWidth: v === 0 ? 1 : 0, borderColor: 'rgba(150,160,180,0.3)' },
                        ]}
                    />
                    <Text style={[styles.legendLabel, { color: mutedColor }]}>{INTENSITY_LABELS[v]}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 15, fontWeight: '700', marginBottom: 12 },

    // Toggle tabs
    tabRow: {
        flexDirection: 'row',
        borderRadius: 10,
        borderWidth: 1,
        padding: 3,
        marginBottom: 14,
        alignSelf: 'stretch',
    },
    tab: {
        flex: 1,
        paddingVertical: 6,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: { fontSize: 12 },

    // Week view
    sevenDayRow: { flexDirection: 'row', gap: 6 },
    sevenDayItem: { flex: 1, alignItems: 'center', gap: 5 },
    sevenDayCell: {
        width: 34,
        height: 34,
        borderRadius: 9,
        borderColor: 'transparent',
        borderWidth: 2,
    },
    dayLabel: { fontSize: 11, fontWeight: '600' },

    // Month/year mode
    monthLabelRow: { flexDirection: 'row', marginBottom: 3 },
    monthLabelSlot: { alignItems: 'flex-start' },
    monthLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.2 },

    gridWrapper: { flexDirection: 'row' },
    dowColumn: { gap: 2 },
    dowLabel: {
        textAlign: 'right',
        fontWeight: '600',
        textAlignVertical: 'center',
    },
    weeksRow: { flexDirection: 'row' },
    weekCol: { flexDirection: 'column' },

    // Legend
    legend: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendSwatch: { width: 11, height: 11, borderRadius: 3 },
    legendLabel: { fontSize: 10, fontWeight: '500' },
});
