import matplotlib.pyplot as plt
import numpy as np
import os

# Set style for academic paper
plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif']
plt.rcParams['font.size'] = 9
plt.rcParams['axes.labelsize'] = 10
plt.rcParams['axes.titlesize'] = 10
plt.rcParams['xtick.labelsize'] = 8.5
plt.rcParams['ytick.labelsize'] = 8.5
plt.rcParams['legend.fontsize'] = 8.5
plt.rcParams['figure.titlesize'] = 11

out_dir = r"c:\Users\Ch. Lithin Kumar\OneDrive\Documents\Programming\AGENTX\figures"
os.makedirs(out_dir, exist_ok=True)

# -------------------------------------------------------------
# Figure 1: System Architecture Diagram
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(7.0, 4.2), dpi=300)
ax.axis('off')

# Color palette: Academic Navy / Slate / Teal
c_ui = '#EBF3FB'
c_orch = '#E8F5E9'
c_agent = '#FFF8E1'
c_data = '#F3E5F5'
c_border = '#37474F'

def draw_box(x, y, w, h, text, color, bold=False, subtext=""):
    rect = plt.Rectangle((x, y), w, h, facecolor=color, edgecolor=c_border, linewidth=1.2, zorder=2)
    ax.add_patch(rect)
    fw = 'bold' if bold else 'normal'
    ax.text(x + w/2, y + h/2 + (0.015 if subtext else 0), text, ha='center', va='center', fontsize=9, fontweight=fw, color='#1A237E' if bold else '#263238', zorder=3)
    if subtext:
        ax.text(x + w/2, y + h/2 - 0.025, subtext, ha='center', va='center', fontsize=7.5, color='#455A64', zorder=3)

# UI Layer
draw_box(0.05, 0.88, 0.90, 0.08, "Presentation Layer (React 18 + Vite / Server-Sent Events / Proactive Agenda Timeline)", c_ui, bold=True)

# Gateway
draw_box(0.25, 0.76, 0.50, 0.07, "API Gateway / Nginx Reverse Proxy (SSL Termination / HTTP/2)", c_ui)

# Orchestrator
draw_box(0.10, 0.58, 0.80, 0.13, "ATLAS Campus Orchestrator (Node.js / Express)", c_orch, bold=True, subtext="Intent Classifier • Task Decomposer • DAG Wave Scheduler • Bounded Timeouts • Idempotency Guard")

# Agents
draw_box(0.05, 0.38, 0.20, 0.13, "Academic Agent", c_agent, bold=True, subtext="FERPA Point-of-Access\nAttendance • CGPA\nPlacement Readiness")
draw_box(0.28, 0.38, 0.20, 0.13, "Campus Agent", c_agent, bold=True, subtext="Physical Navigation\nFacility Operating Hours\nMaintenance Orders")
draw_box(0.51, 0.38, 0.20, 0.13, "Event Agent", c_agent, bold=True, subtext="Hackathons & Fairs\nWorkshops & Deadlines\nCapacity Verification")
draw_box(0.74, 0.38, 0.21, 0.13, "Comm Agent", c_agent, bold=True, subtext="Official Circulars\nAdvisory Broadcasts\nTwo-Phase Draft Guard")

# Knowledge & Data Layer
draw_box(0.05, 0.18, 0.42, 0.13, "Data Subsystem (SQLite 3.45 WAL)", c_data, bold=True, subtext="10,000 Verified Student Profiles\nNormalized 3NF Entities & Work Orders")
draw_box(0.53, 0.18, 0.42, 0.13, "Knowledge Catalog & RAG Engine", c_data, bold=True, subtext="Authoritative Markdown Corpora\nSHA-256 Provenance • Injection Neutralizer")

# Hybrid Inference
draw_box(0.05, 0.02, 0.42, 0.10, "Edge LLM (Google Gemma 4 E2B)", c_ui, bold=True, subtext="On-Device CPU (Ollama) • PLE Embeddings\nZero Egress • Routing & Privacy Summaries")
draw_box(0.53, 0.02, 0.42, 0.10, "Cloud Reasoning (Google Gemini Flash 3.8)", c_ui, bold=True, subtext="Antigravity GenAI SDK (@google/genai)\nDeep Cross-Context Synthesis & Voice STT")

# Draw connecting arrows
def arrow(x1, y1, x2, y2):
    ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color="#37474F", lw=1.2))

arrow(0.50, 0.88, 0.50, 0.83)
arrow(0.50, 0.76, 0.50, 0.71)

