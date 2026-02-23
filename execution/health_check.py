import requests
import sys
import os
from typing import List

def check_endpoints(base_url: str, endpoints: List[str]):
    print(f"Starting health check for: {base_url}")
    success_count = 0
    fail_count = 0

    for ep in endpoints:
        url = f"{base_url.rstrip('/')}/{ep.lstrip('/')}"
        try:
            response = requests.get(url, timeout=10)
            status = response.status_code
            if 200 <= status < 400:
                print(f"[PASS] {url} - Status: {status}")
                success_count += 1
            else:
                print(f"[FAIL] {url} - Status: {status}")
                fail_count += 1
        except Exception as e:
            print(f"[ERROR] {url} - {str(e)}")
            fail_count += 1

    print(f"\nSummary: {success_count} Passed, {fail_count} Failed.")
    if fail_count > 0:
        sys.exit(1)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"
    # Basic core endpoints
    test_endpoints = [
        "/",
        "/api/health", # Assuming health endpoint exists
        "/api/courses",
    ]
    check_endpoints(target, test_endpoints)
