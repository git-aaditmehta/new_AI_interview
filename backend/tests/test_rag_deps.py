"""Check if Phase 2 RAG dependencies are importable."""
import sys
errors = []

def check(name, mod):
    try:
        __import__(mod)
        print(f"  [OK]   {name}")
    except ImportError as e:
        print(f"  [FAIL] {name}: {e}")
        errors.append(name)

print("Phase 2 RAG dependency check")
print("-" * 40)
check("chromadb", "chromadb")
check("sentence-transformers", "sentence_transformers")
check("langchain-text-splitters", "langchain_text_splitters")

print()
if errors:
    print(f"Missing: {errors}")
    sys.exit(1)
else:
    print("All RAG deps available ✅")
