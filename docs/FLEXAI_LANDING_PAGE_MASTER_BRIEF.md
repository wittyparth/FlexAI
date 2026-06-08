# FlexAI Landing Page Master Brief

Version: 1.0  
Date: 2026-03-22  
Owner: Product + Growth

## 1) Purpose Of This Document

This document is the single source of truth for generating a high-converting landing page for FlexAI.

Use this when working with:
- AI website builders
- AI copywriting models
- Designers creating website sections
- Motion/UI teams building hero and screenshots
- Marketing and product stakeholders

It includes:
- Product positioning
- Target personas and jobs-to-be-done
- Full feature inventory (implemented + planned)
- Differentiation and creative angles
- Messaging hierarchy
- Landing page information architecture
- Screenshot plan with visual direction
- Conversion strategy and CTAs
- Prompt-ready AI handoff block

## 2) Product Snapshot

Product name: FlexAI  
Category: AI-powered fitness app (mobile-first, full-stack platform)  
Core value proposition: Personal trainer intelligence, workout tracking, and social motivation in one app

Current platform architecture:
- Mobile app: Expo + React Native + TypeScript
- API backend: Express + TypeScript + Prisma
- Database: PostgreSQL
- Cache and jobs: Redis + BullMQ
- AI layer: Coach + AI generation modules + pose/form-check foundation

## 3) Positioning Statement

For people who want measurable fitness progress without decision fatigue, FlexAI combines structured training, intelligent recommendations, and real accountability in one experience.

Unlike basic workout trackers or generic AI chat fitness tools, FlexAI is built as an integrated system:
- Plan
- Execute
- Analyze
- Improve
- Share

All inside a single app.

## 4) Ideal Customer Profiles

### ICP 1: Consistent Gym Builder

Profile:
- Age: 20-35
- Trains 3-6 days per week
- Wants strength or physique progress
- Already uses some tracking app but feels limited

Main pain points:
- Logging is slow and boring
- Program progression is unclear
- Hard to see long-term progress across lifts and body
- Motivation drops when training alone

What FlexAI solves:
- Fast workout execution flow
- Better routine structure and AI support
- Clear analytics and progress visuals
- Social + challenge loops for consistency

### ICP 2: Restarting Fitness Professional

Profile:
- Age: 25-45
- Busy schedule, inconsistent routine
- Wants guided structure and accountability
- Needs confidence and low-friction entry

Main pain points:
- Decision paralysis: what to do each workout
- Drops off after 2-3 weeks
- Poor tracking discipline
- Difficulty adjusting workouts to real life constraints

What FlexAI solves:
- Guided onboarding + personalized path
- Ready-to-run routines and generators
- Session insights and streak mechanics
- Smart progression and manageable execution

### ICP 3: Data-Driven Athlete Mindset

Profile:
- Age: 18-40
- Loves metrics, PRs, progression trends
- Wants advanced stats and performance context

Main pain points:
- Existing apps show shallow analytics
- Hard to detect plateaus early
- No integrated history + action plan loop

What FlexAI solves:
- Strength and volume analytics
- Muscle distribution and progression views
- Coach interaction and recommendation loop
- Better feedback system between data and decisions

## 5) Jobs To Be Done (JTBD)

Primary functional jobs:
- Help me know exactly what to do today
- Help me log workouts quickly without interruption
- Help me improve form and quality over time
- Help me understand if I am actually progressing
- Help me stay consistent through motivation and accountability

Primary emotional jobs:
- Make me feel in control of my progress
- Reduce anxiety around training decisions
- Give me confidence my effort is paying off
- Make training feel engaging, not repetitive admin

Primary social jobs:
- Let me share wins and connect with like-minded people
- Let me compare and compete in healthy ways

## 6) Product Pillars (For Landing Page Narrative)

Pillar 1: Execute Better Workouts  
Pillar 2: Train Smarter With AI  
Pillar 3: See Real Progress Clearly  
Pillar 4: Stay Consistent Through Community  
Pillar 5: Build Long-Term Fitness Habits

## 7) Feature Inventory (Deep)

This section is split into:
- Implemented now
- Planned and strategic extensions

### 7.1 Authentication, Profile, And Onboarding

Implemented and integrated:
- Registration and login APIs
- Email verification and password reset contracts
- Token refresh and logout contracts
- Profile retrieval/update and avatar upload contracts
- Settings retrieval/update
- Onboarding data capture support

