# COMPLETE USAGE GUIDE: Rules, Skills, MCPs, Workflows in Sync
## Master Framework for Production-Ready Development with AI Agents

---

## PART 0: THE ECOSYSTEM OVERVIEW

You now have a complete AI-powered development system with 4 interconnected layers:

```
┌─────────────────────────────────────────────────────────┐
│ LAYER 4: WORKFLOWS (How to do X)                        │
│ ────────────────────────────────────────────────────────│
│ ✅ Feature Implementation                               │
│ ✅ Bug Fixing & Debug                                   │
│ ✅ Testing Strategy                                     │
│ ✅ Code Review                                          │
│ ✅ Refactoring & Tech Debt                             │
│ ✅ Performance Optimization                             │
│ ✅ API Design & Implementation                          │
│ ✅ Database Schema Design                               │
│ (Load with: @workflow/[name])                           │
└─────────────────────────────────────────────────────────┘
                           ↑
┌─────────────────────────────────────────────────────────┐
│ LAYER 3: SKILLS (What to know about X)                  │
│ ────────────────────────────────────────────────────────│
│ ✅ Code-smell-detection                                 │
│ ✅ Test-coverage-analysis                               │
│ ✅ Database-query-optimization                          │
│ ✅ API-requirement-analysis                             │
│ ✅ Component-development                                │
│ ✅ Performance-profiling                                │
│ ✅ UI-UX-planning                                       │
│ ✅ Security-best-practices                              │
│ (Load with: @skill/[name])                              │
└─────────────────────────────────────────────────────────┘
                           ↑
┌─────────────────────────────────────────────────────────┐
│ LAYER 2: MCPs (External tools & data)                   │
│ ────────────────────────────────────────────────────────│
│ ✅ Web Search (current data, trends, best practices)    │
│ ✅ Code Execution (Python for calculations, data prep)  │
│ ✅ Image Generation (mockups, diagrams, designs)        │
│ ✅ File Creation (documentation, guides, configs)       │
│ (Invoke with: @tool/[name])                             │
└─────────────────────────────────────────────────────────┘
                           ↑
┌─────────────────────────────────────────────────────────┐
│ LAYER 1: RULES (Principles & constraints)               │
│ ────────────────────────────────────────────────────────│
│ ✅ Decision-Making Framework (3-tier for options)       │
│ ✅ Information Gathering (search by default)            │
│ ✅ Quality Standards (what "production-ready" means)    │
│ ✅ Planning Principles (avoid common mistakes)          │
│ ✅ Execution Patterns (how to build step-by-step)       │
│ (Follow always)                                         │
└─────────────────────────────────────────────────────────┘
```

---

## PART 1: UNDERSTANDING EACH LAYER

### LAYER 1: RULES (Foundation - Always Active)

**What are Rules?**
- Principles that guide decision-making
- Constraints on how to approach problems
- Quality standards for "production-ready"
- Anti-patterns to avoid

**Key Rules You Need to Know:**

**Rule #1: Information Gathering (Search by Default)**
```
Decision Test:
  "Would searching improve answer quality?"
  
  YES (most cases)        → Search (1-3 tool calls)
  NO (ultra-narrow cases) → Skip search
                              
Default: Always search first unless:
- Modifying existing artifact (you have context)
- Trivial style change (100% clear)
- Well-defined technical question (not current data)

Action: Before answering ANYTHING about current trends,
        tools, best practices, or data → SEARCH FIRST
```

**Rule #2: Decision Framework (3-Tier System)**
```
Step 1: Is this a pure information request?
        (Code snippet, tutorial, comparison, explanation)
        → YES → Tier 1 (text_response, NO offer)
        
Step 2: Is this asking me to BUILD something?
        (App, spreadsheet, presentation, document)
        → YES → Tier 2 (artifact as PRIMARY)
        
Step 3: Is this ambiguous?
        (Single noun, unclear intent)
        → YES → Tier 3 (search + text + offer)

Key: Check Tier 1 FIRST (avoid over-building)
     Then Tier 2 (avoid text substitutes for artifacts)
     Default to Tier 3 (when uncertain)
```

**Rule #3: Quality Standards**
```
PRODUCTION-READY MEANS:
✅ All tests passing (>80% coverage)
✅ No TODOs or placeholders
✅ Error handling for all paths
✅ Performance validated (metrics)
✅ Security reviewed (OWASP)
✅ Monitoring/alerts configured
✅ Documentation complete
✅ Scales to 10x users
✅ Team confidence to deploy
✅ User trust in reliability

ANTI-PATTERNS TO AVOID:
❌ Building everything at once
❌ Skipping planning phase
❌ No error handling
❌ Performance = afterthought
❌ Security = too late
❌ No tests
❌ No monitoring
❌ Manual deployments
❌ Launching unprepared
```

**Rule #4: Execution Pattern (Progressive Disclosure)**
```
DON'T: Build everything, then launch
DO: Build → Test → Deploy → Monitor → Iterate

STAGES:
1. Plan (design before building)
2. Build (MVP only, 3-5 features)
3. Test (unit, integration, >80% coverage)
4. Deploy (CI/CD, staging first)
5. Monitor (alerts, dashboards, 24/7 watch)
6. Iterate (v1.1, v2, etc.)

TIMING:
Week 1: Plan
Week 2-4: Build
Week 5: Test
Week 6: Deploy + Monitor
Week 7+: Scale

This avoids the "building forever" trap.
```