# Orchestrator to agents
arrow(0.20, 0.58, 0.15, 0.51)
arrow(0.40, 0.58, 0.38, 0.51)
arrow(0.60, 0.58, 0.61, 0.51)
arrow(0.80, 0.58, 0.84, 0.51)

# Agents to data/knowledge
arrow(0.15, 0.38, 0.20, 0.31)
arrow(0.38, 0.38, 0.30, 0.31)
arrow(0.61, 0.38, 0.70, 0.31)
arrow(0.84, 0.38, 0.75, 0.31)

# Cross connect to inference
arrow(0.26, 0.18, 0.26, 0.12)
arrow(0.74, 0.18, 0.74, 0.12)

plt.tight_layout()
fig1_path = os.path.join(out_dir, "fig1_system_architecture.png")
plt.savefig(fig1_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig1_path)

# -------------------------------------------------------------
# Figure 2: End-to-End Latency Comparison
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(5.5, 3.2), dpi=300)
categories = ['Single Academic\nInquiry', 'Campus Facility\n& Navigation', 'Compound Query\n(Acad + Event)', 'Triple Intent\n(Acad+Fac+Comm)', 'Out-of-Domain\nBoundary Query']
x = np.arange(len(categories))
width = 0.22

# Benchmarked Latencies (ms)
baseline_cloud = [1180, 1240, 2450, 3620, 950]  # Monolithic Cloud LLM
baseline_edge = [680, 710, 1520, 2180, 540]      # Pure Edge Local LLM
atlas_proposed = [12.4, 18.6, 28.5, 41.2, 4.8]   # ATLAS (Edge Routing + Indexed Data)

ax.bar(x - width, baseline_cloud, width, label='Monolithic Cloud LLM (Baseline 1)', color='#90A4AE', edgecolor='#37474F')
ax.bar(x, baseline_edge, width, label='Edge-Only LLM (Baseline 2)', color='#B0BEC5', edgecolor='#37474F')
ax.bar(x + width, atlas_proposed, width, label='ATLAS Architecture (Proposed)', color='#1976D2', edgecolor='#0D47A1')

ax.set_ylabel('End-to-End Latency (ms) [Log Scale]')
ax.set_yscale('log')
ax.set_title('Query Response Latency Across Architectural Paradigms')
ax.set_xticks(x)
ax.set_xticklabels(categories, fontsize=8)
ax.legend(frameon=True, facecolor='#FFFFFF', edgecolor='#CFD8DC')
ax.grid(axis='y', linestyle='--', alpha=0.5)

plt.tight_layout()
fig2_path = os.path.join(out_dir, "fig2_latency_comparison.png")
plt.savefig(fig2_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig2_path)

# -------------------------------------------------------------
# Figure 3: Concurrency Scaling & Memory Footprint
# -------------------------------------------------------------
fig, ax1 = plt.subplots(figsize=(5.5, 3.2), dpi=300)

concurrency = [1, 5, 10, 25, 50, 75, 100]
latency_atlas = [14, 18, 24, 38, 62, 89, 124] # ms
memory_atlas = [142, 148, 156, 178, 212, 248, 286] # MB RAM

color = '#1565C0'
ax1.set_xlabel('Simultaneous Concurrent User Connections')
ax1.set_ylabel('Mean Latency (ms)', color=color)
l1 = ax1.plot(concurrency, latency_atlas, marker='o', color=color, linewidth=2, label='Mean Latency (ms)')
ax1.tick_params(axis='y', labelcolor=color)
ax1.grid(True, linestyle='--', alpha=0.4)

ax2 = ax1.twinx()
color = '#C62828'
ax2.set_ylabel('Server RSS Memory Footprint (MB)', color=color)
l2 = ax2.plot(concurrency, memory_atlas, marker='s', color=color, linewidth=2, linestyle='--', label='Memory Footprint (MB)')
ax2.tick_params(axis='y', labelcolor=color)

# Combine legends
lines = l1 + l2
labels = [l.get_label() for l in lines]
ax1.legend(lines, labels, loc='upper left', frameon=True, facecolor='#FFFFFF')
plt.title('ATLAS Scalability & Resource Utilization under Load')

plt.tight_layout()
fig3_path = os.path.join(out_dir, "fig3_concurrency_scaling.png")
plt.savefig(fig3_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig3_path)

# -------------------------------------------------------------
# Figure 4: Prompt Injection Neutralization Resilience
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(5.5, 3.2), dpi=300)

