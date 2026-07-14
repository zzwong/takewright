# Maintainer publishing guide

Use this checklist before making the repository public or cutting a release.

## Repository settings

1. Set the repository description and topics from `package.json`.
2. Keep `main` as the default branch and require the smoke workflow before merging.
3. Enable Dependabot alerts, secret scanning, push protection, and private vulnerability reporting.
4. Enable Discussions if maintainers want a channel for usage questions.
5. Confirm the repository owner profile has a private contact method for security and conduct reports.

## Content review

1. Review `git status --ignored` and confirm only the portable `example-demo` is included initially.
2. Search tracked candidates for credentials, private URLs, personal paths, proprietary assets, and confidential terminal output.
3. Confirm generated media and raw recordings are ignored.
4. Review the MIT copyright line and replace “Takewright contributors” with a legal owner if desired.
5. Read `NOTICE.md` and verify that the intended users comply with the current Remotion License.

Keep machine-specific or private demo paths in `.git/info/exclude`, not the shared `.gitignore`, so their names are not published with the repository.

## Verification

```bash
pnpm install --frozen-lockfile
pnpm demo:doctor
pnpm check
pnpm audit --prod --audit-level high
pnpm demo:render example-demo --format landscape
pnpm demo:render example-demo --format landscape --output gif --skip-recording
pnpm demo:inspect example-demo --format landscape
pnpm demo:inspect example-demo --format landscape --output gif
pnpm demo:validate example-demo --format landscape
pnpm demo:validate example-demo --format landscape --output gif
```

After creating the GitHub repository, confirm the smoke workflow passes from a clean Linux runner before announcing the project.