---

### LAYER 2: MCPs (External Tools & Data Integration)

**What are MCPs?**
- Tools that fetch external data or run operations
- Integrations with real services
- Capabilities beyond my training data
- Always available when needed

**The 4 MCPs You Have:**

**MCP #1: Web Search** (Most Used!)
```
WHEN TO USE:
- Current information (news, trends, tools, prices)
- Best practices (check what's current)
- Data validation (verify facts)
- Solution research (find existing options)
- API/Library documentation
- Implementation patterns

EXAMPLE WORKFLOW:
User: "Create a mortgage calculator"
Step 1: Search for "best mortgage calculators 2025"
Step 2: Search for "mortgage calculator APIs"
Step 3: Search for "mortgage calculation formulas"
Result: Build informed tool with real data

SYNTAX:
@search("query1", "query2", "query3")  → Returns top results

KEY HABIT:
If you're uncertain about anything current → SEARCH
```

**MCP #2: Python Code Execution**
```
WHEN TO USE:
- Data transformation (prepare for artifacts)
- Complex calculations (math, statistics)
- Algorithm testing (verify logic)
- Performance analysis (profiling)
- File processing (read, convert, analyze)

DON'T USE FOR:
- Creating artifacts (use artifact types instead)
- Simple lookups (just answer directly)
- Building apps (use html_app artifact)

EXAMPLE:
User: "Create budget spreadsheet with 100 transactions"
Step 1: Execute Python to generate realistic data
Step 2: Transform into proper JSON format
Step 3: Populate sheets artifact with that data

RESULT: Artifact populated with real data, not fakes
```

**MCP #3: Image Generation**
```
WHEN TO USE:
- Mockups (show UI before building)
- Architecture diagrams (visualize system design)
- ER diagrams (database relationships)
- UI designs (before coding)
- Infographics (explain concepts visually)

EXAMPLE:
User: "Plan database for ecommerce app"
Step 1: Design schema (use database-schema workflow)
Step 2: Generate ER diagram (image generation)
Step 3: Show in documentation

RESULT: Clear visual of data structure
```

**MCP #4: File Creation**
```
WHEN TO USE:
- Documentation (README, guides, specs)
- Configuration files (deployment, CI/CD)
- Auxiliary files alongside artifacts (not substitutes!)

DON'T USE FOR:
- Documents (use doc artifact instead)
- Spreadsheets (use sheets artifact instead)
- Code/apps (use html_app artifact instead)

EXAMPLE:
Step 1: Create doc artifact (main document)
Step 2: Create .env.example file (configuration)
Step 3: Create deployment-guide.md (auxiliary)

RESULT: Complete documentation package
```

**The Key Principle:**
```
Tools support artifacts, not replace them.

CORRECT:
- Generate chart → Embed in presentation artifact
- Search for best practices → Use in design
- Execute code → Prepare data for spreadsheet
- Generate image → Include in document

WRONG:
- Use code_interpreter instead of spreadsheet artifact
- Use create_text_file instead of doc artifact
- Use create_chart instead of embedded visualizations
```

---

### LAYER 3: SKILLS (Deep Knowledge Base)

**What are Skills?**
- Specialized knowledge about specific topics
- Best practices for technical decisions
- Patterns and anti-patterns
- Implementation guides

**How to Load Skills:**

```
Syntax: @skill/[name] (in workflow execution)

EXAMPLE - When Planning API:
Load: @skill/api-requirement-analysis
      @skill/rest-api-design
      @skill/openapi-spec-generation

These skills tell me:
- What questions to ask
- What to validate
- What formats to use
- Common pitfalls to avoid
```

**Available Skills (Examples):**

```
PLANNING SKILLS:
- @skill/product-requirements-analysis
- @skill/feature-prioritization
- @skill/user-flow-design
- @skill/integration-planning

DATABASE SKILLS:
- @skill/database-normalization
- @skill/index-selection-strategy
- @skill/query-optimization-analysis
- @skill/multi-tenant-schema-design

API SKILLS:
- @skill/api-requirement-analysis
- @skill/rest-api-design
- @skill/graphql-schema-design
- @skill/api-error-handling

BACKEND SKILLS:
- @skill/authentication-patterns
- @skill/authorization-patterns
- @skill/rate-limiting-strategies
- @skill/caching-strategies

FRONTEND SKILLS:
- @skill/component-development
- @skill/state-management-patterns
- @skill/api-integration-patterns
- @skill/form-validation-patterns

TESTING SKILLS:
- @skill/test-coverage-analysis
- @skill/edge-case-enumeration
- @skill/mock-strategies
- @skill/load-testing-strategy

PERFORMANCE SKILLS:
- @skill/database-query-optimization
- @skill/n-plus-one-detection
- @skill/algorithm-complexity-analysis
- @skill/performance-profiling

SECURITY SKILLS:
- @skill/owasp-top-10-review
- @skill/input-validation-patterns
- @skill/jwt-implementation
- @skill/secure-password-hashing

OPERATIONS SKILLS:
- @skill/deployment-setup
- @skill/ci-cd-pipeline-setup
- @skill/monitoring-alert-setup
- @skill/incident-response-planning
```

