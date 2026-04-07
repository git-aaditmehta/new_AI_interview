"""Phase 1 verification test — run from backend/ directory."""
import sys
print("=" * 50)
print("Phase 1 Import Verification Test")
print("=" * 50)

errors = []

def test_import(module_name, pkg_label=None):
    label = pkg_label or module_name
    try:
        __import__(module_name)
        print(f"  [OK] {label}")
    except ImportError as e:
        print(f"  [FAIL] {label}: {e}")
        errors.append(label)

test_import("fastapi", "fastapi")
test_import("uvicorn", "uvicorn")
test_import("sqlalchemy", "sqlalchemy")
test_import("pydantic_settings", "pydantic-settings")
test_import("aiosqlite", "aiosqlite")
test_import("litellm", "litellm")
test_import("edge_tts", "edge-tts")
test_import("pypdf", "pypdf")
test_import("speechmatics", "speechmatics-python")
test_import("httpx", "httpx")
test_import("aiofiles", "aiofiles")

print()
if errors:
    print(f"FAILED imports: {errors}")
    sys.exit(1)
else:
    print("ALL IMPORTS OK - Phase 1 dependencies verified ✅")
