/**
 * chatStore.ts — AI Coach Conversation Store
 *
 * Manages all chat conversations, messages, and streaming state
 * for the ChatGPT-like AI Coach section.
 */

import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';
export type MessageReaction = 'up' | 'down' | null;
export type AIModel = 'pro' | 'fast';

export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
    /** Partial content during streaming */
    streamingContent?: string;
    isStreaming?: boolean;
    timestamp: number;
    reaction?: MessageReaction;
    isEdited?: boolean;
}

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
    /** Preview snippet for history list */
    preview: string;
    isPinned?: boolean;
    model?: AIModel;
}

interface ChatState {
    conversations: Conversation[];
    activeConversationId: string | null;
    isGenerating: boolean;
    streamingMessageId: string | null;
    selectedModel: AIModel;
}

interface ChatActions {
    createConversation: (initialPrompt?: string) => string;
    setActiveConversation: (id: string | null) => void;
    addUserMessage: (conversationId: string, content: string) => ChatMessage;
    startStreamingResponse: (conversationId: string) => string;
    appendStreamingToken: (conversationId: string, messageId: string, token: string) => void;
    completeStreaming: (conversationId: string, messageId: string) => void;
    deleteConversation: (id: string) => void;
    clearAll: () => void;
    getConversation: (id: string) => Conversation | undefined;
    renameConversation: (id: string, title: string) => void;
    pinConversation: (id: string, pinned: boolean) => void;
    reactToMessage: (conversationId: string, messageId: string, reaction: MessageReaction) => void;
    deleteMessage: (conversationId: string, messageId: string) => void;
    editMessage: (conversationId: string, messageId: string, newContent: string) => void;
    setModel: (model: AIModel) => void;
}

// ─── AI Response Simulator ───────────────────────────────────────────────────