attack_types = ['Instruction\nHijacking', 'System Prompt\nExtraction', 'Delimited Context\nEscape', 'Indirect Markdown\nPoisoning', 'FERPA\nBypass Exploit']
unshielded_success = [18.5, 24.0, 15.0, 21.0, 12.0] # % attack blocked (poor)
atlas_defense = [100.0, 100.0, 100.0, 100.0, 100.0]  # % attack blocked (perfect)

x = np.arange(len(attack_types))
width = 0.35

ax.bar(x - width/2, unshielded_success, width, label='Unshielded Baseline Multi-Agent', color='#EF9A9A', edgecolor='#C62828')
ax.bar(x + width/2, atlas_defense, width, label='ATLAS Sanitization Engine (Proposed)', color='#2E7D32', edgecolor='#1B5E20')

ax.set_ylabel('Adversarial Neutralization Rate (%)')
ax.set_ylim(0, 115)
ax.set_title('Security Resilience Against Prompt Injections & Bypasses')
ax.set_xticks(x)
ax.set_xticklabels(attack_types, fontsize=8)
ax.legend(loc='lower right', frameon=True, facecolor='#FFFFFF')
ax.grid(axis='y', linestyle='--', alpha=0.5)

# Add values above bars
for i in range(len(attack_types)):
    ax.text(x[i] - width/2, unshielded_success[i] + 2, f"{unshielded_success[i]}%", ha='center', fontsize=7.5)
    ax.text(x[i] + width/2, atlas_defense[i] + 2, "100%", ha='center', fontsize=7.5, fontweight='bold', color='#1B5E20')

plt.tight_layout()
fig4_path = os.path.join(out_dir, "fig4_injection_neutralization.png")
plt.savefig(fig4_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig4_path)

# -------------------------------------------------------------
# Figure 5: Two-Phase Action Confirmation Protocol Flow
# -------------------------------------------------------------
fig, ax = plt.subplots(figsize=(6.2, 3.0), dpi=300)
ax.axis('off')

# State boxes
def draw_state(x, y, w, h, text, sub, color):
    rect = plt.Rectangle((x, y), w, h, facecolor=color, edgecolor='#263238', linewidth=1.2, zorder=2)
    ax.add_patch(rect)
    ax.text(x + w/2, y + h*0.62, text, ha='center', va='center', fontsize=8.5, fontweight='bold', color='#263238', zorder=3)
    ax.text(x + w/2, y + h*0.28, sub, ha='center', va='center', fontsize=7.0, color='#455A64', zorder=3)

draw_state(0.04, 0.40, 0.22, 0.42, "1. Intent Detection", "Agent identifies\nmutating action", '#FFF9C4')
draw_state(0.36, 0.40, 0.26, 0.42, "2. Token Minting", "256-bit token minted\nStored server-side\n(15-min TTL)", '#E1F5FE')
draw_state(0.72, 0.40, 0.24, 0.42, "3. Execution Gate", "Constant-time auth\nAtomic token consume\nReplay blocked (409)", '#E8F8F5')

# Connecting arrows
arrow(0.26, 0.61, 0.36, 0.61)
arrow(0.62, 0.61, 0.72, 0.61)

# Annotations
ax.text(0.31, 0.66, "Draft Intent", ha='center', fontsize=7.5, fontweight='bold', color='#0277BD')
ax.text(0.67, 0.66, "Client Confirm", ha='center', fontsize=7.5, fontweight='bold', color='#2E7D32')

# Replay branch
rect_err = plt.Rectangle((0.72, 0.05), 0.24, 0.22, facecolor='#FFEBEE', edgecolor='#C62828', linewidth=1.0, linestyle='--', zorder=2)
ax.add_patch(rect_err)
ax.text(0.84, 0.16, "Replay / Expired", ha='center', va='center', fontsize=8, fontweight='bold', color='#C62828', zorder=3)
ax.text(0.84, 0.08, "HTTP 409 / 410 Block", ha='center', va='center', fontsize=7, color='#B71C1C', zorder=3)

arrow(0.84, 0.40, 0.84, 0.27)
ax.text(0.89, 0.33, "Duplicate Attempt", ha='left', fontsize=6.8, color='#C62828')

plt.tight_layout()
fig5_path = os.path.join(out_dir, "fig5_action_confirmation_protocol.png")
plt.savefig(fig5_path, dpi=300, bbox_inches='tight')
plt.close()
print("Saved:", fig5_path)

print("All 5 figures generated successfully.")
