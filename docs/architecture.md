# MediTrack architecture and implementation boundary

## Current application

MediTrack is the existing MERN application in this repository. The React/Vite client talks to the Express API under `/api`; the API uses JWT authentication, Mongoose/MongoDB, and Cloudinary for private report files. The report controller filters all report reads and writes by the authenticated owner. Cloudinary assets use authenticated delivery, and the API issues short-lived signed download URLs after an ownership check.

The current records workflow supports report metadata and files, with the existing categories `Lab` and `Prescription`. It does not extract text from uploaded files or create structured medical data. The public landing page's assistant example is fictional UI content and is not wired to the backend.

## Local setup

1. Install Node.js compatible with the package lockfiles.
2. In `backend`, run `npm ci`, copy `.env.example` to `.env`, and configure MongoDB, JWT, Cloudinary, and the frontend origin.
3. In `frontend`, run `npm ci` and copy `.env.example` to `.env`. Set `VITE_API_URL` to the backend API URL.
4. Start the backend with `npm run dev` in `backend`, then start Vite with `npm run dev` in `frontend`.

Never commit populated `.env` files or use real patient data for demos or tests. Current `.env.example` files document the existing backend and frontend settings.

## AI and OCR work required

The following pieces must be added before the product can claim AI-assisted document understanding:

- An authenticated document processing job model and durable worker.
- PDF text extraction and a configurable OCR/vision provider for scanned documents, with consent, provider retention review, timeouts, and failure states.
- Schema-validated extraction that preserves raw text, page references, uncertainty, and user corrections.
- Per-owner document chunks and embeddings with an indexed retrieval store, document filters, and deletion cleanup.
- A configurable LLM service that only receives authorized retrieved evidence, validates citations against source pages, rejects prompt instructions embedded in uploaded files, and declines unsupported claims.
- Conversation/message persistence and authenticated APIs for single-record and user-selected multi-record scopes.
- Rate limits, usage limits, safety checks, and isolation tests for every retrieval and mutation route.

No OCR, embedding, vector-index, RAG, conversation, or AI-provider credentials are configured in this repository today. Avoid sending patient information to an external provider until explicit in-product consent and provider retention terms have been addressed. No paid services are provisioned by this change.

## Deployment

The README records the existing Vercel frontend and Render backend arrangement. Before deployment, configure the Vercel build root as `frontend`, set its API URL, set the Render service root as `backend`, configure the backend environment variables from `backend/.env.example`, and restrict CORS to the real frontend origin. Confirm Cloudinary authenticated delivery and database access in the target environment. No production deployment was made as part of this work.