In app flow status notes:
- Core auth screens exist; some are implemented but not fully registered in navigator flows
- Onboarding screen set exists; final navigator registration alignment still in progress

User preference coverage:
- Units
- Notification preferences
- Privacy visibility options
- Profile and onboarding completion updates

### 7.2 Workout And Routine Engine

Implemented and integrated:
- Routine list/detail/editor ecosystem
- Exercise picker and filters
- Active workout execution flow
- Set-level tracking support
- Workout summary and history
- Workout detail and session insight flows

User-facing strength:
- Structured workout path from planning to completion
- Multiple interaction points for personalization
- Fast path to active session from routine context

### 7.3 AI Layer

Implemented foundations:
- AI workout generation screens and API module
- Coach conversation flows and backend contracts
- Conversation history and delete endpoints

Strategic AI direction:
- Context-aware coach recommendations
- Longitudinal coaching using user trends
- Integrated recovery and load suggestions

### 7.4 Exercise Library And Customization

Implemented:
- Explore hub and exercise library flows
- Public routines browsing
- Routine template detail
- Exercise creation pathway

Planned extension:
- Full custom exercise management screen
- Richer exercise discovery and recommendations
- Better in-flow alternatives and substitutions

### 7.5 Social And Community

Implemented:
- Social home
- Create post and post detail
- User profile discovery
- Followers/following list views
- Leaderboards
- Challenges list and challenge detail
- Activity feed
- User search

Planned extension:
- Dedicated workout share screen

### 7.6 Analytics And Progress Tracking

Implemented:
- Stats hub
- Personal records
- Strength progression
- Volume analytics
- Muscle distribution
- Muscle heatmap
- Body tracking hub
- Weight log
- Measurements
- Progress photos list

Planned extension:
- XP history
- Workout frequency analytics screen
- Recovery status screen
- More advanced strength metrics views

### 7.7 Settings And Trust Features

Implemented:
- Account security
- Change password
- Privacy settings
- Notification settings
- Units preferences
- Theme preferences
- Help/support
- About

Security and backend foundation:
- JWT auth architecture
- Input validation with Zod
- Helmet, CORS, rate limiting
- Session and user settings data model support

### 7.8 Notifications And Device Integration

Implemented contracts:
- List notifications with pagination
- Mark one as read
- Mark all as read
- Device token registration

### 7.9 Data Model Depth (Backend)

Core data entities include:
- Users and sessions
- User settings
- Exercises and metadata
- Workouts, workout exercises, and sets
- Routines
- Form check sessions (schema support)
- Coach conversations
- Body measurements and progress photos
- Social content entities
- Achievements and gamification entities
- Notifications and device tokens

This supports a unified product loop: plan -> execute -> analyze -> improve -> engage.

## 8) Differentiation Matrix

### Current practical differentiators

- Broad all-in-one scope across training, analytics, AI, and social
- Strong frontend architecture for high feature velocity
- Domain-specific modules instead of one generic feed app
- Data model breadth that supports advanced progression intelligence

### Strategic differentiators to emphasize in messaging

- AI co-pilot integrated into real workflows, not isolated chat
- Progress visibility from multiple dimensions: performance, volume, muscle, and body metrics
- Social accountability integrated with workout behavior
- Future-ready form-check capability with exercise-specific analysis direction

### Competitive message angle

Most tools do one thing well.
FlexAI is designed to connect the complete fitness behavior loop in one system.

## 9) Feature Prioritization For Marketing (What To Highlight First)

Tier 1 (Hero-level, conversion-driving):
- Smart workout execution and tracking
- AI-assisted planning/coaching
- Clear analytics and progression visuals
- Community accountability (leaderboards/challenges)

Tier 2 (Section-level trust and depth):
- Body tracking and progress photos
- Personal records and strength progression
- Custom routines and exercise creation

Tier 3 (Trust and readiness):
- Privacy and settings controls
- Security architecture foundations
- Notification and reminder support

## 10) Landing Page Information Architecture

Section order recommendation:

1. Hero
2. Problem framing
3. Product loop (Plan -> Train -> Analyze -> Improve)
4. Feature deep-dive blocks
5. Screenshot showcase narrative
6. Social proof placeholders
7. Who FlexAI is for
8. Comparison table
9. FAQ
10. Final CTA strip