**How Skills Work in Practice:**

```
SCENARIO: Building user authentication

Step 1: Load skills
  @skill/jwt-implementation
  @skill/secure-password-hashing
  @skill/oauth2-patterns
  @skill/permission-based-access-control

Step 2: Ask questions informed by skills
  - Should we use JWT or sessions?
  - What's secure password hashing?
  - How to handle token refresh?
  - How to implement permissions?

Step 3: Get answers with best practices
  - JWT for stateless (scalable)
  - bcrypt for password hashing
  - Refresh token rotation
  - Role-based access control

Step 4: Implement with confidence
  - Code follows best practices
  - Common pitfalls avoided
  - Security validated
```

---

### LAYER 4: WORKFLOWS (Complete How-To Guides)

**What are Workflows?**
- Complete step-by-step guides for specific tasks
- Break complex work into manageable phases
- Each phase has clear inputs, steps, outputs
- 7-8 phases per workflow (deep, not surface-level)

**Your 8 Workflows:**

```
TIER 1 (Daily Use):
1. @workflow/feature-implementation
   ├─ When: Building a new feature
   ├─ Phases: 7 (requirements → implementation → testing)
   └─ Output: Feature branch ready to merge

2. @workflow/bug-fixing-debug
   ├─ When: Fixing a reported bug
   ├─ Phases: 6 (reproduction → root cause → fix)
   └─ Output: Bug fixed, tested, documented

3. @workflow/testing-strategy
   ├─ When: Creating test suite
   ├─ Phases: 8 (analysis → happy path → edge cases → E2E)
   └─ Output: >80% test coverage

4. @workflow/code-review
   ├─ When: Reviewing PR
   ├─ Phases: 5 (functionality → style → performance → security)
   └─ Output: Approval or detailed feedback

TIER 2 (Professional):
5. @workflow/refactoring-tech-debt
   ├─ When: Improving code quality
   ├─ Phases: 7 (analysis → strategy → implementation → metrics)
   └─ Output: Cleaner code, same behavior

6. @workflow/performance-optimization
   ├─ When: App is slow
   ├─ Phases: 7 (profiling → analysis → optimization → monitoring)
   └─ Output: <500ms response time

7. @workflow/api-design-implementation
   ├─ When: Building API
   ├─ Phases: 8 (requirements → spec → implementation → versioning)
   └─ Output: Production API with docs

8. @workflow/database-schema-design
   ├─ When: Designing database
   ├─ Phases: 7 (modeling → normalization → indexing → monitoring)
   └─ Output: Normalized, optimized schema
```

**How to Use Workflows:**

```
PATTERN:
1. Load workflow with: @workflow/[name]
2. Each workflow has 7-8 phases
3. Each phase has:
   - Time estimate (how long it takes)
   - Skills to load (background knowledge)
   - Execution steps (what to do)
   - Output (what you get)
4. Work through phases sequentially
5. Verify each phase complete before next

EXAMPLE: Using feature-implementation workflow

Week 1:
✅ Phase 1: Requirements (2 hours)
   - User stories written
   - Acceptance criteria clear
   - Design approved
   
✅ Phase 2: Planning (2 hours)
   - Tasks broken down
   - Estimates provided
   - Dependencies identified
   
✅ Phase 3: Implementation (3 days)
   - Feature code written
   - Tests written
   - Error handling added

✅ Phase 4: Testing (1 day)
   - All tests passing
   - Manual testing done
   - Edge cases verified

✅ Phase 5: Code Review (1 day)
   - Peer review complete
   - Issues resolved
   - Ready to merge

RESULT: Feature shipped with confidence
```

---

## PART 2: SYNCING ALL LAYERS FOR PRODUCTION SYSTEMS

### The Sync Pattern: Rules → Skills → Workflows → MCPs

**This is how they work together:**

