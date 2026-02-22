import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../hooks';
import { useTheme } from '../contexts';
import { fontFamilies } from '../theme/typography';

// ─────────────────────────────────────────────────────────────
//  WORKOUT HEATMAP  — Production-quality redesign
//  Week view:  prev/next week navigation, 7 gradient day-cards
//  Month view: prev/next month navigation, contribution graph
// ─────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WEEKDAY_LETTER = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES    = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export type HeatmapRange = 'week' | 'month' | 'year'; // legacy compat

export interface HeatmapEntry {
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

// ── Date helpers ───────────────────────────────────────
const toKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (d: Date, n: number): Date => {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
};

const getMondayOf = (d: Date): Date => {
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const m = new Date(d);
    m.setDate(m.getDate() + diff);
    m.setHours(0, 0, 0, 0);
    return m;
};

const getFirstDayOfMonth = (d: Date): Date =>
    new Date(d.getFullYear(), d.getMonth(), 1);

const getDaysInMonth = (d: Date): number =>
    new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

const shiftMonth = (base: Date, delta: number): Date =>
    new Date(base.getFullYear(), base.getMonth() + delta, 1);

// ── Types ───────────────────────────────────────────────────
type GrPair = readonly [string, string];

// ── Main Component ───────────────────────────────────────────
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
    const colors  = useColors();
    const { isDark } = useTheme();
    const primary = colors.primary.main;

    const legacyTab: 'week' | 'month' = mode === '7day' ? 'week' : 'month';
    const initTab: 'week' | 'month' = (() => {
        if (!defaultRange || defaultRange === 'year') return legacyTab;
        return defaultRange === 'week' ? 'week' : 'month';
    })();

    const [activeTab, setActiveTab] = useState<'week' | 'month'>(initTab);
    const indicatorAnim = useRef(new Animated.Value(initTab === 'week' ? 0 : 1)).current;

    const switchTab = (tab: 'week' | 'month') => {
        setActiveTab(tab);
        Animated.spring(indicatorAnim, {
            toValue: tab === 'week' ? 0 : 1,
            useNativeDriver: false,
            tension: 90,
            friction: 12,
        }).start();
    };

    const dataMap = useMemo(() => {
        const m = new Map<string, 0 | 1 | 2 | 3>();
        data.forEach(e => m.set(e.date, e.intensity));
        return m;
    }, [data]);