const FITNESS_RESPONSES: Record<string, string> = {
    workout: `Here's a **Push Day** workout tailored for you:

## Chest & Shoulders
- **Bench Press** — 4 sets × 8 reps @ 75% 1RM
- **Incline Dumbbell Press** — 3 sets × 10 reps
- **Cable Flies** — 3 sets × 12 reps (squeeze at peak!)

## Shoulders
- **Overhead Press** — 4 sets × 8 reps
- **Lateral Raises** — 3 sets × 15 reps (light weight, strict form)
- **Face Pulls** — 3 sets × 15 reps

## Triceps
- **Tricep Pushdowns** — 3 sets × 12 reps
- **Skull Crushers** — 3 sets × 10 reps

**Rest periods:** 90–120s between compound lifts, 60s for isolation.

> 💡 *Pro tip:* Focus on the mind-muscle connection on isolation work — it matters more than weight here.`,

    nutrition: `Based on your profile, here's your **personalized nutrition blueprint**:

## Daily Targets
| Macro | Amount | Source |
|-------|--------|--------|
| **Protein** | 180g | 2.0g per kg bodyweight |
| **Carbs** | 250g | Focus around workouts |
| **Fats** | 65g | Prioritize unsaturated |

## Meal Timing
1. **Pre-workout (60–90 min before):** Complex carbs + protein
   - Example: Oats with whey protein
2. **Post-workout (within 30 min):** Fast carbs + protein
   - Example: Rice cakes + protein shake
3. **Before bed:** Slow-digesting protein
   - Example: Cottage cheese or casein

## Hydration
- **Minimum:** 3L water/day
- **Training days:** Add 500–750ml per hour of training

\`\`\`
Water needs = 35ml × bodyweight (kg) + sweat losses
\`\`\`

Want me to generate a full 7-day meal plan?`,

    progress: `Here's your **progress analysis** from the last 12 weeks:

## Strength Gains 💪
- **Bench Press:** +12.5kg (↑18%)
- **Squat:** +20kg (↑22%)
- **Deadlift:** +17.5kg (↑16%)

## Volume Metrics 📈
Your weekly training volume has increased by **~28%**, which is within the optimal 10–20% progressive overload range per phase.

## Consistency Score
\`\`\`
Workouts completed: 34/36 planned (94.4%)
Streak: 23 days 🔥
\`\`\`

## Key Observations
- **Recovery** is excellent — HRV data shows good adaptation
- **Sleep quality** dipped in week 8 — consider deload next cycle
- **Weakest lift:** Overhead Press needs attention

## Recommendations
1. Prioritize OHP to 2× per week
2. Add 1 deload week after week 12
3. Increase protein to 200g on training days

You're making **exceptional progress** — top 5% for your experience level! 🏆`,

    goals: `Let's set **SMART fitness goals** that will actually stick:

## Goal-Setting Framework

**S** — *Specific*: "Increase bench press to 100kg" not "get stronger"
**M** — *Measurable*: Track every session with exact numbers
**A** — *Achievable*: 1–2% improvement per week is realistic
**R** — *Relevant*: Aligns with your primary objective (muscle / strength / endurance)
**T** — *Time-bound*: Set a 12-week checkpoint

## Recommended Goal Structure

### Short-term (4 weeks)
- Complete all 4 planned workouts per week
- Hit daily protein target 5+ days per week

### Medium-term (12 weeks)
- Add 10% to main compound lifts
- Reach target bodyweight ±2kg

### Long-term (6 months)
- Qualify for your first powerlifting meet **OR** achieve visible body recomposition

What's your **primary focus** right now — strength, muscle growth, or fat loss? I'll create a personalized roadmap for you.`,

    recovery: `Here's a comprehensive **recovery protocol** to maximize your gains:

## Sleep Optimization
- **Target:** 7–9 hours per night
- Aim for **consistent sleep/wake times** (within 30 min)
- Keep bedroom **cold (16–19°C)** and dark

## Active Recovery Techniques

| Method | When | Duration |
|--------|------|----------|
| **Foam rolling** | Post-workout | 10–15 min |
| **Light walking** | Rest days | 20–30 min |
| **Cold shower** | Morning | 2–3 min |
| **Epsom salt bath** | After intense sessions | 20 min |

## Nutrition for Recovery
1. **Post-workout window (30 min):** 40g protein + 80g fast carbs
2. **Omega-3s:** 3–5g EPA+DHA daily to reduce inflammation
3. **Magnesium:** 300–400mg before bed for sleep quality

## Signs You're Under-Recovered
- Persistent soreness >72 hours
- Drop in performance 3+ sessions in a row
- Resting HR elevated by >5 bpm
- Mood changes, irritability

> ⚠️ *If you see 3+ signs, take a full deload week.*`,

    supplements: `Here's a science-backed **supplement guide** for your goals:

## Tier 1 — Strong Evidence
These supplements have *robust clinical data*:

\`\`\`
Creatine Monohydrate  →  5g/day (any time)
Caffeine              →  3–6mg/kg, 30–60 min pre-workout
Protein powder        →  Fill gaps to hit daily targets
\`\`\`

## Tier 2 — Good Evidence
- **Beta-Alanine:** 3.2–6.4g/day — reduces muscular fatigue (causes tingling)
- **Citrulline Malate:** 6–8g pre-workout — improves endurance and pump
- **Vitamin D3:** 2,000–5,000 IU/day if deficient (test first)

## Tier 3 — Situational
- **Magnesium Glycinate** — for sleep and recovery
- **Ashwagandha** — cortisol reduction under high stress
- **Collagen Peptides** — joint health with Vitamin C

## What to Skip
- Pre-workouts with proprietary blends
- Fat burners (largely ineffective and potentially harmful)
- BCAAs (redundant if protein intake is adequate)

> 💊 *Always consult a healthcare professional before starting new supplements.*`,

    cardio: `Here's an **optimal cardio strategy** based on your goals:

## Zone 2 Training (Base Building)
**Heart Rate:** 60–70% max HR (you can hold a conversation)
- **Frequency:** 3–4× per week, 30–45 min sessions
- **Best modalities:** Cycling, incline walking, rowing

## HIIT Protocol
**For fat loss and VO2 max:**

| Phase | Work | Rest | Rounds |
|-------|------|------|--------|
| Warm-up | — | — | 5 min |
| Sprint | 20 sec | 40 sec | 8 rounds |
| Cool-down | — | — | 5 min |

## Cardio + Lifting Integration
1. **Concurrent training order:** Lift first, cardio after
2. **Minimum gap:** 6 hours between sessions if on same day
3. **Recovery:** Low-intensity cardio on rest days is fine

## VO2 Max Benchmarks
\`\`\`
Elite:     > 60 ml/kg/min
Good:      50–60 ml/kg/min
Average:   40–50 ml/kg/min
Poor:      < 40 ml/kg/min
\`\`\`

How many days per week can you dedicate to cardio? I'll build a specific plan.`,

    form: `Here's a **form troubleshooting guide** for the main compound lifts:

## Squat Common Fixes
- **Knees caving inward** → Strengthen glutes (banded squats, clamshells)
- **Forward lean** → Improve ankle mobility + thoracic extension
- **Butt wink** → Reduce depth until flexibility improves

## Bench Press Common Fixes
- **Bar path drifting forward** → Press in a slight arc toward face
- **Flared elbows** → Tuck to 45–75° for shoulder health
- **Leg drive missing** → Drive heels into floor, arch your lower back

## Deadlift Common Fixes
- **Bar drifting from body** → Drag the bar up your shins
- **Rounding lower back** → Brace harder before initiating pull
- **Hyperextending at top** → Lock out by squeezing glutes, not leaning back

## General Principles
1. **Record yourself** — side angle for squats/deadlifts, front for bench
2. **Film at slow motion** (240fps on iPhone) to catch errors
3. **Warm up sets:** Film these, not just working sets

> 🎥 *Use our Form Analysis feature to upload video for real-time AI feedback!*`,

    mobility: `Here's a **mobility routine** to improve performance and prevent injury:

## Morning Routine (10 min)
Complete this before breakfast for best results:

1. **Cat-Cow** — 10 reps (spinal mobility)
2. **World's Greatest Stretch** — 5/side
3. **Hip 90/90** — 2 min hold/side
4. **Thoracic Rotation** — 10 reps/side
5. **Band Pull-Aparts** — 3 × 20

## Pre-Workout Activation (5 min)
| Exercise | Sets | Notes |
|----------|------|-------|
| Glute Bridge | 2 × 15 | Pause at top |
| Side-lying Clam | 2 × 15 | Slow, controlled |
| Wall Slide | 2 × 10 | Maximize scapular ROM |

## Targeted Flexibility (Post-Workout)

### Hip Flexors (priority for desk workers):
- **Couch stretch** — 2 min/side
- **Pigeon pose** — 90 sec/side

### Shoulders:
- **Doorway stretch** — 30 sec/position, 3 positions
- **Sleeper stretch** — 60 sec/side

Consistency beats intensity here — 10 min daily > 1 hour weekly.`,

    sleep: `**Sleep is your #1 performance enhancer** — here's how to optimize it:

## Sleep Targets
\`\`\`
Total sleep:     7.5–9 hours
Deep sleep:      1.5–2 hours (20%)
REM sleep:       1.5–2 hours (20%)
Bed consistency: ±30 min same time daily
\`\`\`

## Optimization Protocol

### Environment
- **Temperature:** 16–19°C (61–67°F) — cooler is almost always better
- **Darkness:** Blackout curtains or sleep mask
- **Sound:** White/brown noise if you're a light sleeper

### Pre-Sleep Routine (90 min before bed)
1. Dim lights to 50% (triggers melatonin)
2. Avoid screens or use blue-light glasses
3. Magnesium glycinate 300mg
4. Light stretching or yoga
5. Review tomorrow (reduces rumination)

### Avoid
- **Caffeine:** No caffeine 8–10 hours before bed
- **Alcohol:** Disrupts deep sleep even in small amounts
- **Large meals:** Last large meal 3+ hours before sleep

## For Athletes
- Growth hormone peaks in **first 2 hours of sleep**
- **Sleep debt** reduces testosterone by up to 15%
- Add 30–60 min extra sleep on hard training days`,

    default: `I'm your **FlexAI Coach** — your AI-powered personal trainer! Here's how I can help:

## What I Can Do

### 🏋️ Training
- Design custom workout programs
- Optimize exercise selection for your goals
- Explain form and technique for any exercise
- Plan deload weeks and periodization

### 🥗 Nutrition
- Create personalized meal plans
- Calculate macros and calories
- Suggest pre/post workout nutrition

### 📊 Progress
- Analyze your strength progression
- Identify weaknesses and imbalances
- Compare your lifts to population norms

### 😴 Recovery & Sleep
- Optimize sleep for performance
- Design recovery protocols
- Assess overtraining risk

### 💊 Supplements
- Evidence-based supplement recommendations
- Avoid wasted money on unproven products

### 🎯 Goal Setting
- Create SMART fitness goals
- Build accountability systems
- Design 12-week transformation plans

Just ask me anything — I'm here to help you reach your peak performance! 💪`,
};