```
SCENARIO: Building a production-ready payment system

STEP 1: APPLY RULES (Decision Making)
─────────────────────────────────────
Rule: "Information Gathering"
→ Should I search for payment best practices?
→ YES (current security standards matter)
→ ACTION: Search for "payment processing best practices 2025"

Rule: "Decision Framework" (Tier)
→ User asked "build payment system"
→ This is Tier 2 (artifact - API implementation)
→ ACTION: Will use api-design workflow + feature workflow

Rule: "Quality Standards"
→ Payment system requires:
  ✅ PCI compliance
  ✅ >95% uptime
  ✅ No data breaches
  ✅ Comprehensive testing
  ✅ Detailed monitoring
→ ACTION: Plan accordingly, no shortcuts

─────────────────────────────────────

STEP 2: LOAD SKILLS (Background Knowledge)
─────────────────────────────────────────
Load skills based on what we need to know:

@skill/api-requirement-analysis
→ What questions to ask about payment API

@skill/pci-compliance-requirements
→ What payment systems must include

@skill/payment-processing-patterns
→ Industry best practices for payments

@skill/webhook-handling-patterns
→ How to handle Stripe/PayPal webhooks

@skill/error-handling-patterns
→ What errors payments can have

@skill/security-best-practices
→ How to secure payment data

@skill/test-coverage-analysis
→ How thoroughly to test payments

─────────────────────────────────────

STEP 3: EXECUTE WORKFLOWS (Step-by-Step)
──────────────────────────────────────────
Phase 1: Use @workflow/api-design-implementation
  Phase 1.1: Requirements → Ask: "What's payment API?"
  Phase 1.2: Design spec → Map: signup, pay, refund, webhook
  Phase 1.3: Error handling → Plan: payment failures, timeouts
  Phase 1.4: Validation → Define: what makes valid payment?
  Output: Complete OpenAPI spec for payment API

Phase 2: Use @workflow/database-schema-design
  Phase 2.1: Model → Identify: User, Payment, Transaction
  Phase 2.2: Schema → Design: payment tables (PCI-safe!)
  Phase 2.3: Indexes → Plan: fast payment lookup
  Phase 2.4: Migrations → Write: payment schema migration
  Output: Normalized, PCI-compliant schema

Phase 3: Use @workflow/feature-implementation
  Phase 3.1: Requirements → "Integrate Stripe"
  Phase 3.2: Implementation → Code Stripe SDK calls
  Phase 3.3: Testing → Test payment flows
  Phase 3.4: Error handling → Handle Stripe errors
  Output: Working payment integration

Phase 4: Use @workflow/testing-strategy
  Phase 4.1: Analysis → What payment scenarios?
  Phase 4.2: Happy path → Successful payment
  Phase 4.3: Edge cases → Declined cards, timeouts, refunds
  Phase 4.4: Error cases → Invalid cards, rate limits
  Output: >90% test coverage for payments

Phase 5: Use @workflow/performance-optimization
  Phase 5.1: Profiling → Measure payment response time
  Phase 5.2: Analysis → Identify bottlenecks
  Phase 5.3: Optimization → Cache, optimize queries
  Phase 5.4: Validation → <200ms payment response
  Output: Fast, responsive payment processing

Phase 6: Use @workflow/code-review
  Phase 6.1: Review → Payment code quality
  Phase 6.2: Security → No card data in logs
  Phase 6.3: Testing → All payment tests pass
  Phase 6.4: Approval → Ready for production
  Output: Approved for deployment

─────────────────────────────────────

STEP 4: USE MCPs (External Tools)
──────────────────────────────────
Search: "Stripe API best practices 2025"
  → Learn current patterns
  → Find security guidelines
  → Check rate limits

Execute Python: Generate test payment data
  → 100 test transactions
  → Various payment types
  → Edge case scenarios

Generate Image: Payment flow diagram
  → User → App → Stripe → Bank
  → Visual understanding

Create File: deployment checklist
  → Pre-launch verification
  → Monitoring setup
  → Incident response

─────────────────────────────────────

RESULT: Production-Ready Payment System
✅ Planned thoroughly (workflow phases)
✅ Follows best practices (skills)
✅ Meets quality standards (rules)
✅ Data-informed (MCPs)
✅ Tested comprehensively (testing workflow)
✅ Secure & compliant (security skills)
✅ Fast & monitored (perf workflow)
✅ Confidence to launch (all checks passed)
```

---

## PART 3: COMPLETE WORKFLOW FOR IDEA → PRODUCTION

### The Master Workflow: Using All Layers in Sync

**Follow this pattern for ANY project:**

---

## PHASE 0: IDEA EXPLORATION (Day 1)

**RULES Applied:**
- Information Gathering Rule: Search for context
- Decision Framework: Is this Tier 2 (build)? or Tier 3 (explore)?

**SKILLS Loaded:**
- @skill/product-requirements-analysis
- @skill/feature-prioritization
- @skill/market-analysis (if uncertain about idea)

**MCPs Used:**
- Search: "Similar products 2025"
- Search: "Market trends for [idea type]"

**WORKFLOWS Used:**
- Phase 1 of @workflow/feature-implementation (requirements)

**Output:**
```
IDEA VALIDATION DOCUMENT:
✅ Problem statement (what's the problem?)
✅ Target users (who benefits?)
✅ MVP features (3-5 only!)
✅ Success metrics (how do we measure success?)
✅ Timeline estimate (6-8 weeks?)
✅ Resource requirements (frontend dev, backend dev, designer?)
✅ Go/No-go decision (build or not?)

DECISION: GO! → Proceed to Phase 1
```

---

## PHASE 1: PLANNING & DESIGN (Week 1)

**RULES Applied:**
- Information Gathering: Search for best practices in your domain
- Quality Standards: Design must be thorough before coding

**SKILLS Loaded:**
- @skill/api-requirement-analysis
- @skill/database-normalization
- @skill/ui-ux-planning
- @skill/integration-planning
- @skill/feature-prioritization

**MCPs Used:**
- Search: "Best practices for [feature type]"
- Search: "Design patterns for [your domain]"
- Image Generation: Architecture diagram
- Python: Calculate schema complexity

**WORKFLOWS Used:**
- Phase 1.1-1.7 of @workflow/api-design-implementation
- Phase 1.1-1.7 of @workflow/database-schema-design

