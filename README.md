# Aegis-Ghost: Adversarial Red-Teaming Toolkit

Aegis-Ghost is a black-box HTTP red-teaming harness that proves AI endpoints can be crashed and silently fooled without ever alerting monitoring — then turns the evidence into a UAE-compliance-mapped report with ready-to-deploy fixes.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173` to view the workspace.

## Scope & Capabilities
- **Black-box HTTP Testing:** Tests deployed REST endpoints over HTTP, not in-memory models.
- **Statistical Rigor:** Computes Jensen-Shannon Divergence (JSD) for confidence drift analysis.
- **4 Attack Categories:** Malformed payloads, Boundary values, Prompt injection (including Ghost Payload Unicode tags), and Encoding tricks.
- **UAE Compliance Mapping:** Designed for pre-audit testing against DESC/CBUAE technical standards.

*(Note: The current MVP focuses on text classification endpoints and uses an N=30 statistical baseline for demonstration speed.)*
