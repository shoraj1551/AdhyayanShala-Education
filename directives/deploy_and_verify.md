# SOP: Multi-Layer Deployment Verification

## Purpose

Ensure that after any deployment (local or production), the system's core services are operational and responding correctly.

## Inputs

- `BASE_URL`: The URL to check (e.g., <http://localhost:3000> or <https://your-app.vercel.app>)
- `TOKEN`: (Optional) Auth token for protected endpoints

## Execution Tool

Use `execution/health_check.py` to perform the automated checks.

## Steps

1. Determine the target environment (Dev/Main).
2. Run the health check script with the appropriate URL.
3. If failures occur:
   - Check logs in the relevant branch/terminal.
   - Self-anneal by fixing any logic issues in the code or the script itself.
4. Update this directive if new critical endpoints are added.

## Expected Output

- A summary of reachable vs unreachable endpoints.
- Error codes for any failures.