**Output:**
```
COMPLETE DESIGN PACKAGE:
✅ Feature roadmap (Tier 1, 2, 3 features)
✅ API specification (OpenAPI 3.0)
✅ Database schema (normalized, indexed)
✅ UI/UX wireframes (screens + user flows)
✅ Integration plan (third-party services)
✅ Development timeline (weeks + phases)
✅ Risk analysis (blockers, dependencies)

TRACKING:
- Phase 1.1: Idea Validation ✅
- Phase 1.2: Feature Breakdown ✅
- Phase 1.3: API Design ✅
- Phase 1.4: Database Schema ✅
- Phase 1.5: UI/UX Planning ✅
- Phase 1.6: Integration Plan ✅
- Phase 1.7: Development Plan ✅

DECISION: All approved → Proceed to Phase 2
```

---

## PHASE 2: BACKEND DEVELOPMENT (Weeks 2-3)

**RULES Applied:**
- Execution Pattern: Build MVP only, test as you go
- Quality Standards: >80% test coverage required

**SKILLS Loaded:**
- @skill/authentication-patterns
- @skill/database-query-optimization
- @skill/api-error-handling
- @skill/test-coverage-analysis

**MCPs Used:**
- Python: Generate test data
- Search: "FastAPI best practices"

**WORKFLOWS Used:**
- Phase 2.1-2.4 of @workflow/database-schema-design
- Phase 3-5 of @workflow/feature-implementation (auth + core features)
- @workflow/testing-strategy (backend tests)

**Output:**
```
BACKEND COMPLETE:
✅ Database created & indexed
✅ API endpoints implemented (auth, CRUD)
✅ Validation on all inputs
✅ Error handling consistent
✅ Unit tests >80% coverage
✅ Integration tests passing

DAILY TRACKING:
Week 2:
  Day 1: Database schema ✅
  Day 2: API skeleton + auth ✅
  Day 3-4: Core endpoints ✅
  Day 5: Unit tests ✅
  
Week 3:
  Day 1-2: Edge case handling ✅
  Day 3: Integration tests ✅
  Day 4: Performance baseline ✅
  Day 5: Code review + fixes ✅

QUALITY GATE:
✅ All tests passing
✅ Coverage >80%
✅ No TODOs in code
✅ Error cases handled
✅ Ready for frontend integration
```

---

## PHASE 3: FRONTEND DEVELOPMENT (Weeks 3-4)

**RULES Applied:**
- Progressive Disclosure: Build one page at a time
- Quality Standards: Responsive, accessible, tested

**SKILLS Loaded:**
- @skill/component-development
- @skill/state-management-patterns
- @skill/form-validation-patterns
- @skill/responsive-design-patterns

**MCPs Used:**
- Image Generation: UI mockups (before coding)
- Search: "React best practices 2025"

**WORKFLOWS Used:**
- Phase 3 of @workflow/feature-implementation (UI pages)
- @workflow/testing-strategy (frontend tests)

**Output:**
```
FRONTEND COMPLETE:
✅ All pages implemented
✅ Components reusable
✅ State management working
✅ API integration complete
✅ Error handling for all cases
✅ Loading states implemented
✅ Mobile responsive
✅ Tests >70% coverage

DAILY TRACKING:
Week 3:
  Day 1: Project setup ✅
  Day 2-3: Auth pages ✅
  Day 4-5: Feed/List page ✅
  
Week 4:
  Day 1-2: Detail + modal pages ✅
  Day 3: API integration ✅
  Day 4: Error handling ✅
  Day 5: Tests + responsive ✅

QUALITY GATE:
✅ All pages implemented
✅ Integration tests passing
✅ Mobile works
✅ No console errors
✅ Ready for integrations
```

---

## PHASE 4: INTEGRATIONS & POLISH (Week 4-5)

**RULES Applied:**
- Quality Standards: Third-party integrations must be robust
- Information Gathering: Search for latest integration patterns

**SKILLS Loaded:**
- @skill/third-party-api-integration
- @skill/webhook-handling-patterns
- @skill/error-recovery-patterns

**MCPs Used:**
- Search: "[Service name] API best practices"
- Python: Test integration error cases

**WORKFLOWS Used:**
- Phase 4.1 of @workflow/api-design-implementation (integrations)
- Phase 4.2 of @workflow/performance-optimization

**Output:**
```
INTEGRATIONS COMPLETE:
✅ Email service integrated
✅ File upload working
✅ Analytics tracking
✅ Third-party webhooks handling
✅ Error recovery implemented

POLISH COMPLETE:
✅ Performance optimized (<500ms)
✅ Security reviewed (OWASP)
✅ Error messages clear
✅ Loading states smooth
✅ Documentation complete

DAILY TRACKING:
Week 4-5:
  Day 1: Email service ✅
  Day 2: File uploads ✅
  Day 3: Analytics ✅
  Day 4: Performance optimization ✅
  Day 5: Security review ✅
  Day 6: Documentation ✅
  Day 7: Polish + refinements ✅

QUALITY GATE:
✅ All integrations tested
✅ No external API failures
✅ Performance meets targets
✅ Security checklist done
✅ Documentation complete
✅ Ready for QA
```

---

## PHASE 5: TESTING & QA (Week 5-6)

**RULES Applied:**
- Quality Standards: >80% overall coverage
- Execution Pattern: Test before deployment

**SKILLS Loaded:**
- @skill/test-coverage-analysis
- @skill/edge-case-enumeration
- @skill/load-testing-strategy

**MCPs Used:**
- Python: Generate load test scenarios
- Search: "Load testing tools 2025"

