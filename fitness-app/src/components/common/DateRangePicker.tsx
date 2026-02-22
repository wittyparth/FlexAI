/**
 * DateRangePicker
 *
 * A zero-dependency calendar component that supports:
 * - Single day selection
 * - Date range selection (tap start → tap end)
 * - Quick preset buttons (Today, This Week, This Month, Last 30d, All Time)
 * - Month navigation (prev / next)
 */

import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../hooks';

export interface DateRange {
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ─── Presets ────────────────────────────────────────────────────────────────

const PRESETS: { label: string; getValue: () => DateRange }[] = [
  {
    label: 'Today',
    getValue: () => {
      const t = todayDate();
      return { startDate: formatKey(t), endDate: formatKey(t) };
    },
  },
  {
    label: 'This Week',
    getValue: () => {
      const t = todayDate();
      const dow = t.getDay(); // 0=Sun
      const daysFromMon = dow === 0 ? 6 : dow - 1;
      return { startDate: formatKey(addDays(t, -daysFromMon)), endDate: formatKey(t) };
    },
  },
  {
    label: 'This Month',
    getValue: () => {
      const t = todayDate();
      const start = new Date(t.getFullYear(), t.getMonth(), 1);
      return { startDate: formatKey(start), endDate: formatKey(t) };
    },
  },
  {
    label: 'Last 30d',
    getValue: () => {
      const t = todayDate();
      return { startDate: formatKey(addDays(t, -29)), endDate: formatKey(t) };
    },
  },
  {
    label: 'All Time',
    getValue: () => ({ startDate: '2000-01-01', endDate: formatKey(addDays(todayDate(), 1)) }),
  },
];

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// ─── Component ──────────────────────────────────────────────────────────────

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const colors = useColors();

  // Which month is displayed
  const [viewDate, setViewDate] = useState<Date>(() => {
    const ref = value.endDate ? new Date(value.endDate) : new Date();
    return new Date(ref.getFullYear(), ref.getMonth(), 1);
  });

  // Two-tap range selection state
  const [step, setStep] = useState<'start' | 'end'>('start');
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Build calendar grid cells (null = empty filler)
  const cells = useMemo<(number | null)[]>(() => {
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const prefixCount = firstDow === 0 ? 6 : firstDow - 1; // shift so Mon is first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = Array(prefixCount).fill(null);
    for (let i = 1; i <= daysInMonth; i++) arr.push(i);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  const dayKey = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Press handler for a calendar day
  const handleDayPress = (day: number) => {
    const key = dayKey(day);

    if (step === 'start') {
      // First tap — mark pending start, wait for end tap
      setPendingStart(key);
      setStep('end');
    } else {
      // Second tap — finalise range
      const start = pendingStart!;
      const end = key;
      onChange(start <= end ? { startDate: start, endDate: end } : { startDate: end, endDate: start });
      setPendingStart(null);
      setStep('start');
    }
  };

  // Effective selected range (during two-tap flow, startDate = pendingStart)
  const effectiveStart = pendingStart ?? value.startDate;
  const effectiveEnd = pendingStart ? null : value.endDate;

  const isSelectedStart = (day: number) => dayKey(day) === effectiveStart;
  const isSelectedEnd = (day: number) => !pendingStart && dayKey(day) === effectiveEnd;
  const isInRange = (day: number) => {
    const k = dayKey(day);
    if (!effectiveEnd) return false;
    return k > effectiveStart && k < effectiveEnd;
  };

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handlePreset = (preset: (typeof PRESETS)[0]) => {
    const range = preset.getValue();
    onChange(range);
    setPendingStart(null);
    setStep('start');
    // Navigate view to the end of the preset range
    const endDate = new Date(range.endDate);
    setViewDate(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* ── Presets ── */}
      <View style={styles.presets}>
        {PRESETS.map((preset) => {
          const pv = preset.getValue();
          const isActive = pv.startDate === value.startDate && pv.endDate === value.endDate;
          return (
            <TouchableOpacity
              key={preset.label}
              style={[
                styles.presetBtn,
                { backgroundColor: isActive ? colors.primary.main : colors.muted },
              ]}
              onPress={() => handlePreset(preset)}
              activeOpacity={0.8}
            >
              <Text style={[styles.presetText, { color: isActive ? '#FFF' : colors.foreground }]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Month Navigation ── */}
      <View style={styles.monthNav}>
        <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.muted }]} onPress={prevMonth} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={16} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.monthLabel, { color: colors.foreground }]}>{monthLabel}</Text>
        <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.muted }]} onPress={nextMonth} activeOpacity={0.8}>
          <Ionicons name="chevron-forward" size={16} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* ── Day Headers ── */}
      <View style={styles.weekRow}>
        {WEEK_DAYS.map((d) => (
          <Text key={d} style={[styles.weekDay, { color: colors.mutedForeground }]}>
            {d}
          </Text>
        ))}
      </View>

      {/* ── Calendar Grid ── */}
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={`e-${i}`} style={styles.cell} />;

          const selStart = isSelectedStart(day);
          const selEnd = isSelectedEnd(day);
          const inRange = isInRange(day);
          const selected = selStart || selEnd;

          const today = formatKey(todayDate());
          const isToday = dayKey(day) === today;

          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.cell,
                inRange && { backgroundColor: `${colors.primary.main}22` },
                selected && { backgroundColor: colors.primary.main, borderRadius: 8 },
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: selected ? '#FFF' : colors.foreground },
                  isToday && !selected && { color: colors.primary.main, fontWeight: '800' },
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Instruction hint ── */}
      <Text style={[styles.hint, { color: colors.mutedForeground }]}>
        {step === 'start' ? 'Tap a day to select · tap two days for a range' : 'Now tap the end date'}
      </Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    paddingBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  hint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: -4,
  },
});
