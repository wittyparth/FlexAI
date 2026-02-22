import { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';

type MuscleRule = {
  pattern: RegExp;
  slugs: ReadonlyArray<Slug>;
};

const MUSCLE_RULES: ReadonlyArray<MuscleRule> = [
  { pattern: /(upper[\s-]?back|trap|trapez|rhomboid|rear[\s-]?delt)/i, slugs: ['upper-back', 'trapezius'] },
  { pattern: /(lower[\s-]?back|erector)/i, slugs: ['lower-back'] },
  { pattern: /(back|lat)/i, slugs: ['upper-back', 'lower-back', 'trapezius'] },
  { pattern: /(chest|pec)/i, slugs: ['chest'] },
  { pattern: /(shoulder|delt)/i, slugs: ['deltoids', 'trapezius'] },
  { pattern: /(bicep)/i, slugs: ['biceps', 'forearm'] },
  { pattern: /(tricep)/i, slugs: ['triceps', 'forearm'] },
  { pattern: /(forearm|wrist|grip)/i, slugs: ['forearm'] },
  { pattern: /(arm)/i, slugs: ['biceps', 'triceps', 'forearm'] },
  { pattern: /(core|abs|abdom|oblique)/i, slugs: ['abs', 'obliques'] },
  { pattern: /(glute)/i, slugs: ['gluteal', 'hamstring'] },
  { pattern: /(hamstring)/i, slugs: ['hamstring', 'gluteal'] },
  { pattern: /(quad)/i, slugs: ['quadriceps', 'adductors', 'tibialis'] },
  { pattern: /(calf)/i, slugs: ['calves', 'tibialis'] },
  { pattern: /(adductor|groin|inner[\s-]?thigh)/i, slugs: ['adductors'] },
  { pattern: /(leg|lower[\s-]?body)/i, slugs: ['quadriceps', 'hamstring', 'calves', 'gluteal'] },
  { pattern: /(full[\s-]?body|cardio)/i, slugs: ['chest', 'upper-back', 'deltoids', 'abs', 'quadriceps', 'hamstring', 'calves'] },
];

const getSlugsForMuscle = (muscleName?: string): ReadonlyArray<Slug> => {
  if (!muscleName) return [];
  const trimmed = muscleName.trim();
  if (!trimmed) return [];

  const rule = MUSCLE_RULES.find((item) => item.pattern.test(trimmed));
  return rule?.slugs ?? [];
};

const toIntensity = (ratio: number): number => {
  if (ratio >= 0.75) return 4;
  if (ratio >= 0.5) return 3;
  if (ratio >= 0.25) return 2;
  return 1;
};

export const mergeMuscleInputs = (
  muscleSets?: Record<string, number>,
  muscles?: ReadonlyArray<string>,
): Record<string, number> => {
  const merged: Record<string, number> = {};

  if (muscleSets) {
    Object.entries(muscleSets).forEach(([muscle, value]) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed) || parsed <= 0) return;
      merged[muscle] = (merged[muscle] ?? 0) + parsed;
    });
  }

  if (muscles) {
    muscles.forEach((muscle) => {
      if (!muscle) return;
      const key = muscle.trim();
      if (!key) return;
      merged[key] = (merged[key] ?? 0) + 1;
    });
  }

  return merged;
};

export const buildBodyHighlighterData = (
  muscleSets?: Record<string, number>,
  muscles?: ReadonlyArray<string>,
): ReadonlyArray<ExtendedBodyPart> => {
  const merged = mergeMuscleInputs(muscleSets, muscles);
  const slugScores = new Map<Slug, number>();

  Object.entries(merged).forEach(([muscleName, score]) => {
    const slugs = getSlugsForMuscle(muscleName);
    if (!slugs.length || score <= 0) return;

    const perSlugScore = score / slugs.length;
    slugs.forEach((slug) => {
      slugScores.set(slug, (slugScores.get(slug) ?? 0) + perSlugScore);
    });
  });

  const maxScore = Math.max(...Array.from(slugScores.values()), 0);
  if (maxScore <= 0) return [];

  return Array.from(slugScores.entries())
    .map(([slug, score]) => {
      const intensity = toIntensity(score / maxScore);
      return { slug, intensity };
    })
    .sort((a, b) => (b.intensity ?? 0) - (a.intensity ?? 0));
};

