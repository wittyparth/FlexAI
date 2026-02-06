import { prisma } from '../../config/database';
import { Exercise, WorkoutExercise, WorkoutSet, PersonalRecord } from '@prisma/client';

export class StatsService {
  /**
   * Check for new Personal Records (PRs) after a workout completion.
   * Tracks: Max Weight, Max Reps, Best Session Volume, Estimated 1RM.
   * 3.1 PR Tracking
   */
  async checkAndSavePRs(userId: number, workoutId: number) {
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId },
      include: {
        exercises: {
            include: {
                sets: true,
                exercise: true,
            },
        },
      },
    });

    if (!workout || workout.userId !== userId) {
      throw new Error('Workout not found or unauthorized');
    }

    // Get user's body weight at the time of workout (for normalization)
    const bodyWeightEntry = await prisma.bodyWeight.findFirst({
      where: {
        userId,
        date: { lte: workout.completedAt || new Date() },
      },
      orderBy: { date: 'desc' },
    });
    const currentBodyWeight = bodyWeightEntry?.weight || null;

    const newPRs: PersonalRecord[] = [];

    for (const workoutExercise of workout.exercises) {
      if (!workoutExercise.sets || workoutExercise.sets.length === 0) continue;

      // Calculate potential PRs from this session
      const bests = this.calculateExerciseBests(workoutExercise.sets);

      // Fetch existing PRs for this exercise
      const existingPRs = await prisma.personalRecord.findMany({
        where: { userId, exerciseId: workoutExercise.exerciseId },
      });

      // Check and Save individual record types
      const saved1 = await this.processPR(userId, workoutExercise, 'max_weight', bests.maxWeight, currentBodyWeight, existingPRs, bests.maxWeightReps);
      if (saved1) newPRs.push(saved1);

      const saved2 = await this.processPR(userId, workoutExercise, 'max_reps', bests.maxReps, currentBodyWeight, existingPRs);
      if (saved2) newPRs.push(saved2);

      const saved3 = await this.processPR(userId, workoutExercise, 'max_volume', bests.maxVolume, currentBodyWeight, existingPRs);
      if (saved3) newPRs.push(saved3);

      const saved4 = await this.processPR(userId, workoutExercise, 'estimated_1rm', bests.estimated1RM, currentBodyWeight, existingPRs);
      if (saved4) newPRs.push(saved4);
    }

    return newPRs;
  }

  private calculateExerciseBests(sets: WorkoutSet[]) {
    let maxWeight = 0;
    let maxWeightReps = 0;
    let maxReps = 0;
    let maxVolume = 0; // Single session volume for this exercise
    let estimated1RM = 0;

    for (const set of sets) {
      if (!set.completed || !set.weight || !set.reps) continue;

      // Max Weight
      if (set.weight > maxWeight) {
        maxWeight = set.weight;
        maxWeightReps = set.reps;
      }

      // Max Reps (at any weight - simplified to raw max reps)
      if (set.reps > maxReps) {
        maxReps = set.reps;
      }

      // Volume
      maxVolume += set.weight * set.reps;

      // Estimated 1RM
      const e1rm = this.calculate1RM(set.weight, set.reps);
      if (e1rm > estimated1RM) {
        estimated1RM = e1rm;
      }
    }

    return { maxWeight, maxWeightReps, maxReps, maxVolume, estimated1RM };
  }

  private async processPR(
    userId: number,
    workoutExercise: WorkoutExercise & { exercise: Exercise },
    type: string,
    value: number,
    bodyWeight: number | null,
    existingPRs: PersonalRecord[],
    reps?: number
  ) {
    if (value <= 0) return null;

    const existing = existingPRs.find((pr) => pr.recordType === type);

    // If no existing record or new value is greater
    if (!existing || value > existing.value) {
      // Create new PR
      const newPR = await prisma.personalRecord.create({
        data: {
          userId,
          exerciseId: workoutExercise.exerciseId,
          recordType: type,
          value,
          reps: reps || null,
          bodyWeight,
          workoutId: workoutExercise.workoutId,
          date: new Date(),
        },
      });
      return newPR;
    }
    return null;
  }

  /**
   * Calculates Estimated 1RM using multiple formulas and returns the average.
   * Using Epley, Brzycki, Lander, Lombardi.
   */
  private calculate1RM(weight: number, reps: number): number {
    if (reps === 1) return weight;
    
    // Epley Formula
    const epley = weight * (1 + reps / 30);
    
    // Brzycki Formula
    const brzycki = weight * (36 / (37 - reps));

    // Lander Formula
    const lander = (100 * weight) / (101.3 - 2.67123 * reps);

    // Lombardi Formula
    const lombardi = weight * Math.pow(reps, 0.10);

    // Average to smooth out outliers
    const avg = (epley + brzycki + lander + lombardi) / 4;
    return parseFloat(avg.toFixed(2));
  }

  /**
   * 3.1 Strength Metrics & Standards
   */
  async getStrengthMetrics(userId: number) {
    // 1. Get User's Body Weight
    const bodyWeightEntry = await prisma.bodyWeight.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    const bodyWeight = bodyWeightEntry?.weight || 75; // Default

    // 2. Big 3 Lifts (Simplified matching)
    const bigLifts = await prisma.exercise.findMany({
      where: {
        OR: [
          { name: { contains: 'Squat', mode: 'insensitive' } },
          { name: { contains: 'Bench Press', mode: 'insensitive' } },
          { name: { contains: 'Deadlift', mode: 'insensitive' } },
        ]
      },
      select: { id: true, name: true }
    });

    // 3. Get best 1RM for these lifts
    const prs = await prisma.personalRecord.findMany({
      where: {
        userId,
        recordType: 'estimated_1rm',
        exerciseId: { in: bigLifts.map((e: { id: number }) => e.id) }
      },
      orderBy: { value: 'desc' }
    });

    let squat = 0, bench = 0, deadlift = 0;

    prs.forEach((pr: any) => {
      const ex = bigLifts.find((e: { id: number }) => e.id === pr.exerciseId);
      if (!ex) return;
      const name = ex.name.toLowerCase();
      if (name.includes('squat') && pr.value > squat) squat = pr.value;
      if (name.includes('bench') && pr.value > bench) bench = pr.value;
      if (name.includes('deadlift') && pr.value > deadlift) deadlift = pr.value;
    });

    const total = squat + bench + deadlift;
    
    // 4. Calculate Wilks Score & Standards
    const wilks = this.calculateWilks(total, bodyWeight);
    const level = this.getStrengthStandard(total, bodyWeight);

    return {
      bodyWeight,
      lifts: { squat, bench, deadlift, total },
      wilks: parseFloat(wilks.toFixed(2)),
      level
    };
  }

  private calculateWilks(total: number, bw: number): number {
    // Simplified Wilks (Male coeffs)
    const a = -216.0475144;
    const b = 16.2606339;
    const c = -0.002388645;
    const d = -0.00113732;
    const e = 7.01863E-06;
    const f = -1.291E-08;
    
    const x = bw;
    const denominator = a + b*x + c*Math.pow(x, 2) + d*Math.pow(x, 3) + e*Math.pow(x, 4) + f*Math.pow(x, 5);
    if (denominator === 0) return 0;
    const coeff = 500 / denominator;
    
    return total * coeff;
  }

  private getStrengthStandard(total: number, bw: number): string {
    const ratio = total / bw;
    if (ratio >= 6.5) return 'Elite';
    if (ratio >= 5.0) return 'Advanced';
    if (ratio >= 3.75) return 'Intermediate';
    if (ratio >= 2.5) return 'Novice';
    return 'Beginner';
  }

  /**
   * 3.2.1 Get Volume Stats
   * Returns total volume and daily volume for a period.
   */
  async getVolumeStats(userId: number, timeframe: 'week' | 'month' | 'year' = 'week', customStartDate?: Date, customEndDate?: Date) {
    const now = new Date();
    let startDate = new Date();
    let endDate = customEndDate || now;

    if (customStartDate) {
        startDate = customStartDate;
    } else {
        if (timeframe === 'week') startDate.setDate(now.getDate() - 7);
        else if (timeframe === 'month') startDate.setMonth(now.getMonth() - 1);
        else startDate.setFullYear(now.getFullYear() - 1);
    }

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        completedAt: { gte: startDate, lte: endDate }
      },
      orderBy: { completedAt: 'asc' },
      select: {
        completedAt: true,
        totalVolume: true,
        totalSets: true,
        totalReps: true
      }
    });

    const dailyMap = new Map<string, number>();
    workouts.forEach((w: any) => {
        const dateStr = w.completedAt?.toISOString().split('T')[0] || '';
        const prev = dailyMap.get(dateStr) || 0;
        dailyMap.set(dateStr, prev + (w.totalVolume || 0));
    });

    const trend = Array.from(dailyMap.entries()).map(([date, volume]) => ({ date, volume }));
    const totalVolume = workouts.reduce((sum: number, w: any) => sum + (w.totalVolume || 0), 0);

    return { totalVolume, trend, workoutCount: workouts.length };
  }

  async getConsistencyStats(userId: number) {
    const workouts = await prisma.workout.findMany({
      where: { userId, status: 'completed' },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' }
    });

    if (workouts.length === 0) return { currentStreak: 0, bestStreak: 0, heatmap: {} };

    // Heatmap Data
    const heatmap = workouts.reduce((acc: Record<string, number>, w: any) => {
        const date = w.completedAt?.toISOString().split('T')[0];
        if (date) acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Streak Logic
    let currentStreak = 0;
    const sortedDates = Array.from(new Set(workouts.map((w: any) => w.completedAt?.toISOString().split('T')[0]))).sort().reverse();
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const lastWorkoutDate = sortedDates[0];
    if (lastWorkoutDate === today || lastWorkoutDate === yesterday) {
        currentStreak = 1;
        let prevDate = new Date(lastWorkoutDate);
        for (let i = 1; i < sortedDates.length; i++) {
             const curr = new Date(sortedDates[i] as string);
             const diff = (prevDate.getTime() - curr.getTime()) / (1000 * 3600 * 24);
             if (diff <= 1.1) { 
                 currentStreak++;
                 prevDate = curr;
             } else {
                 break;
             }
        }
    }

    return { currentStreak, heatmap };
  }

  /**
   * 3.4 Muscle Analysis (3D Heatmap & Imbalances)
   */
  async getMuscleDistribution(userId: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const workoutExercises = await prisma.workoutExercise.findMany({
      where: {
        workout: {
            userId,
            completedAt: { gte: startDate }
        }
      },
      include: {
        exercise: {
          select: { primaryMuscleGroups: true, secondaryMuscleGroups: true }
        },
        sets: true
      }
    });

    const muscleSets: Record<string, number> = {};

    workoutExercises.forEach((we: any) => {
        const validSets = we.sets.filter((s: any) => s.completed).length;
        if (validSets === 0) return;

        we.exercise.primaryMuscleGroups.forEach((m: string) => {
            muscleSets[m] = (muscleSets[m] || 0) + validSets;
        });
        we.exercise.secondaryMuscleGroups.forEach((m: string) => {
            muscleSets[m] = (muscleSets[m] || 0) + (validSets * 0.5);
        });
    });

    return {
        muscleSets,
        imbalances: this.detectImbalances(muscleSets)
    };
  }

  private detectImbalances(muscleSets: Record<string, number>) {
    const pushMuscles = ['chest', 'shoulders', 'triceps', 'quadriceps'];
    const pullMuscles = ['back', 'biceps', 'hamstrings', 'traps'];
    
    let pushVol = 0;
    let pullVol = 0;

    pushMuscles.forEach(m => pushVol += (muscleSets[m] || 0));
    pullMuscles.forEach(m => pullVol += (muscleSets[m] || 0));

    const total = pushVol + pullVol || 1;
    return {
        pushRatio: parseFloat((pushVol / total).toFixed(2)),
        pullRatio: parseFloat((pullVol / total).toFixed(2)),
        alert: Math.abs(pushVol - pullVol) > (total * 0.2) ? "Signification Push/Pull Imbalance detected" : null
    };
  }

  /**
   * 3.5 Recovery Tracker
   */
  async getRecoveryStatus(userId: number) {
     const workouts = await prisma.workout.findMany({
        where: { userId, status: 'completed' },
        include: { exercises: { include: { exercise: true } } },
        orderBy: { completedAt: 'desc' },
        take: 5
     });

     const muscleLastTrain: Record<string, number> = {};
     
     workouts.forEach((w: any) => {
         const hoursAgo = (new Date().getTime() - new Date(w.completedAt!).getTime()) / (1000 * 60 * 60);
         w.exercises.forEach((e: any) => {
             e.exercise.primaryMuscleGroups.forEach((m: string) => {
                 if (muscleLastTrain[m] === undefined || hoursAgo < muscleLastTrain[m]) {
                     muscleLastTrain[m] = hoursAgo;
                 }
             });
         });
     });

     const recovery: Record<string, any> = {};
     const muscles = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core']; 
     
     muscles.forEach(m => {
         const hours = muscleLastTrain[m];
         if (hours === undefined) {
             recovery[m] = { freshness: 100, status: 'Fresh' };
         } else {
             let fresh = Math.min(100, (hours / 48) * 100);
             recovery[m] = {
                 freshness: Math.round(fresh),
                 status: fresh < 30 ? 'Fatigued' : (fresh < 80 ? 'Recovering' : 'Fresh')
             };
         }
     });

     return recovery;
  }
  /**
   * 3.1 Get Strength Progression for an Exercise
   * Returns a history of PRs or max lifts for charting.
   */
  async getStrengthProgression(userId: number, exerciseId: number) {
    const prs = await prisma.personalRecord.findMany({
      where: { userId, exerciseId, recordType: 'estimated_1rm' }, // Use 1RM for consistent strength tracking
      orderBy: { date: 'asc' },
    });

    if (prs.length === 0) {
       // Fallback to max_weight if no estimated 1RM calculated yet
       const maxWeightPrs = await prisma.personalRecord.findMany({
          where: { userId, exerciseId, recordType: 'max_weight' },
          orderBy: { date: 'asc' },
       });
       return maxWeightPrs;
    }

    return prs;
  }

  /**
   * 3.2 Get Workout Frequency
   * Returns consistent workout counts per week/month.
   */
  async getWorkoutFrequency(userId: number, timeframe: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    // Default to last 3 months for 'month' view, or 1 year for 'year' view
    const startDate = new Date();
    if (timeframe === 'week') startDate.setDate(now.getDate() - 7);
    else if (timeframe === 'month') startDate.setMonth(now.getMonth() - 3); // Last 3 months trend
    else startDate.setFullYear(now.getFullYear() - 1);

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        completedAt: { gte: startDate },
        status: 'completed',
      },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    });

    // Group by week or month based on timeframe request could be refined
    // For now, return raw count and simple frequency calculation
    const daysSinceStart = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    const frequencyPerWeek = (workouts.length / daysSinceStart) * 7;

    return {
        totalWorkouts: workouts.length,
        frequencyPerWeek: parseFloat(frequencyPerWeek.toFixed(2)),
        timeframe,
        data: workouts // Frontend can bin this
    };
  }
}

export const statsService = new StatsService();
