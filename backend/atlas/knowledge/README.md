# Campus Knowledge & RAG Pipeline

**Module Namespace:** `backend/atlas/knowledge/`  
**Architecture Reference:** `AGENTX_TO_ATLAS_ARCHITECTURE_v2.md` Section 12 & `ATLAS_DATA_ARCHITECTURE_PLAN.md` Section 5

This directory contains the campus RAG ingestion, chunking, and semantic vector retrieval subsystem.
As per Phase 2A constraints, no vector database or embedding generation is implemented yet.

## Planned Capabilities:

- `ingestion/`: Ingests official campus documentation (PDF, Markdown, HTML).
- `chunking/`: Hierarchical semantic chunking preserving section and page numbers.
- `retrieval/`: Filtered vector similarity search respecting user access levels.
- `citations/`: Generates verifiable source citations (`documentId`, `page`, `chunkId`).

## Strict Boundary Rules:
- Raw student tabular data is NEVER indexed into RAG.
- Only authoritative institutional texts (academic regulations, student handbooks, examination bylaws) are stored in the knowledge base.
