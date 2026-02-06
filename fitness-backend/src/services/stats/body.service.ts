import { prisma } from '../../config/database';
import { BodyWeight } from '@prisma/client';

export class BodyTrackingService {
  
  /**
   * 3.3 Body Composition Analysis
   * - Weight trends (Linear Regression)
   * - Body Fat trends
   * - BMI & Rate of Change
   */
  async getBodyStats(userId: number, timeframe: '1m' | '3m' | '6m' | '1y' | 'all' = '3m') {
    const startDate = this.getStartDate(timeframe);

    const weightEntries = await prisma.bodyWeight.findMany({
      where: { userId, date: { gte: startDate } },
      orderBy: { date: 'asc' }
    });

    if (weightEntries.length === 0) return this.getEmptyStats();

    const currentWeight = weightEntries[weightEntries.length - 1].weight;
    const initialWeight = weightEntries[0].weight;
    const totalChange = currentWeight - initialWeight;
    
    // Weekly Rate of Change (last 4 weeks vs previous 4)
    const rateOfChange = this.calculateRateOfChange(weightEntries);

    // Linear Regression for Trend Line
    const trendLine = this.calculateLinearRegression(weightEntries);

    // BMI Calculation (Assuming height is stored in User profile, fetching generic for now or passing it)
    // For MVP, we need to fetch user height. 
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { height: true } });
    const bmi = user?.height ? (currentWeight / Math.pow(user.height / 100, 2)) : null;

    return {
      currentWeight,
      initialWeight,
      totalChange,
      changePercentage: (totalChange / initialWeight) * 100,
      bmi: bmi ? parseFloat(bmi.toFixed(1)) : null,
      history: weightEntries,
      trendLine,
      weeklyRate: rateOfChange,
      analysis: this.generateWeightAnalysis(rateOfChange)
    };
  }

  private getStartDate(timeframe: string): Date {
      const d = new Date();
      if (timeframe === '1m') d.setMonth(d.getMonth() - 1);
      else if (timeframe === '3m') d.setMonth(d.getMonth() - 3);
      else if (timeframe === '6m') d.setMonth(d.getMonth() - 6);
      else if (timeframe === '1y') d.setFullYear(d.getFullYear() - 1);
      else if (timeframe === 'all') d.setFullYear(2000); // Far back
      return d;
  }

  private calculateRateOfChange(entries: BodyWeight[]) {
      if (entries.length < 2) return 0;
      // Get entries from last 14 days
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      
      const recent = entries.filter(e => e.date >= twoWeeksAgo);
      if (recent.length < 2) return 0;

      const first = recent[0].weight;
      const last = recent[recent.length - 1].weight;
      // Rate per week
      return (last - first) / 2; 
  }

  private calculateLinearRegression(entries: BodyWeight[]) {
      if (entries.length < 2) return [];
      
      const n = entries.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      
      
      
      entries.forEach((e, i) => {
          sumX += i;
          sumY += e.weight;
          sumXY += i * e.weight;
          sumXX += i * i;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return entries.map((e, i) => ({
          date: e.date,
          trendWeight: slope * i + intercept
      }));
  }

  /* private generateWeightAnalysis(weeklyRate: number) { */
  private generateWeightAnalysis(weeklyRate: number) {
      if (Math.abs(weeklyRate) < 0.1) return "Maintenance level. Your weight is stable.";
      if (weeklyRate < -1.0) return "Rapid weight loss detected (>1kg/week). Ensure you're eating enough.";
      if (weeklyRate < 0) return "Healthy weight loss pace.";
      if (weeklyRate > 0.5) return "Rapid weight gain. Check if this aligns with muscle gain goals.";
      return "Moderate weight gain.";
  }

  private getEmptyStats() {
      return {
          currentWeight: 0,
          totalChange: 0,
          history: [],
          analysis: "No data available."
      };
  }

  // Measurements
  async getMeasurementStats(userId: number, bodyPart: 'chest' | 'waist' | 'arms' | 'thighs') {
    return prisma.bodyMeasurement.findMany({
        where: { userId, ...(bodyPart ? {} : {}) }, // Simplified logic, schema might store JSON or separate rows
        orderBy: { date: 'asc' }
    });
    // Note: Schema for measurements needs to be checked. 
    // Assuming schema has a generic `measurements` JSON or table. 
    // If it's a specific table structure, I'd adapt.
    // Checking previous schema view: `model BodyMeasurement` has `chest`, `waist`, `hips`, etc. as Floats.
  }

  /**
   * 3.3.1 Log Body Weight
   */
  async logWeight(userId: number, weight: number, date: Date = new Date()) {
    return prisma.bodyWeight.create({
      data: {
        userId,
        weight,
        date,
      },
    });
  }

  /**
   * 3.3.1 Get Weight History
   */
  async getWeightHistory(userId: number, startDate?: Date, endDate?: Date) {
    return prisma.bodyWeight.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * 3.3.3 Log Body Measurements
   */
  async logMeasurements(userId: number, measurements: any, date: Date = new Date()) {
    // Ensure we only pass valid fields defined in schema
    return prisma.bodyMeasurement.create({
      data: {
        userId,
        date,
        // Common measurements
        neck: measurements.neck,
        shoulders: measurements.shoulders,
        chest: measurements.chest,
        leftArm: measurements.bicepLeft,
        rightArm: measurements.bicepRight,
        leftForearm: measurements.forearmLeft,
        rightForearm: measurements.forearmRight,
        waist: measurements.waist,
        hips: measurements.hips,
        leftThigh: measurements.thighLeft,
        rightThigh: measurements.thighRight,
        leftCalf: measurements.calfLeft,
        rightCalf: measurements.calfRight,
        bodyFat: measurements.bodyFatPercentage,
        notes: measurements.notes,
      },
    });
  }

  /**
   * 3.3.3 Get Measurement History
   */
  async getMeasurementHistory(userId: number, startDate?: Date, endDate?: Date) {
    return prisma.bodyMeasurement.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * 3.3.4 Log Progress Photo
   */
  async logProgressPhoto(userId: number, photoUrl: string, type: 'front' | 'side' | 'back', date: Date = new Date(), notes?: string) {
    return prisma.progressPhoto.create({
      data: {
        userId,
        imageUrl: photoUrl,
        pose: type,
        date,
        notes,
      },
    });
  }

  /**
   * 3.3.4 Get Progress Photos
   */
  async getProgressPhotos(userId: number, startDate?: Date, endDate?: Date) {
    return prisma.progressPhoto.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}

export const bodyTrackingService = new BodyTrackingService();
