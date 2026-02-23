# Feature Development Workflow

This directive defines the mandatory process for adding new features to the AdhyayanShala platform to ensure stability and minimize regressions.

## Workflow Overview

1. **Branching**: Whenever a new feature is requested, create a dedicated feature branch from the `dev` branch.
    - Format: `feature/[short-description]`
2. **Impact Analysis**: Before/during development, maintain a list of **Impacted Files** and **Potential Regressions**.
    - Document which existing features or modules might be affected by these changes.
3. **Development**: Perform all development on the feature branch.
4. **Integration**: once the feature is developed and locally verified, merge it into the `dev` branch.
5. **Multi-Stage Testing**:
    - Conduct rigorous testing on the `dev` branch, specifically targeting the items listed in the **Impact Analysis**.
6. **Final Decision**:
    - **Pass**: If all tests pass, keep the changes in `dev` and **DELETE** the feature branch.
    - **Fail**: If bugs or regressions are found, **ROLLBACK** the merge on `dev` immediately and return to the feature branch for fixes.

7. **Branch Cleanup**: Once a feature is successfully integrated and verified in `dev`, the source feature branch must be deleted to keep the repository clean.

## Impact Analysis Template

When starting a feature, create/update an impact summary:

- **Modified Files**: List of all files added/changed.
- **Dependency Map**: Which other modules import these files?
- **Risk Areas**: "Feature X might break because I changed shared Utility Y."

## Tools to Use

- `git checkout -b feature/... dev`
- `git merge feature/...`
- `git reset --hard HEAD~1` (for rollbacks)
- `git branch -d feature/...` (for cleanup)
