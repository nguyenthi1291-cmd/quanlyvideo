# VIBE_CODING_WORKFLOW.md

## Workflow for learning Vibe Coding

### 1. Read specifications

Start with:

```text
00_README.md
01_PRD.md
02_DESIGN.md
```

Then read technical files.

### 2. Ask the coding agent to build one module at a time

Recommended sequence:

```text
Module 01 — Layout
Module 02 — Auth
Module 03 — Dashboard
Module 04 — Video List
Module 05 — Video Form
Module 06 — Storage
Module 07 — Categories
Module 08 — Users
Module 09 — Account
Module 10 — Security
```

### 3. After every module

Ask the agent to:
- inspect existing code
- test current functionality
- avoid breaking previous modules
- update only relevant files

### 4. Useful prompts

#### Continue development

```text
Read all MD specifications first.
Inspect the existing implementation.
Continue only with the requested module.
Do not rewrite unrelated working modules.
After implementation, test the module and fix errors.
```

#### Debug

```text
Inspect the current code and browser console errors.
Identify the root cause.
Fix the smallest necessary set of files.
Do not replace working architecture with a different framework.
```

#### Refactor

```text
Refactor only the requested area.
Preserve behavior.
Remove duplicate code.
Keep HTML/CSS/JS architecture.
Do not change database schema unless explicitly requested.
```

#### Security review

```text
Audit Supabase Auth, RLS, Storage policies and frontend configuration.
Look specifically for exposed secrets, privilege escalation, insecure CRUD and client-controlled roles.
Return findings and fixes.
```