**WORKFLOWS Used:**
- @workflow/testing-strategy (comprehensive)
- @workflow/bug-fixing-debug (any found bugs)
- @workflow/code-review (final review)

**Output:**
```
TESTING COMPLETE:
✅ Unit tests >80% coverage
✅ Integration tests passing
✅ E2E tests for user flows
✅ Load testing done (<500ms @ 100 users)
✅ Mobile testing done
✅ Security testing done

BUG TRACKING:
Week 5:
  Critical bugs: 0 ✅
  High severity: 2 (fixed) ✅
  Medium: 5 (fixed) ✅
  Low: 8 (fixed or deferred) ✅

Week 6:
  Final QA: All pass ✅
  Performance: Meets targets ✅
  Security: No issues ✅
  Documentation: Complete ✅

QUALITY GATE:
✅ All tests passing
✅ Coverage >80%
✅ No critical bugs
✅ Performance validated
✅ Security passed
✅ Ready for deployment
```

---

## PHASE 6: DEPLOYMENT & MONITORING (Week 6-7)

**RULES Applied:**
- Quality Standards: Monitoring must be active before launch
- Execution Pattern: Staging first, then production

**SKILLS Loaded:**
- @skill/deployment-setup
- @skill/ci-cd-pipeline-setup
- @skill/monitoring-alert-setup
- @skill/incident-response-planning

**MCPs Used:**
- Search: "Deployment best practices 2025"
- File Creation: Deployment guide, runbooks

**WORKFLOWS Used:**
- Phase 6 of production-ready guide (all deployment steps)

**Output:**
```
INFRASTRUCTURE READY:
✅ Backend hosting selected (Railway/Heroku)
✅ Frontend hosting selected (Vercel/Netlify)
✅ Database configured (with backups)
✅ SSL/HTTPS enabled
✅ Environment variables secure

CI/CD PIPELINE:
✅ GitHub Actions configured
✅ Tests run on every commit
✅ Auto-deploy on main branch
✅ Staging environment ready
✅ Production ready

MONITORING & ALERTS:
✅ Response time tracking
✅ Error rate alerts
✅ Database health monitoring
✅ Uptime monitoring
✅ Dashboards created

LAUNCH CHECKLIST:
✅ All tests passing
✅ Performance validated
✅ Security review done
✅ Backups working
✅ Monitoring active
✅ Runbooks written
✅ Team trained
✅ Incident plan ready

DEPLOYMENT:
  Week 6:
    Day 1-2: Infrastructure setup ✅
    Day 3-4: CI/CD pipeline ✅
    Day 5: Staging deployment ✅
    Day 6-7: Production deployment ✅
    
  Week 7:
    Day 1-3: Monitoring (24/7) ✅
    Day 4-5: Fix production issues ✅
    Day 6-7: Public launch ✅

POST-LAUNCH:
✅ 24/7 monitoring
✅ Respond to issues immediately
✅ Collect user feedback
✅ Fix critical bugs same-day
✅ Optimize based on usage
```

---

## PART 4: TRACKING & ACCOUNTABILITY

### Weekly Status Template (Use Every Week)

```
════════════════════════════════════════════════════════════
WEEK [X] STATUS REPORT
════════════════════════════════════════════════════════════

PHASE: [Current Phase]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMPLETED TASKS:
[ ] Task 1: [Description]
    ├─ Subtask 1a: ✅
    ├─ Subtask 1b: ✅
    └─ Subtask 1c: ✅

[ ] Task 2: [Description]
    ├─ Subtask 2a: ✅
    ├─ Subtask 2b: ⏳ (In progress)
    └─ Subtask 2c: ⏸️ (Blocked)

BLOCKERS & RISKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚫 BLOCKER #1: [Issue]
    Impact: [High/Medium/Low]
    Status: [Investigating/Working on fix/Resolved]
    Resolution: [What are you doing?]
    ETA: [When will it be fixed?]

⚠️ RISK #1: [Potential issue]
    Likelihood: [High/Medium/Low]
    Impact: [High/Medium/Low]
    Mitigation: [How to prevent?]

METRICS & PROGRESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Development:
  ├─ Code written: [X lines]
  ├─ Files changed: [X files]
  ├─ Tests added: [X tests]
  └─ Code coverage: [X%]

Quality:
  ├─ Bugs found: [X]
  ├─ Bugs fixed: [X]
  ├─ Tests passing: [X/Y]
  └─ Code review: [In progress/Pending/Done]

Performance:
  ├─ Response time: [X ms]
  ├─ Database queries: [X ms]
  └─ Bundle size: [X KB]

NEXT WEEK GOALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority 1 (Must Do):
  [ ] Goal 1
  [ ] Goal 2
  [ ] Goal 3

Priority 2 (Should Do):
  [ ] Goal 4
  [ ] Goal 5

Priority 3 (Nice to Have):
  [ ] Goal 6

CONFIDENCE LEVEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall: [🟢 On track / 🟡 At risk / 🔴 Behind]
Reasoning: [Why this confidence level?]

LAUNCH READINESS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Timeline: Week [X] for launch (Confidence: XX%)
Risks to launch: [List risks that could delay launch]
Mitigation plan: [How to address risks]

════════════════════════════════════════════════════════════
```

---

## PART 5: DECISION TREES & QUICK REFERENCE

