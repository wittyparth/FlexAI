import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks';
import { useTheme } from '../contexts';
import { fontFamilies } from '../theme/typography';

// ============================================================
// WORKOUT HEATMAP COMPONENT — Premium Design
// GitHub-style workout activity heatmap with month navigation.
// ============================================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export type HeatmapRange = 'week' | 'month' | 'year';

interface HeatmapEntry {
    date: string;
    intensity: 0 | 1 | 2 | 3;
}

interface WorkoutHeatmapProps {
    data: HeatmapEntry[];
    mode?: '7day' | 'month';
    showToggle?: boolean;
    defaultRange?: HeatmapRange;
    title?: string;
    showLegend?: boolean;
    compact?: boolean;
    containerPaddingH?: number;
}

const INTENSITY_LABELS = ['Rest', 'Light', 'Moderate', 'Heavy'];

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
    const { isDark } = useTheme();
    const heatmap = colors.heatmap;
    const primary = colors.primary.main;

    const legacyRange: HeatmapRange = mode === '7day' ? 'week' : 'month';
    const [range, setRange] = useState<HeatmapRange>(defaultRange || legacyRange);
    const activeRange = showToggle ? range : legacyRange;

    // Month navigation state (for yearly view)
    const today = new Date();
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // null = show all 12

    const getIntensityColor = (intensity: 0 | 1 | 2 | 3): string => {
        return [heatmap.rest, heatmap.light, heatmap.moderate, heatmap.heavy][intensity];
    };

    // ─── WEEK VIEW ───
    if (activeRange === 'week') {
        const last7 = data.slice(-7);
        return (
            <View>
                {showToggle && <ToggleTabs range={range} setRange={setRange} colors={colors} />}
                {title && <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>}
                <View style={styles.sevenDayRow}>
                    {last7.map((entry, idx) => {
                        const d = new Date(entry.date);
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })[0];
                        const isToday = idx === last7.length - 1;
                        const cellColor = getIntensityColor(entry.intensity);
                        return (
                            <View key={entry.date} style={styles.sevenDayItem}>
                                <View
                                    style={[
                                        styles.sevenDayCell,
                                        { backgroundColor: cellColor },
                                        isToday && { borderColor: primary, borderWidth: 2 },
                                    ]}
                                />
                                <Text style={[styles.dayLabel, { color: isToday ? primary : colors.mutedForeground }, isToday && { fontWeight: '800' }]}>
                                    {dayName}
                                </Text>
                            </View>
                        );
                    })}
                </View>
                {showLegend && <IntensityLegend colors={colors} getColor={getIntensityColor} />}
            </View>
        );
    }

    // ─── MONTH VIEW ───
    if (activeRange === 'month') {
        const last35 = data.slice(-35);
        while (last35.length < 35) {
            const padDate = new Date();
            padDate.setDate(padDate.getDate() - last35.length - 1);
            last35.unshift({ date: padDate.toISOString().split('T')[0], intensity: 0 });
        }
        const weeks: HeatmapEntry[][] = [];
        for (let i = 0; i < 35; i += 7) weeks.push(last35.slice(i, i + 7));

        const availableWidth = SCREEN_WIDTH - containerPaddingH - (compact ? 20 : 22);
        const numWeeks = 5;
        const cellGap = compact ? 2 : 3;
        const cellSize = Math.floor((availableWidth - (numWeeks - 1) * cellGap) / numWeeks);

        const monthLabels: { label: string; weekIndex: number }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, wi) => {
            if (week[0]) {
                const m = new Date(week[0].date).getMonth();
                if (m !== lastMonth) {
                    monthLabels.push({ label: MONTH_NAMES_SHORT[m], weekIndex: wi });
                    lastMonth = m;
                }
            }
        });

        return (
            <View>
                {showToggle && <ToggleTabs range={range} setRange={setRange} colors={colors} />}
                {title && <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>}

                <View style={[styles.monthLabelRow, { gap: cellGap, paddingLeft: compact ? 18 : 22 }]}>
                    {weeks.map((_, wi) => {
                        const ml = monthLabels.find(x => x.weekIndex === wi);
                        return (
                            <View key={wi} style={[styles.monthLabelSlot, { width: cellSize }]}>
                                {ml && <Text style={[styles.monthLabel, { color: colors.mutedForeground }]}>{ml.label}</Text>}
                            </View>
                        );
                    })}
                </View>

                <View style={[styles.gridWrapper, { gap: compact ? 4 : 6 }]}>
                    <View style={[styles.dowColumn, { width: compact ? 14 : 16 }]}>
                        {WEEKDAY_INITIALS.map((d, i) => (
                            <Text key={i} style={[styles.dowLabel, { color: colors.mutedForeground, height: cellSize, fontSize: compact ? 8 : 9 }]}>
                                {d}
                            </Text>
                        ))}
                    </View>
                    <View style={[styles.weeksRow, { gap: cellGap }]}>
                        {weeks.map((week, wi) => (
                            <View key={wi} style={[styles.weekCol, { gap: cellGap }]}>
                                {week.map((entry) => {
                                    const cellColor = getIntensityColor(entry.intensity);
                                    const isToday = entry.date === today.toISOString().split('T')[0];
                                    return (
                                        <View
                                            key={entry.date}
                                            style={[
                                                { width: cellSize, height: cellSize, backgroundColor: cellColor, borderRadius: Math.max(2, cellSize * 0.18) },
                                                isToday && { borderWidth: 1.5, borderColor: primary },
                                            ]}
                                        />
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>

                {showLegend && <IntensityLegend colors={colors} getColor={getIntensityColor} />}
            </View>
        );
    }

    // ─── YEAR VIEW with month navigation ───
    const last364 = data.slice(-364);
    while (last364.length < 364) {
        const padDate = new Date();
        padDate.setDate(padDate.getDate() - last364.length - 1);
        last364.unshift({ date: padDate.toISOString().split('T')[0], intensity: 0 });
    }

    let yearWeeks: HeatmapEntry[][] = [];
    for (let i = 0; i < 364; i += 7) yearWeeks.push(last364.slice(i, i + 7));

    // Filter by selected month if set
    let filteredWeeks = yearWeeks;
    let displayMonthLabel = 'Full Year';
    if (selectedMonth !== null) {
        filteredWeeks = yearWeeks.filter(week => {
            const m = new Date(week[3]?.date || week[0]?.date || '').getMonth();
            return m === selectedMonth;
        });
        const y = new Date(filteredWeeks[0]?.at(0)?.date || '').getFullYear();
        displayMonthLabel = `${MONTH_NAMES_FULL[selectedMonth]} ${y}`;
    }

    const yearCellGap = selectedMonth !== null ? 3 : 2;
    const yearDowWidth = compact ? 14 : 16;
    const yearAvailWidth = SCREEN_WIDTH - containerPaddingH - yearDowWidth - yearCellGap;
    const numWeeksToShow = filteredWeeks.length || 1;
    const maxCellSize = 38;
    const yearCellSize = selectedMonth !== null
        ? Math.min(maxCellSize, Math.floor((yearAvailWidth - (numWeeksToShow - 1) * yearCellGap) / numWeeksToShow))
        : Math.floor((yearAvailWidth - 51 * yearCellGap) / 52);

    // Month label positions (only for full-year)
    const yearMonthLabels: { label: string; weekIndex: number }[] = [];
    if (selectedMonth === null) {
        let lastYearMonth = -1;
        filteredWeeks.forEach((week, wi) => {
            if (week[0]) {
                const m = new Date(week[0].date).getMonth();
                if (m !== lastYearMonth) {
                    yearMonthLabels.push({ label: MONTH_NAMES_SHORT[m], weekIndex: wi });
                    lastYearMonth = m;
                }
            }
        });
    }

    // Navigate months
    const allMonths: number[] = [];
    yearWeeks.forEach(week => {
        const m = new Date(week[3]?.date || week[0]?.date || '').getMonth();
        if (!allMonths.includes(m)) allMonths.push(m);
    });

    const navigateMonth = (dir: -1 | 1) => {
        if (selectedMonth === null) {
            setSelectedMonth(allMonths[allMonths.length - 1]);
        } else {
            const idx = allMonths.indexOf(selectedMonth);
            const next = idx + dir;
            if (next < 0 || next >= allMonths.length) {
                setSelectedMonth(null); // back to full year
            } else {
                setSelectedMonth(allMonths[next]);
            }
        }
    };

    return (
        <View>
            {showToggle && <ToggleTabs range={range} setRange={setRange} colors={colors} />}
            {title && <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>}

            {/* Month navigation bar */}
            <View style={[styles.monthNavBar, { backgroundColor: isDark ? '#111827' : '#F1F5F9', borderColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.monthNavBtn} activeOpacity={0.6}>
                    <Ionicons name="chevron-back" size={18} color={colors.primary.main} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedMonth(null)} activeOpacity={0.7}>
                    <Text style={[styles.monthNavLabel, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        {displayMonthLabel}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.monthNavBtn} activeOpacity={0.6}>
                    <Ionicons name="chevron-forward" size={18} color={colors.primary.main} />
                </TouchableOpacity>
            </View>

            {/* Month labels (full year only) */}
            {selectedMonth === null && (
                <View style={[styles.monthLabelRow, { gap: yearCellGap, paddingLeft: yearDowWidth + yearCellGap }]}>
                    {filteredWeeks.map((_, wi) => {
                        const ml = yearMonthLabels.find(x => x.weekIndex === wi);
                        return (
                            <View key={wi} style={[styles.monthLabelSlot, { width: yearCellSize }]}>
                                {ml && <Text style={[styles.monthLabel, { color: colors.mutedForeground, fontSize: 8 }]}>{ml.label}</Text>}
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Grid */}
            <View style={[styles.gridWrapper, { gap: yearCellGap }]}>
                <View style={[styles.dowColumn, { width: yearDowWidth }]}>
                    {WEEKDAY_INITIALS.map((d, i) => (
                        <Text key={i} style={[styles.dowLabel, { color: colors.mutedForeground, height: yearCellSize, fontSize: selectedMonth !== null ? 10 : 8 }]}>
                            {d}
                        </Text>
                    ))}
                </View>
                <View style={[styles.weeksRow, { gap: yearCellGap }]}>
                    {filteredWeeks.map((week, wi) => (
                        <View key={wi} style={[styles.weekCol, { gap: yearCellGap }]}>
                            {week.map((entry) => {
                                const cellColor = getIntensityColor(entry.intensity);
                                const isToday = entry.date === today.toISOString().split('T')[0];
                                return (
                                    <View
                                        key={entry.date}
                                        style={[
                                            {
                                                width: yearCellSize,
                                                height: yearCellSize,
                                                backgroundColor: cellColor,
                                                borderRadius: Math.max(2, yearCellSize * 0.2),
                                            },
                                            isToday && { borderWidth: 1.5, borderColor: primary },
                                        ]}
                                    />
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>

            {showLegend && <IntensityLegend colors={colors} getColor={getIntensityColor} />}
        </View>
    );
}

// ─── TOGGLE TABS — Premium ───
function ToggleTabs({ range, setRange, colors }: {
    range: HeatmapRange;
    setRange: (r: HeatmapRange) => void;
    colors: ReturnType<typeof useColors>;
}) {
    const { isDark } = useTheme();
    return (
        <View style={[styles.tabRow, { backgroundColor: isDark ? '#111827' : '#F1F5F9', borderColor: colors.border }]}>
            {TABS.map(tab => {
                const isActive = range === tab.key;
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tab,
                            isActive && {
                                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                                borderColor: colors.primary.main + '40',
                                borderWidth: 1,
                                ...(!isDark ? {
                                    shadowColor: colors.primary.main,
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 2,
                                } : {}),
                            },
                        ]}
                        onPress={() => {
                            setRange(tab.key);
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.tabLabel, { color: isActive ? colors.primary.main : colors.mutedForeground, fontWeight: isActive ? '700' : '500' }]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function IntensityLegend({ colors, getColor }: { colors: ReturnType<typeof useColors>; getColor: (i: 0 | 1 | 2 | 3) => string }) {
    return (
        <View style={styles.legend}>
            {([0, 1, 2, 3] as const).map(v => (
                <View key={v} style={styles.legendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: getColor(v), borderWidth: v === 0 ? 1 : 0, borderColor: colors.border }]} />
                    <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{INTENSITY_LABELS[v]}</Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    title: { fontSize: 15, fontWeight: '700', marginBottom: 12 },

    // Toggle tabs
    tabRow: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, padding: 3, marginBottom: 14, alignSelf: 'stretch' },
    tab: { flex: 1, paddingVertical: 7, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    tabLabel: { fontSize: 12, letterSpacing: 0.2 },

    // Month navigation
    monthNavBar: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderRadius: 10, borderWidth: 1, paddingVertical: 8, paddingHorizontal: 6, marginBottom: 12,
    },
    monthNavBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    monthNavLabel: { fontSize: 14, fontWeight: '600' },

    // Week view
    sevenDayRow: { flexDirection: 'row', gap: 6 },
    sevenDayItem: { flex: 1, alignItems: 'center', gap: 5 },
    sevenDayCell: { width: 34, height: 34, borderRadius: 10, borderColor: 'transparent', borderWidth: 2 },
    dayLabel: { fontSize: 11, fontWeight: '600' },

    // Month/year labels
    monthLabelRow: { flexDirection: 'row', marginBottom: 3 },
    monthLabelSlot: { alignItems: 'flex-start' },
    monthLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.2 },

    // Grid
    gridWrapper: { flexDirection: 'row' },
    dowColumn: { gap: 2 },
    dowLabel: { textAlign: 'right', fontWeight: '600', textAlignVertical: 'center' },
    weeksRow: { flexDirection: 'row' },
    weekCol: { flexDirection: 'column' },

    // Legend
    legend: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendSwatch: { width: 11, height: 11, borderRadius: 3 },
    legendLabel: { fontSize: 10, fontWeight: '500' },
});