export function getMockAIResponse(userMessage: string): string {
    const lower = userMessage.toLowerCase();
    if (lower.includes('workout') || lower.includes('train') || lower.includes('exercise') || lower.includes('push') || lower.includes('pull') || lower.includes('leg') || lower.includes('chest') || lower.includes('back')) {
        return FITNESS_RESPONSES.workout;
    }
    if (lower.includes('nutrition') || lower.includes('diet') || lower.includes('eat') || lower.includes('food') || lower.includes('macro') || lower.includes('protein') || lower.includes('calori')) {
        return FITNESS_RESPONSES.nutrition;
    }
    if (lower.includes('progress') || lower.includes('analyz') || lower.includes('improve') || lower.includes('gain') || lower.includes('result')) {
        return FITNESS_RESPONSES.progress;
    }
    if (lower.includes('goal') || lower.includes('target') || lower.includes('plan') || lower.includes('roadmap')) {
        return FITNESS_RESPONSES.goals;
    }
    if (lower.includes('recover') || lower.includes('sore') || lower.includes('rest') || lower.includes('deload')) {
        return FITNESS_RESPONSES.recovery;
    }
    if (lower.includes('supplement') || lower.includes('creatine') || lower.includes('protein powder') || lower.includes('pre-workout') || lower.includes('bcaa')) {
        return FITNESS_RESPONSES.supplements;
    }
    if (lower.includes('cardio') || lower.includes('run') || lower.includes('hiit') || lower.includes('zone') || lower.includes('endurance') || lower.includes('vo2')) {
        return FITNESS_RESPONSES.cardio;
    }
    if (lower.includes('form') || lower.includes('technique') || lower.includes('squat') || lower.includes('bench') || lower.includes('deadlift') || lower.includes('posture')) {
        return FITNESS_RESPONSES.form;
    }
    if (lower.includes('mobil') || lower.includes('flexib') || lower.includes('stretch') || lower.includes('tight') || lower.includes('hip')) {
        return FITNESS_RESPONSES.mobility;
    }
    if (lower.includes('sleep') || lower.includes('insomnia') || lower.includes('tired') || lower.includes('fatigue') || lower.includes('energy') || lower.includes('hrv')) {
        return FITNESS_RESPONSES.sleep;
    }
    return FITNESS_RESPONSES.default;
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateTitle(firstMessage: string): string {
    const words = firstMessage.trim().split(' ').slice(0, 6).join(' ');
    return words.length < firstMessage.length ? `${words}...` : words;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const INITIAL_STATE: ChatState = {
    conversations: [
        {
            id: 'demo-1',
            title: 'Push Day Workout Plan',
            messages: [
                {
                    id: 'msg-1',
                    role: 'user',
                    content: 'Create a push day workout for me',
                    timestamp: Date.now() - 7200000,
                },
                {
                    id: 'msg-2',
                    role: 'assistant',
                    content: FITNESS_RESPONSES.workout,
                    timestamp: Date.now() - 7190000,
                    reaction: null,
                },
            ],
            createdAt: Date.now() - 7200000,
            updatedAt: Date.now() - 7190000,
            preview: "Here's a Push Day workout tailored for you...",
            isPinned: true,
            model: 'pro',
        },
        {
            id: 'demo-2',
            title: 'Protein & Nutrition Guide',
            messages: [
                {
                    id: 'msg-3',
                    role: 'user',
                    content: 'How much protein do I need daily?',
                    timestamp: Date.now() - 86400000,
                },
                {
                    id: 'msg-4',
                    role: 'assistant',
                    content: FITNESS_RESPONSES.nutrition,
                    timestamp: Date.now() - 86390000,
                    reaction: 'up',
                },
            ],
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 86390000,
            preview: "Based on your profile, here's your personalized nutrition...",
            isPinned: false,
            model: 'pro',
        },
        {
            id: 'demo-3',
            title: 'Progress Analysis',
            messages: [
                {
                    id: 'msg-5',
                    role: 'user',
                    content: 'Analyze my progress this month',
                    timestamp: Date.now() - 259200000,
                },
                {
                    id: 'msg-6',
                    role: 'assistant',
                    content: FITNESS_RESPONSES.progress,
                    timestamp: Date.now() - 259190000,
                    reaction: null,
                },
            ],
            createdAt: Date.now() - 259200000,
            updatedAt: Date.now() - 259190000,
            preview: "Here's your progress analysis from the last 12 weeks...",
            isPinned: false,
            model: 'fast',
        },
        {
            id: 'demo-4',
            title: 'Sleep & Recovery Protocol',
            messages: [
                {
                    id: 'msg-7',
                    role: 'user',
                    content: "I'm always tired after training — how do I fix my sleep?",
                    timestamp: Date.now() - 432000000,
                },
                {
                    id: 'msg-8',
                    role: 'assistant',
                    content: FITNESS_RESPONSES.sleep,
                    timestamp: Date.now() - 431990000,
                    reaction: null,
                },
            ],
            createdAt: Date.now() - 432000000,
            updatedAt: Date.now() - 431990000,
            preview: 'Sleep is your #1 performance enhancer...',
            isPinned: false,
            model: 'pro',
        },
    ],
    activeConversationId: null,
    isGenerating: false,
    streamingMessageId: null,
    selectedModel: 'pro',
};

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
    ...INITIAL_STATE,

    createConversation: (initialPrompt?: string) => {
        const id = generateId();
        const now = Date.now();
        const conversation: Conversation = {
            id,
            title: initialPrompt ? generateTitle(initialPrompt) : 'New Chat',
            messages: [],
            createdAt: now,
            updatedAt: now,
            preview: initialPrompt ?? 'New conversation',
            isPinned: false,
            model: get().selectedModel,
        };
        set((state) => ({
            conversations: [conversation, ...state.conversations],
            activeConversationId: id,
        }));
        return id;
    },

    setActiveConversation: (id) => set({ activeConversationId: id }),

    addUserMessage: (conversationId, content) => {
        const message: ChatMessage = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: Date.now(),
            reaction: null,
        };
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? {
                          ...c,
                          messages: [...c.messages, message],
                          updatedAt: Date.now(),
                          preview: content.substring(0, 80),
                          title: c.messages.length === 0 ? generateTitle(content) : c.title,
                      }
                    : c
            ),
        }));
        return message;
    },

    startStreamingResponse: (conversationId) => {
        const messageId = generateId();
        const message: ChatMessage = {
            id: messageId,
            role: 'assistant',
            content: '',
            streamingContent: '',
            isStreaming: true,
            timestamp: Date.now(),
            reaction: null,
        };
        set((state) => ({
            isGenerating: true,
            streamingMessageId: messageId,
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() }
                    : c
            ),
        }));
        return messageId;
    },

    appendStreamingToken: (conversationId, messageId, token) => {
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? {
                          ...c,
                          messages: c.messages.map((m) =>
                              m.id === messageId
                                  ? { ...m, streamingContent: (m.streamingContent ?? '') + token }
                                  : m
                          ),
                      }
                    : c
            ),
        }));
    },

    completeStreaming: (conversationId, messageId) => {
        set((state) => ({
            isGenerating: false,
            streamingMessageId: null,
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? {
                          ...c,
                          messages: c.messages.map((m) =>
                              m.id === messageId
                                  ? {
                                        ...m,
                                        content: m.streamingContent ?? m.content,
                                        streamingContent: undefined,
                                        isStreaming: false,
                                    }
                                  : m
                          ),
                          updatedAt: Date.now(),
                      }
                    : c
            ),
        }));
    },

    deleteConversation: (id) => {
        set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== id),
            activeConversationId:
                state.activeConversationId === id ? null : state.activeConversationId,
        }));
    },

    clearAll: () => set({ conversations: [], activeConversationId: null }),

    getConversation: (id) => get().conversations.find((c) => c.id === id),

    renameConversation: (id, title) => {
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === id ? { ...c, title: title.trim() || c.title } : c
            ),
        }));
    },

    pinConversation: (id, pinned) => {
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === id ? { ...c, isPinned: pinned } : c
            ),
        }));
    },

    reactToMessage: (conversationId, messageId, reaction) => {
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? {
                          ...c,
                          messages: c.messages.map((m) =>
                              m.id === messageId
                                  ? { ...m, reaction: m.reaction === reaction ? null : reaction }
                                  : m
                          ),
                      }
                    : c
            ),
        }));
    },

    deleteMessage: (conversationId, messageId) => {
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? {
                          ...c,
                          messages: c.messages.filter((m) => m.id !== messageId),
                          updatedAt: Date.now(),
                      }
                    : c
            ),
        }));
    },

    editMessage: (conversationId, messageId, newContent) => {
        set((state) => ({
            conversations: state.conversations.map((c) =>
                c.id === conversationId
                    ? {
                          ...c,
                          messages: c.messages.map((m) =>
                              m.id === messageId
                                  ? {
                                        ...m,
                                        content: newContent,
                                        isEdited: true,
                                        timestamp: m.timestamp,
                                    }
                                  : m
                          ),
                          updatedAt: Date.now(),
                          preview: newContent.substring(0, 80),
                      }
                    : c
            ),
        }));
    },

    setModel: (model) => set({ selectedModel: model }),
}));