### 10.1 Hero Section

Objective:
- Immediate clarity + curiosity + action

Must include:
- Strong one-line promise
- Subheadline with concrete outcomes
- Primary CTA and secondary CTA
- Device mockup area for screenshot collage or short video

Suggested CTA pair:
- Primary: Join Early Access
- Secondary: See Product Tour

### 10.2 Problem Section

Frame frustrations users already feel:
- Scattered tools
- Inconsistent routines
- Weak progress insight
- No intelligent coaching loop

Tone guidance:
- Empathetic, not negative
- Realistic and specific

### 10.3 Product Loop Section

Use a 4 or 5-step visual sequence:
- Plan
- Execute
- Analyze
- Improve
- Share

Each step must show:
- One app screenshot
- One key benefit
- One behavioral outcome

### 10.4 Feature Deep-Dive Blocks

Create 4 flagship blocks:

Block A: Workout OS
- Routine builder
- Active session flow
- History and insights

Block B: AI Intelligence Layer
- AI generator
- Coach conversation
- Personalized guidance

Block C: Analytics Engine
- PR and strength trends
- Volume and muscle distribution
- Body tracking continuity

Block D: Community Engine
- Feed, challenges, leaderboard
- Follow system and activity loops

### 10.5 Screenshot Gallery (Critical)

You said you will create images. Use these exact slots:

Screenshot slot list:
1. Home dashboard
2. Routine detail
3. Active workout tracking
4. Workout summary
5. AI generator
6. Coach chat
7. Stats hub
8. Strength progression
9. Muscle heatmap
10. Body tracking screen
11. Social home
12. Leaderboard/challenges
13. Settings/privacy

For each screenshot, add:
- Micro-headline
- One-line context
- Outcome statement

Example pattern:
- Headline: Train with zero guesswork
- Context: Built routines with fast execution flow
- Outcome: Finish sessions faster and stay consistent

### 10.6 Comparison Section

Table columns:
- Feature area
- Typical fitness tracker
- Generic AI fitness tool
- FlexAI

Rows to compare:
- Structured workout execution
- AI integrated in workflow
- Advanced progression analytics
- Community accountability
- End-to-end app loop

### 10.7 FAQ Section

Minimum FAQ topics:
- Is this beginner-friendly?
- Does it support advanced lifters?
- Is my data private?
- Which devices are supported?
- Does AI replace a real trainer?
- Can I track body progress too?
- Is this useful without social features?
- How is this different from existing apps?

## 11) Messaging Framework

### Core message hierarchy

Level 1 message:
- The all-in-one AI fitness system for real progress

Level 2 proof points:
- Execute workouts fast
- See progression clearly
- Get adaptive guidance
- Stay accountable socially

Level 3 confidence builders:
- Full-stack architecture
- Deep feature set
- Data model designed for long-term progression

### Tone and voice

- Performance-oriented but human
- Practical and specific
- Confident but not exaggerated
- Honest about roadmap items

### What to avoid

- Overclaiming medical outcomes
- Overpromising exact body transformations
- Claiming perfect AI accuracy
- Fake social proof

## 12) Creative Concepts (Special And Differentiated)

Concept 1: Fitness Operating System
- Position FlexAI as the system layer for training life
- Visual metaphor: dashboard cockpit + modular cards

Concept 2: Your Training Feedback Loop
- Show a loop animation from action to insight to adaptation
- Make product feel alive and responsive

Concept 3: Built For Consistency, Not Hype
- Emphasize long-term adherence and progression
- Contrast with short-term challenge apps

Concept 4: One App, Many Modes
- Solo mode, coach mode, social mode, analytics mode
- Reinforces flexibility for different user types

Concept 5: Signal Over Noise
- Message: less friction, better decisions, measurable improvement

## 13) Conversion Strategy

Primary conversion goal:
- Early access signups

Secondary conversion goals:
- Product tour views
- Waitlist intent capture
- App update subscription

High intent trigger points:
- After hero
- After screenshot gallery
- After comparison section
- Final CTA strip

Recommended CTA copy variants:
- Start Your Progress System
- Join FlexAI Early Access
- Get The First Release
- See How FlexAI Works

## 14) Trust And Credibility Elements

Must include:
- Security and privacy stance section
- Transparent product status (what is live vs upcoming)
- Clear support contact path
- Optional changelog snapshot

