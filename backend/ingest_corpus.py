"""
Ingest Indian case law into the FAISS vector store.
Usage: python ingest_corpus.py

Place case law data in rag_data/cases.json — structure:
[
  {
    "case_name": "State of Maharashtra v. Ramesh Kumar",
    "citation": "AIR 2019 SC 872",
    "court": "Supreme Court of India",
    "year": 2019,
    "domain": "criminal",
    "bench_type": "division",
    "outcome": "bail_granted",
    "ipc_sections": "302,307",
    "summary": "Held that bail may be granted where the accused has been in custody
                for a prolonged period and trial is unlikely to conclude soon...",
    "source_url": "https://indiankanoon.org/doc/XXXXXXX/"
  }
]
"""
import json, sys
sys.path.insert(0, ".")
from app.services.rag import ingest_cases

def main():
    with open("rag_data/cases.json", "r") as f:
        cases = json.load(f)
    print(f"Ingesting {len(cases)} Indian cases...")
    batch_size = 100
    for i in range(0, len(cases), batch_size):
        ingest_cases(cases[i:i+batch_size])
        print(f"  Processed {min(i+batch_size, len(cases))}/{len(cases)}")
    print("Done.")

if __name__ == "__main__":
    main()