### When to Use Which Layer?

```
QUESTION: How should I approach this task?

├─ I need INFORMATION about something
│  ├─ Is it current/trending? → RULE #1 (Search)
│  ├─ Do I need best practices? → RULE #1 (Search)
│  ├─ Is this technical knowledge? → Load SKILLS
│  └─ Need step-by-step guide? → Use WORKFLOWS
│
├─ I need to BUILD something
│  ├─ Is it a document/report? → Use doc artifact
│  ├─ Is it a spreadsheet? → Use sheets artifact
│  ├─ Is it a presentation? → Use html_slides artifact
│  ├─ Is it an app/tool? → Use html_app artifact
│  └─ Need help planning? → Use WORKFLOWS
│
├─ I need to INTEGRATE something
│  ├─ Search for current patterns → MCP: Search
│  ├─ Load integration skills → Load SKILLS
│  ├─ Follow integration workflow → Use WORKFLOWS
│  └─ Generate test scenarios → MCP: Python
│
├─ I need DATA or ANALYSIS
│  ├─ Is it external data? → MCP: Search
│  ├─ Complex calculations? → MCP: Python
│  ├─ Visual explanation? → MCP: Image Generation
│  └─ Documentation? → MCP: File Creation
│
└─ I'm STUCK or UNSURE
   ├─ Review RULES (am I following them?)
   ├─ Load relevant SKILLS (need knowledge?)
   ├─ Follow WORKFLOW phase (what's next step?)
   └─ Use MCP to gather info (need data?)
```

---

### Common Scenarios & How to Handle Them

```
SCENARIO 1: "Build a todo app"
────────────────────────────────
Rules: Check Tier 2 (YES, artifact) + Info Gathering
Skills: Load component-development, state-management
Workflows: Feature-implementation, Testing-strategy
MCPs: Search for "todo app best practices"
Result: html_app artifact with complete todo app

SCENARIO 2: "My app is slow"
────────────────────────────
Rules: Apply quality standards (performance validated)
Skills: Load performance-profiling, query-optimization
Workflows: Use performance-optimization workflow
MCPs: Python for load testing, Search for benchmarks
Result: Optimized app with <500ms response

SCENARIO 3: "Design database for ecommerce"
────────────────────────────────────────────
Rules: Quality standards (normalized schema)
Skills: Load database-normalization, index-strategy
Workflows: Use database-schema-design workflow
MCPs: Image Generation for ER diagram
Result: Optimized schema with migrations

SCENARIO 4: "Write API for payment processing"
───────────────────────────────────────────────
Rules: Quality standards (security + compliance)
Skills: Load api-requirement-analysis, security
Workflows: API-design workflow, Feature-implementation
MCPs: Search "Stripe best practices", File creation for docs
Result: Secure, tested payment API

SCENARIO 5: "Fix authentication bug"
─────────────────────────────────────
Rules: Execution pattern (reproduce → fix → test)
Skills: Load authentication-patterns, error-handling
Workflows: Use bug-fixing-debug workflow
MCPs: Python for test scenario generation
Result: Fixed bug with regression tests

SCENARIO 6: "Improve code quality"
──────────────────────────────────
Rules: Quality standards (clean, maintainable)
Skills: Load code-smell-detection, refactoring-patterns
Workflows: Use refactoring workflow
MCPs: Python for complexity analysis
Result: Cleaner code, same behavior
```

---

## PART 6: MASTERY CHECKLIST

### Know When You've Mastered the System

```
LAYER 1: RULES ✅
────────────────
[ ] You default to searching for current info
[ ] You recognize Tier 1/2/3 patterns automatically
[ ] You know what "production-ready" means
[ ] You avoid the 10 common mistakes without thinking
[ ] You execute projects incrementally, not all-at-once

LAYER 2: MCPs ✅
───────────────
[ ] You use Search naturally to validate ideas
[ ] You know when to use Python vs artifacts
[ ] You generate images to clarify thinking
[ ] You create files for documentation
[ ] You never use tools as artifact substitutes

LAYER 3: SKILLS ✅
──────────────────
[ ] You load relevant skills for each task
[ ] You know which skill applies to which problem
[ ] You reference skills when making decisions
[ ] You understand best practices for your domain
[ ] You catch security/performance issues early

LAYER 4: WORKFLOWS ✅
─────────────────────
[ ] You know all 8 workflows by name
[ ] You know when to use which workflow
[ ] You work through phases sequentially
[ ] Each phase has clear outputs
[ ] You track progress weekly
[ ] You don't skip phases, even when tempted

INTEGRATION ✅
───────────────
[ ] You use all 4 layers together naturally
[ ] You don't rely too much on any one layer
[ ] You know the decision trees by heart
[ ] You handle ambiguity confidently
[ ] You deliver production-ready systems consistently
[ ] Your projects launch on time with high quality

ADVANCED ✅
────────────
[ ] You customize workflows for your needs
[ ] You predict where projects will have issues
[ ] You mentor others on the system
[ ] You contribute new skills/workflows
[ ] You measure success beyond just "shipped"
```

---

## PART 7: PUTTING IT ALL TOGETHER

### The Complete Mental Model

