#!/usr/bin/env python3
import os
import sys
import subprocess
import uvicorn

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(root_dir)

    print("=" * 60)
    print("  🏥 ClinicalTriModal AI — Clinical Diagnostic Platform")
    print("  Comparing: ML (Random Forest) vs DL (CNN) vs Simple Rules (J48)")
    print("=" * 60)

    dist_dir = os.path.join(root_dir, "frontend", "dist")
    if not os.path.exists(os.path.join(dist_dir, "index.html")):
        print("📦 Building React Frontend bundle...")
        subprocess.run(["npm", "run", "build"], cwd=os.path.join(root_dir, "frontend"), check=True)

    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting Unified FastAPI + React Dashboard at http://localhost:{port}")
    print(f"   - Web UI: http://localhost:{port}")
    print(f"   - Interactive API Docs: http://localhost:{port}/docs")
    print("=" * 60)

    uvicorn.run("backend.app:app", host="0.0.0.0", port=port, reload=False)

if __name__ == "__main__":
    main()