    const getIntensity = useCallback(
        (d: Date): 0 | 1 | 2 | 3 => dataMap.get(toKey(d)) ?? 0,
        [dataMap],
    );

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);
    const todayKey = toKey(today);

    const CELL_GRADIENT: Record<0 | 1 | 2 | 3, GrPair> = {
        0: [isDark ? '#182030' : '#F1F5F9', isDark ? '#1E293B' : '#F8FAFC'] as const,
        1: [isDark ? '#1A365D' : '#EFF6FF', isDark ? '#1E3A5F' : '#DBEAFE'] as const,
        2: [isDark ? '#1D4ED8' : '#60A5FA', isDark ? '#2563EB' : '#3B82F6'] as const,
        3: [isDark ? '#1D4ED8' : '#2563EB', isDark ? '#06B6D4' : '#0052FF'] as const,
    };

    const cellTextColor = (intensity: 0 | 1 | 2 | 3): string => {
        if (intensity === 0) return isDark ? '#475569' : '#94A3B8';
        if (intensity === 1) return isDark ? '#93C5FD' : '#1D4ED8';
        return '#FFFFFF';
    };

    return (
        <View>
            {title && (
                <Text style={[S.title, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                    {title}
                </Text>
            )}

            <TabBar
                activeTab={activeTab}
                onSwitch={switchTab}
                indicatorAnim={indicatorAnim}
                colors={colors}
                isDark={isDark}
                primary={primary}
            />

            {activeTab === 'week' ? (
                <WeekView
                    today={today}
                    todayKey={todayKey}
                    getIntensity={getIntensity}
                    CELL_GRADIENT={CELL_GRADIENT}
                    cellTextColor={cellTextColor}
                    colors={colors}
                    isDark={isDark}
                    primary={primary}
                    showLegend={showLegend}
                />
            ) : (
                <MonthView
                    today={today}
                    todayKey={todayKey}
                    getIntensity={getIntensity}
                    CELL_GRADIENT={CELL_GRADIENT}
                    colors={colors}
                    isDark={isDark}
                    primary={primary}
                    showLegend={showLegend}
                    containerPaddingH={containerPaddingH}
                    compact={compact}
                />
            )}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
//  TAB BAR
// ─────────────────────────────────────────────────────────────
function TabBar({
    activeTab, onSwitch, indicatorAnim, colors, isDark, primary,
}: {
    activeTab: 'week' | 'month';
    onSwitch: (t: 'week' | 'month') => void;
    indicatorAnim: Animated.Value;
    colors: ReturnType<typeof useColors>;
    isDark: boolean;
    primary: string;
}) {
    const trackBg  = isDark ? '#0F172A' : '#F1F5F9';
    const activeBg = isDark ? '#1E293B' : '#FFFFFF';

    const indicatorLeft = indicatorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['2%', '51%'],
    });

    return (
        <View style={[S.tabTrack, { backgroundColor: trackBg, borderColor: colors.border }]}>
            <Animated.View
                style={[
                    S.tabIndicator,
                    {
                        left: indicatorLeft,
                        backgroundColor: activeBg,
                        borderColor: primary + '30',
                        ...Platform.select({
                            ios: {
                                shadowColor: primary,
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.15,
                                shadowRadius: 6,
                            },
                            android: { elevation: 3 },
                        }),
                    },
                ]}
            />
            {(['week', 'month'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                    <TouchableOpacity
                        key={tab}
                        style={S.tabBtn}
                        onPress={() => onSwitch(tab)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                S.tabLabel,
                                {
                                    color: isActive ? primary : colors.mutedForeground,
                                    fontWeight: isActive ? '700' : '500',
                                    fontFamily: fontFamilies.body,
                                },
                            ]}
                        >
                            {tab === 'week' ? 'Weekly' : 'Monthly'}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
//  WEEK VIEW
// ─────────────────────────────────────────────────────────────
interface WeekViewProps {
    today: Date;
    todayKey: string;
    getIntensity: (d: Date) => 0 | 1 | 2 | 3;
    CELL_GRADIENT: Record<0 | 1 | 2 | 3, GrPair>;
    cellTextColor: (i: 0 | 1 | 2 | 3) => string;
    colors: ReturnType<typeof useColors>;
    isDark: boolean;
    primary: string;
    showLegend: boolean;
}

function WeekView({
    today, todayKey, getIntensity,
    CELL_GRADIENT, cellTextColor, colors, isDark, primary, showLegend,
}: WeekViewProps) {
    const [weekOffset, setWeekOffset] = useState(0);

    const monday = useMemo(
        () => getMondayOf(addDays(today, weekOffset * 7)),
        [today, weekOffset],
    );

    const days = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(monday, i)),
        [monday],
    );

    const weekStats = useMemo(() => {
        let workouts = 0;
        days.forEach(d => { if (d <= today && getIntensity(d) > 0) workouts++; });
        return { workouts };
    }, [days, getIntensity, today]);

    const sunday = days[6];
    const rangeLabel = monday.getMonth() === sunday.getMonth()
        ? `${MONTH_SHORT[monday.getMonth()]} ${monday.getDate()} – ${sunday.getDate()}, ${sunday.getFullYear()}`
        : `${MONTH_SHORT[monday.getMonth()]} ${monday.getDate()} – ${MONTH_SHORT[sunday.getMonth()]} ${sunday.getDate()}, ${sunday.getFullYear()}`;

    const isCurrentWeek = weekOffset === 0;

    return (
        <View>
            <View style={S.navRow}>
                <TouchableOpacity
                    style={[S.navArrow, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}
                    onPress={() => setWeekOffset(o => o - 1)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={16} color={primary} />
                </TouchableOpacity>

                <View style={S.navCenter}>
                    <Text style={[S.navLabel, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        {rangeLabel}
                    </Text>
                    {isCurrentWeek && (
                        <View style={[S.nowBadge, { backgroundColor: primary + '18', borderColor: primary + '40' }]}>
                            <Text style={[S.nowBadgeText, { color: primary }]}>This Week</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        S.navArrow,
                        {
                            backgroundColor: isCurrentWeek ? (isDark ? '#0F172A' : '#F8FAFC') : (isDark ? '#1E293B' : '#F1F5F9'),
                            borderColor: colors.border,
                            opacity: isCurrentWeek ? 0.3 : 1,
                        },
                    ]}
                    onPress={() => { if (!isCurrentWeek) setWeekOffset(o => o + 1); }}
                    activeOpacity={isCurrentWeek ? 1 : 0.7}
                    disabled={isCurrentWeek}
                >
                    <Ionicons name="chevron-forward" size={16} color={primary} />
                </TouchableOpacity>
            </View>

            <View style={S.weekRow}>
                {days.map((day, idx) => {
                    const intensity = getIntensity(day);
                    const key = toKey(day);
                    const isToday = key === todayKey;
                    const isFuture = day > today;
                    const gradColors = CELL_GRADIENT[intensity];
                    const txtColor = cellTextColor(intensity);

                    return (
                        <View key={key} style={S.dayCellWrapper}>
                            <LinearGradient
                                colors={isFuture
                                    ? [isDark ? '#141E2D' : '#FAFAFA', isDark ? '#182030' : '#F8FAFC'] as any
                                    : gradColors as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={[
                                    S.dayCard,
                                    isToday
                                        ? {
                                            borderColor: primary,
                                            borderWidth: 2,
                                            ...Platform.select({
                                                ios: {
                                                    shadowColor: primary,
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.4,
                                                    shadowRadius: 10,
                                                },
                                                android: { elevation: 6 },
                                            }),
                                        }
                                        : {
                                            borderColor: isDark ? '#1E293B' : '#E2E8F0',
                                            borderWidth: 1,
                                        },
                                ]}
                            >
                                <Text style={[
                                    S.dayLetter,
                                    {
                                        color: isToday
                                            ? primary
                                            : isFuture
                                                ? isDark ? '#2D3D55' : '#CBD5E1'
                                                : intensity > 0
                                                    ? txtColor + 'CC'
                                                    : isDark ? '#334155' : '#94A3B8',
                                    },
                                ]}>
                                    {WEEKDAY_LETTER[idx]}
                                </Text>

                                <Text style={[
                                    S.dayNumber,
                                    {
                                        color: isToday
                                            ? primary
                                            : isFuture
                                                ? isDark ? '#2D3D55' : '#CBD5E1'
                                                : intensity === 0
                                                    ? isDark ? '#475569' : '#94A3B8'
                                                    : txtColor,
                                        fontFamily: fontFamilies.display,
                                    },
                                ]}>
                                    {day.getDate()}
                                </Text>

                                <View style={[
                                    S.intensityDot,
                                    {
                                        backgroundColor:
                                            isFuture
                                                ? isDark ? '#1A2234' : '#E2E8F0'
                                                : intensity === 0
                                                    ? isDark ? '#1E293B' : '#E2E8F0'
                                                    : intensity === 1
                                                        ? isDark ? '#2563EB80' : '#93C5FD'
                                                        : intensity === 2
                                                            ? isDark ? '#3B82F6' : '#2563EB'
                                                            : isDark ? '#06B6D4' : '#0052FF',
                                    },
                                ]} />
                            </LinearGradient>

                            {isToday && (
                                <Text style={[S.todayTag, { color: primary }]}>TODAY</Text>
                            )}
                        </View>
                    );
                })}
            </View>

            <View style={[S.statsStrip, { borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                <StripStat
                    icon="flash"
                    label="Active Days"
                    value={`${weekStats.workouts} / 7`}
                    color={primary}
                    colors={colors}
                />
                <View style={[S.stripDiv, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />
                <StripStat
                    icon="stats-chart"
                    label="Completion"
                    value={`${Math.round((weekStats.workouts / 7) * 100)}%`}
                    color={weekStats.workouts >= 5 ? '#10B981' : weekStats.workouts >= 3 ? '#F59E0B' : primary}
                    colors={colors}
                />
                <View style={[S.stripDiv, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />
                <StripStat
                    icon="moon"
                    label="Rest Days"
                    value={`${7 - weekStats.workouts}`}
                    color={isDark ? '#475569' : '#94A3B8'}
                    colors={colors}
                />
            </View>

            {showLegend && <Legend isDark={isDark} colors={colors} primary={primary} />}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
//  MONTH VIEW
// ─────────────────────────────────────────────────────────────
interface MonthViewProps {
    today: Date;
    todayKey: string;
    getIntensity: (d: Date) => 0 | 1 | 2 | 3;
    CELL_GRADIENT: Record<0 | 1 | 2 | 3, GrPair>;
    colors: ReturnType<typeof useColors>;
    isDark: boolean;
    primary: string;
    showLegend: boolean;
    containerPaddingH: number;
    compact: boolean;
}

function MonthView({
    today, todayKey, getIntensity,
    CELL_GRADIENT, colors, isDark, primary, showLegend,
    containerPaddingH, compact,
}: MonthViewProps) {
    const [monthOffset, setMonthOffset] = useState(0);

    const referenceMonth = useMemo(() => shiftMonth(today, monthOffset), [today, monthOffset]);
    const isCurrentMonth = monthOffset === 0;

    const { weeks, monthStats } = useMemo(() => {
        const firstDay = getFirstDayOfMonth(referenceMonth);
        const daysInMonth = getDaysInMonth(referenceMonth);
        const lastDay = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), daysInMonth);

        const gridStart = getMondayOf(firstDay);
        const lastDayOfWeek = lastDay.getDay();
        const daysToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
        const gridEnd = addDays(lastDay, daysToSunday);

        const allDays: Date[] = [];
        let cursor = new Date(gridStart);
        while (cursor <= gridEnd) {
            allDays.push(new Date(cursor));
            cursor = addDays(cursor, 1);
        }

        const ws: Date[][] = [];
        for (let i = 0; i < allDays.length; i += 7) ws.push(allDays.slice(i, i + 7));

        let activeDays = 0, lightDays = 0, modDays = 0, heavyDays = 0;
        for (let d = 1; d <= daysInMonth; d++) {
            const day = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), d);
            if (day > today) break;
            const v = getIntensity(day);
            if (v > 0) activeDays++;
            if (v === 1) lightDays++;
            if (v === 2) modDays++;
            if (v === 3) heavyDays++;
        }

        const isRef = referenceMonth.getFullYear() === today.getFullYear() &&
            referenceMonth.getMonth() === today.getMonth();
        const daysUpToNow = isRef ? Math.min(today.getDate(), daysInMonth) : daysInMonth;

        return { weeks: ws, monthStats: { activeDays, lightDays, modDays, heavyDays, daysUpToNow } };
    }, [referenceMonth, today, getIntensity]);

    const DOW_COL = compact ? 16 : 22;
    const GAP     = compact ? 3  : 4;

    const firstDayMonth = getFirstDayOfMonth(referenceMonth);
    const lastDayMonth  = new Date(referenceMonth.getFullYear(), referenceMonth.getMonth(), getDaysInMonth(referenceMonth));

    return (
        <View>
            <View style={S.navRow}>
                <TouchableOpacity
                    style={[S.navArrow, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}
                    onPress={() => setMonthOffset(o => o - 1)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={16} color={primary} />
                </TouchableOpacity>

                <View style={S.navCenter}>
                    <Text style={[S.navLabel, { color: colors.foreground, fontFamily: fontFamilies.display }]}>
                        {MONTH_NAMES[referenceMonth.getMonth()]} {referenceMonth.getFullYear()}
                    </Text>
                    {isCurrentMonth && (
                        <View style={[S.nowBadge, { backgroundColor: primary + '18', borderColor: primary + '40' }]}>
                            <Text style={[S.nowBadgeText, { color: primary }]}>This Month</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        S.navArrow,
                        {
                            backgroundColor: isCurrentMonth ? (isDark ? '#0F172A' : '#F8FAFC') : (isDark ? '#1E293B' : '#F1F5F9'),
                            borderColor: colors.border,
                            opacity: isCurrentMonth ? 0.3 : 1,
                        },
                    ]}
                    onPress={() => { if (!isCurrentMonth) setMonthOffset(o => o + 1); }}
                    activeOpacity={isCurrentMonth ? 1 : 0.7}
                    disabled={isCurrentMonth}
                >
                    <Ionicons name="chevron-forward" size={16} color={primary} />
                </TouchableOpacity>
            </View>

            {/* Weekday headers */}
            <View style={[S.calHeaderRow, { gap: GAP }]}>
                <View style={{ width: DOW_COL }} />
                {WEEKDAY_LETTER.map((ltr, i) => (
                    <View key={i} style={S.calHeaderCell}>
                        <Text style={[S.colMonthLabel, {
                            color: isDark ? '#334155' : '#94A3B8',
                            fontSize: compact ? 8 : 10,
                        }]}>
                            {ltr}
                        </Text>
                    </View>
                ))}
            </View>

            {/* Grid rows = weeks, cols = Mon-Sun — flex-fill full width */}
            <View style={{ marginBottom: 12 }}>
                {weeks.map((week, wi) => (
                    <View key={wi} style={[S.calRow, { gap: GAP, marginBottom: GAP }]}>
                        {/* Week number label */}
                        <View style={{ width: DOW_COL, alignItems: 'flex-end', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 8, color: isDark ? '#2D3D55' : '#CBD5E1', fontWeight: '600' }}>
                                W{wi + 1}
                            </Text>
                        </View>

                        {/* 7 flex cells */}
                        {week.map((day) => {
                            const key = toKey(day);
                            const isToday = key === todayKey;
                            const isFuture = day > today;
                            const isOutside = day < firstDayMonth || day > lastDayMonth;
                            const intensity = isOutside ? 0 : getIntensity(day);

                            if (isOutside) {
                                return (
                                    <View key={key} style={[
                                        S.calDayCell,
                                        { backgroundColor: isDark ? '#0D1525' : '#F9FAFB', opacity: 0.3 },
                                    ]} />
                                );
                            }

                            return (
                                <LinearGradient
                                    key={key}
                                    colors={isFuture
                                        ? [isDark ? '#141E2D' : '#F8FAFC', isDark ? '#1A2540' : '#F1F5F9'] as any
                                        : CELL_GRADIENT[intensity] as any}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={[
                                        S.calDayCell,
                                        isToday && {
                                            borderWidth: 2, borderColor: primary,
                                            ...Platform.select({
                                                ios: {
                                                    shadowColor: primary,
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.55, shadowRadius: 6,
                                                },
                                                android: { elevation: 5 },
                                            }),
                                        },
                                        !isToday && intensity === 0 && {
                                            borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0',
                                        },
                                    ]}
                                >
                                    <Text style={{
                                        fontSize: 11,
                                        fontWeight: isToday ? '800' : intensity > 0 ? '700' : '400',
                                        color: isToday
                                            ? primary
                                            : isFuture
                                                ? isDark ? '#2D3D55' : '#CBD5E1'
                                                : intensity === 0
                                                    ? isDark ? '#475569' : '#94A3B8'
                                                    : intensity === 1
                                                        ? isDark ? '#93C5FD' : '#1D4ED8'
                                                        : '#FFFFFF',
                                        fontFamily: fontFamilies.body,
                                    }}>
                                        {day.getDate()}
                                    </Text>
                                </LinearGradient>
                            );
                        })}
                    </View>
                ))}
            </View>

            <View style={[S.statsStrip, { borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                <StripStat icon="calendar" label="Active"
                    value={`${monthStats.activeDays}/${monthStats.daysUpToNow}`}
                    color={primary} colors={colors} />
                <View style={[S.stripDiv, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />
                <StripStat icon="water" label="Light" value={`${monthStats.lightDays}`}
                    color={isDark ? '#93C5FD' : '#3B82F6'} colors={colors} />
                <View style={[S.stripDiv, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />
                <StripStat icon="pulse" label="Moderate" value={`${monthStats.modDays}`}
                    color={isDark ? '#60A5FA' : '#2563EB'} colors={colors} />
                <View style={[S.stripDiv, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]} />
                <StripStat icon="flame" label="Heavy" value={`${monthStats.heavyDays}`}
                    color={isDark ? '#38BDF8' : '#0052FF'} colors={colors} />
            </View>

            {showLegend && <Legend isDark={isDark} colors={colors} primary={primary} />}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
//  SHARED SUBCOMPONENTS
// ─────────────────────────────────────────────────────────────
function StripStat({
    icon, label, value, color, colors,
}: {
    icon: string; label: string; value: string;
    color: string; colors: ReturnType<typeof useColors>;
}) {
    return (
        <View style={S.stripCell}>
            <Ionicons name={icon as any} size={12} color={color} style={{ marginBottom: 2 }} />
            <Text style={[S.stripValue, { color, fontFamily: fontFamilies.display }]}>{value}</Text>
            <Text style={[S.stripLabel, { color: colors.mutedForeground }]}>{label}</Text>
        </View>
    );
}

function Legend({ isDark, colors, primary }: {
    isDark: boolean; colors: ReturnType<typeof useColors>; primary: string;
}) {
    const swatches: { label: string; g: GrPair }[] = [
        { label: 'Rest',     g: isDark ? ['#182030', '#1E293B'] as const : ['#F8FAFC', '#F1F5F9'] as const },
        { label: 'Light',    g: isDark ? ['#1A365D', '#1E3A5F'] as const : ['#EFF6FF', '#DBEAFE'] as const },
        { label: 'Moderate', g: isDark ? ['#1D4ED8', '#2563EB'] as const : ['#60A5FA', '#3B82F6'] as const },
        { label: 'Heavy',    g: isDark ? ['#1D4ED8', '#06B6D4'] as const : ['#2563EB', '#0052FF'] as const },
    ];
    return (
        <View style={S.legend}>
            <Text style={[S.legendTitle, { color: colors.mutedForeground }]}>Intensity</Text>
            {swatches.map(({ label, g }) => (
                <View key={label} style={S.legendItem}>
                    <LinearGradient
                        colors={g as any}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={[S.legendSwatch, label === 'Rest' && { borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0' }]}
                    />
                    <Text style={[S.legendLabel, { color: colors.mutedForeground }]}>{label}</Text>
                </View>
            ))}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    title: { fontSize: 15, fontWeight: '700', marginBottom: 12 },

    tabTrack: {
        flexDirection: 'row', borderRadius: 14, borderWidth: 1,
        padding: 4, marginBottom: 16, position: 'relative',
        height: 44, alignItems: 'center',
    },
    tabIndicator: {
        position: 'absolute', width: '47%', height: 34, borderRadius: 10, borderWidth: 1, zIndex: 0,
    },
    tabBtn: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    tabLabel: { fontSize: 13, letterSpacing: 0.1 },

    navRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    navArrow: { width: 34, height: 34, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    navCenter: { flex: 1, alignItems: 'center', gap: 4 },
    navLabel: { fontSize: 14, fontWeight: '600', letterSpacing: 0.1 },
    nowBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, borderWidth: 1 },
    nowBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },

    weekRow: { flexDirection: 'row', gap: 5, marginBottom: 12 },
    dayCellWrapper: { flex: 1, alignItems: 'center', gap: 4 },
    dayCard: {
        width: '100%', aspectRatio: 0.58, borderRadius: 14,
        alignItems: 'center', justifyContent: 'space-evenly',
        paddingVertical: 8, overflow: 'hidden',
    },
    dayLetter: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
    dayNumber: { fontSize: 17, fontWeight: '800', lineHeight: 20 },
    intensityDot: { width: 7, height: 7, borderRadius: 3.5 },
    todayTag: { fontSize: 7, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase' },

    calHeaderRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'center' },
    calHeaderCell: { flex: 1, alignItems: 'center' },
    colMonthLabel: { fontWeight: '600', letterSpacing: 0.2 },
    calRow: { flexDirection: 'row', alignItems: 'stretch' },
    calDayCell: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    statsStrip: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginBottom: 12 },
    stripCell: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 1 },
    stripDiv: { width: 1, marginVertical: 8 },
    stripValue: { fontSize: 13, fontWeight: '700' },
    stripLabel: { fontSize: 8, fontWeight: '500', letterSpacing: 0.3, textTransform: 'uppercase' },

    legend: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 2, flexWrap: 'wrap' },
    legendTitle: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase', marginRight: 2 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    legendSwatch: { width: 13, height: 13, borderRadius: 4 },
    legendLabel: { fontSize: 10, fontWeight: '500' },
});