```
YOU HAVE A COMPLETE SYSTEM FOR BUILDING PRODUCTION APPS:

┌─────────────────────────────────────────────────────┐
│ RULES (Layer 1)                                      │
│ ├─ Information Gathering (search by default)        │
│ ├─ 3-Tier Decision Framework (plan before building) │
│ ├─ Quality Standards (what production-ready means)  │
│ ├─ Anti-patterns (what to avoid)                    │
│ └─ Execution Pattern (build incrementally)          │
└─────────────────────────────────────────────────────┘
         ↑
     PROVIDES
     FRAMEWORK
     FOR
         ↓
┌─────────────────────────────────────────────────────┐
│ SKILLS (Layer 3)                                     │
│ ├─ API design patterns                              │
│ ├─ Database optimization                            │
│ ├─ Frontend best practices                          │
│ ├─ Testing strategies                               │
│ ├─ Security principles                              │
│ ├─ Performance patterns                             │
│ ├─ Operations & deployment                          │
│ └─ ...40+ specialized skills                        │
└─────────────────────────────────────────────────────┘
         ↑
     INFORMS
     PHASES
     IN
         ↓
┌─────────────────────────────────────────────────────┐
│ WORKFLOWS (Layer 4)                                  │
│ ├─ Feature Implementation (8 phases)                │
│ ├─ Bug Fixing & Debug (6 phases)                    │
│ ├─ Testing Strategy (8 phases)                      │
│ ├─ Code Review (5 phases)                           │
│ ├─ Refactoring (7 phases)                           │
│ ├─ Performance (7 phases)                           │
│ ├─ API Design (8 phases)                            │
│ └─ Database Design (7 phases)                       │
└─────────────────────────────────────────────────────┘
         ↑
     POWERED BY
     EXTERNAL
     TOOLS
         ↓
┌─────────────────────────────────────────────────────┐
│ MCPs (Layer 2)                                       │
│ ├─ Web Search (current data, best practices)        │
│ ├─ Python Execution (calculations, data prep)       │
│ ├─ Image Generation (diagrams, mockups)             │
│ └─ File Creation (docs, configs, guides)            │
└─────────────────────────────────────────────────────┘

RESULT:
You can build production-ready systems from scratch
with confidence, in 6-7 weeks, with proper planning
and execution, knowing exactly what "done" looks like.
```

---

## FINAL ACTIONABLE CHECKLIST

### For Every Project, Follow This:

```
WEEK 1: PLANNING
├─ Day 1: Use Rules (idea validation)
├─ Day 2: Load Skills (planning skills)
├─ Day 3-5: Execute Workflows (design phases)
└─ Output: Complete design package

WEEK 2-3: BACKEND
├─ Daily: Execute Feature-Implementation workflow
├─ Daily: Execute Testing-Strategy workflow
├─ Weekly: Update progress tracking
├─ Output: Tested, documented backend

WEEK 3-4: FRONTEND
├─ Daily: Execute Feature-Implementation workflow
├─ Daily: Execute Testing-Strategy workflow
├─ Weekly: Update progress tracking
├─ Output: Tested, responsive frontend

WEEK 4-5: POLISH & INTEGRATIONS
├─ Daily: Execute Integration workflows
├─ Daily: Execute Performance workflow
├─ Daily: Execute Code-Review workflow
├─ Output: Optimized, integrated system

WEEK 5-6: TESTING & QA
├─ Daily: Execute Testing-Strategy workflow
├─ Daily: Execute Bug-Fixing workflow
├─ Weekly: Quality metrics report
├─ Output: 80%+ coverage, no critical bugs

WEEK 6-7: DEPLOYMENT
├─ Daily: Execute Deployment workflow
├─ Daily: Monitor (24/7)
├─ Daily: Fix production issues
├─ Output: Live, monitored system

SUCCESS METRICS (Week 7):
✅ All tests passing (>80% coverage)
✅ Response time <500ms
✅ Uptime >95%
✅ Zero critical bugs
✅ User feedback positive
✅ Team confidence high
✅ Ready to scale

IF ANY ISSUE ARISES:
1. Check Rules (are we violating a principle?)
2. Load Skills (do we need knowledge?)
3. Review Workflow (what's the next step?)
4. Use MCPs (do we need data?)
5. Adjust & Continue
```

---

## THE COMPLETE SYSTEM IN ONE PARAGRAPH

You have a complete AI-powered development system that combines four interconnected layers. **Rules** (Layer 1) provide decision-making frameworks—always search for current information, use the 3-tier system to choose output types, maintain quality standards, and execute projects incrementally. **Skills** (Layer 3) offer specialized knowledge about every aspect of development, from API design to security to operations. **Workflows** (Layer 4) are detailed 7-8 phase guides for each major task, with clear inputs, steps, and outputs that guide you from requirements to production. **MCPs** (Layer 2) are external tools—web search for current data, Python for calculations, image generation for visualizations, and file creation for documentation—that support and enhance all other layers. Together, these layers allow you to plan thoroughly in Week 1, execute incrementally over Weeks 2-5, test comprehensively in Week 5-6, deploy with confidence in Week 6, and launch a production-ready system by Week 7 that scales, performs, and handles errors gracefully. The key is using all four layers in sync: Rules guide decisions, Skills inform those decisions, Workflows structure execution, and MCPs provide data and external capabilities. Master this system, and you'll build professional applications with 100% confidence.

