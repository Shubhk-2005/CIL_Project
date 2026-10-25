# 🏥 ClinicalTriModal AI — Clinical Diagnostic Platform

A full-stack medical prediction dashboard integrating **three fundamentally distinct predictive paradigms** for healthcare diagnostics:

1. **Machine Learning (ML)**: Random Forest Classifier (200 Trees, 59 clinical symptom features, 41 multi-class disease targets) — `disease_prediction_model.pkl`
2. **Deep Learning (DL)**: 31-Layer Deep Convolutional Neural Network (Conv2D + BatchNorm + SpatialDropout + GAP) with Grad-CAM Class Activation Heatmap overlays for Chest Radiographs (224×224×3) — `pneumonia_cnn_final.keras`
3. **Simple Rules Prediction**: J48 (C4.5) Clinical Decision Tree Rule Engine with animated interactive SVG decision traversal — `j48.png`

---

## ⚡ The Single Command to Run the Project

You can start the entire project (FastAPI backend + React frontend unified on port 8000) using **any** of the following single commands:

```bash
./run.sh
```

*Or via npm:*
```bash
npm start
```

*Or via python:*
```bash
python3 start.py
```

Once executed, open your browser at:
👉 **`http://localhost:8000`**

*(Interactive Swagger API docs are available at `http://localhost:8000/docs`)*

---

## 🏗️ Architecture Overview

- **Frontend**: React 18, Vite, Lucide Icons, Vanilla CSS medical design system with glassmorphism, responsive grid, dynamic SVG tree traversal, and Grad-CAM heatmap visualization.
- **Backend**: FastAPI, Uvicorn, Scikit-Learn, PyTorch, Keras 3, Matplotlib, Pillow, Pandas, NumPy.
- **Unified Single Server**: FastAPI serves both the REST API at `/api/*` and the compiled React production bundle at `/` on a single port (`8000`), eliminating CORS complexities and requiring only one terminal process.

---

## 🔍 The Three Predictive Paradigms

| Feature | 1) Machine Learning | 2) Deep Learning | 3) Simple Rules |
| :--- | :--- | :--- | :--- |
| **Model** | Random Forest (200 Trees) | 31-Layer CNN (Conv2D, GAP) | J48 Decision Tree (C4.5) |
| **Source File** | `disease_prediction_model.pkl` | `pneumonia_cnn_final.keras` | `j48.png` |
| **Input Modality** | 59 Clinical Symptoms (Tabular) | Chest Radiographs (224×224×3 RGB) | 4 Clinical Triage Questions |
| **Target Scope** | 41 Acute & Chronic Conditions | Pneumonia vs Normal Lungs | Respiratory / Metabolic Triage |
| **Explainability** | Calibrated Probabilities & Risk | Grad-CAM Spatial Activation Heatmap | 100% Deterministic Rule Trace |
| **Typical Latency**| ~2.4 ms | ~40.0 ms | **< 0.2 ms** |

---

## 🌟 Dashboard Features

1. **Tri-Modal Unified Comparator**:
   - Evaluate a single patient case across ML, DL, and Simple Rules simultaneously.
   - 4 pre-built patient case studies (Acute Pneumonia, Diabetic Diuresis, COVID-19 Screening, Hypertensive Baseline).
   - Real-time Consensus Engine computing tri-modal diagnostic agreement %.
   - Empirical latency comparison benchmark.

2. **1) ML Symptom Classifier**:
   - Filterable & categorized symptom selector across 59 clinical symptoms (Respiratory, Cardiovascular, Gastrointestinal, Systemic, Neurological, etc.).
   - Interactive probability distribution bar charts for top differential diagnoses.
   - Pre-configured symptom presets.
   - Stacked layout with prediction output located cleanly below symptom selection.

3. **2) DL Chest Radiograph Vision**:
   - Drag-and-drop chest X-ray image upload or 1-click sample selector (Normal vs Pneumonia).
   - Live Grad-CAM heatmap overlay with toggle.
   - 31-layer CNN architecture inspector (1,766,341 total parameters).

4. **3) Simple Rules Engine (J48)**:
   - Interactive SVG decision tree mirroring `j48.png` with live active branch highlighting and glow effects.
   - Step-by-step clinical audit trail and formal logic expression generation.
   - Side-by-side view of the original `j48.png`.

5. **Paradigm Benchmark Matrix**:
   - Multi-dimensional radar/bar scores comparing Interpretability, Latency, Modality Power, and Hardware Demands.