Optional trust enhancers:
- Founder build story snippet
- Architecture snippet visual
- Roadmap preview with expected milestones

## 15) Product Status Transparency Block (For Honest Marketing)

Use this exact model on the site:

Live now:
- Workout/routine flows
- AI generator and coach foundations
- Stats and body tracking modules
- Social, challenges, and leaderboard foundations
- Account/settings/privacy controls

In progress and upcoming:
- Remaining navigation registration and completion screens
- Additional profile and analytics views
- Dedicated share and custom exercise management views
- Enhanced form-check workflows

Why this matters:
- Builds trust
- Reduces churn from expectation mismatch
- Attracts early adopters who like roadmap transparency

## 16) Asset Checklist For You (Before Building Landing Page)

Prepare these assets:
- App icon and logo variants (light/dark)
- 13 core screenshots from listed slots
- 2-3 short screen recordings (6-20 sec each)
- Color palette and typography tokens
- One-page product loop diagram
- Roadmap snapshot image

Optional but recommended:
- Founder quote or short origin story
- User quotes from private testing

## 17) AI Handoff Pack (Copy/Paste)

Use the block below directly with any AI model to generate landing page design/copy.

---

You are designing and writing a conversion-focused landing page for FlexAI, an AI-powered fitness platform.

Product facts:
- Mobile app with full-stack backend
- Core pillars: workout execution, AI guidance, analytics, social accountability
- Audience: beginner-to-advanced fitness users who want measurable progress and less friction
- Positioning: all-in-one system, not single-feature app

Must reflect current reality:
- Major modules are implemented
- Some features are in progress (do not claim 100 percent completion)

Landing page objectives:
1) Maximize early access signups
2) Explain differentiation clearly
3) Build trust through transparent product status

Required sections:
1. Hero with primary and secondary CTA
2. Problem framing
3. Product loop visual narrative
4. Four feature blocks: Workout OS, AI Layer, Analytics Engine, Community Engine
5. Screenshot gallery with 13 slots
6. Comparison table
7. FAQ
8. Final CTA

Screenshot slots to design around:
- Home dashboard
- Routine detail
- Active workout
- Workout summary
- AI generator
- Coach chat
- Stats hub
- Strength progression
- Muscle heatmap
- Body tracking
- Social home
- Leaderboard/challenges
- Settings/privacy

Messaging style:
- Specific, practical, no hype claims
- Outcome-oriented
- Honest about live vs upcoming items

Differentiation angles:
- Integrated workflow (plan -> execute -> analyze -> improve -> share)
- AI inside the workout lifecycle, not just chat
- Multi-dimensional progression tracking
- Social accountability built in

Do not do:
- Medical claims
- Unrealistic transformation claims
- False social proof
- Claiming all roadmap features are complete

Output needed:
- Full landing page copy
- Section by section design direction
- CTA variants
- Microcopy for screenshot captions
- FAQ answers
- Alternate hero versions for A/B test

---

## 18) SEO And Discoverability Inputs

Primary SEO themes:
- AI fitness app
- workout tracker app
- strength progression app
- fitness analytics app
- workout routine planner
- social fitness app

Intent clusters to target:
- Compare alternatives
- Track progression better
- Build consistency habits
- Find smart workout planning

## 19) Analytics Plan For Landing Page

Track these events:
- Hero CTA click
- Product tour click
- Screenshot carousel interaction
- Comparison section dwell depth
- FAQ expand events
- Final CTA click
- Waitlist submission

Core funnel:
- Visit -> section engagement -> CTA click -> signup complete

## 20) Risks To Manage In Messaging

Risk 1: Over-positioning as fully complete product
- Mitigation: clear live vs upcoming block

Risk 2: AI skepticism
- Mitigation: practical use-case language and transparent boundaries

Risk 3: Too many features causing confusion
- Mitigation: feature grouping by outcome, not by technical module

Risk 4: Generic fitness copy
- Mitigation: concrete UI-driven storytelling with screenshots

## 21) Final Creative Direction Summary

The best FlexAI landing page should feel:
- Ambitious but credible
- Technical but human
- Performance-focused but welcoming
- Bold and modern, not template-generic

Narrative line:
From scattered fitness effort to a single intelligent progress system.

If every section reinforces that narrative, the page will convert better and set correct expectations for early adopters.
