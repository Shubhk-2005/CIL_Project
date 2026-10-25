import os
import io
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from backend.ml_service import MLService
from backend.dl_service import DLService
from backend.rules_service import RulesService

app = FastAPI(
    title="Clinical Multi-Modal Diagnostic Intelligence Dashboard",
    description="Tri-Modal Healthcare Predictor: Machine Learning (Random Forest) vs Deep Learning (CNN) vs Simple Rules (J48 Decision Tree)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
ML_MODEL_PATH = os.getenv("ML_MODEL_PATH", os.path.join(BASE_DIR, "disease_prediction_model.pkl"))
DL_MODEL_PATH = os.getenv("DL_MODEL_PATH", os.path.join(BASE_DIR, "pneumonia_cnn_final.keras"))
SAMPLES_DIR = os.getenv("SAMPLES_DIR", os.path.join(BASE_DIR, "backend", "samples"))

ml_service = MLService(model_path=ML_MODEL_PATH)
dl_service = DLService(model_path=DL_MODEL_PATH, samples_dir=SAMPLES_DIR)
rules_service = RulesService()

class MLPredictRequest(BaseModel):
    symptoms: List[str]
    top_k: Optional[int] = 5

class RulesPredictRequest(BaseModel):
    dyspnea: str = "no"
    polyuria: str = "no"
    RT_PCR: str = "not_done"
    skin_lesion: str = "no"

class EnsemblePredictRequest(BaseModel):
    symptoms: List[str] = []
    dyspnea: str = "no"
    polyuria: str = "no"
    RT_PCR: str = "not_done"
    skin_lesion: str = "no"
    sample_image_id: Optional[str] = None

@app.get("/api/health")
def health():
    try:
        import psutil
        process = psutil.Process(os.getpid())
        rss_mb = round(process.memory_info().rss / (1024 * 1024), 2)
    except Exception:
        rss_mb = None

    return {
        "status": "healthy",
        "memory": {
            "rss_mb": rss_mb,
            "render_limit_mb": 512,
            "status": "healthy (< 512MB)" if (rss_mb is not None and rss_mb < 512) else "exceeds free tier (> 512MB)"
        },
        "models": {
            "ml_model": "Loaded (Random Forest 200 trees, 59 symptoms, 41 diseases)",
            "dl_model": "Active in Memory (Chest X-Ray CNN 31 layers)" if dl_service._loaded else "Ready / Lazy Standby (PyTorch)",
            "rules_model": "Loaded (J48 Clinical Decision Tree from j48.png)"
        },
        "system_time": time.time()
    }

@app.get("/api/ml/features")
def get_ml_features():
    return ml_service.get_features_metadata()

@app.post("/api/ml/predict")
def predict_ml(req: MLPredictRequest):
    return ml_service.predict(req.symptoms, req.top_k)

@app.get("/api/dl/info")
def get_dl_info():
    return dl_service.get_model_info()

@app.get("/api/dl/samples")
def get_dl_samples():
    return dl_service.list_samples()

@app.post("/api/dl/predict")
async def predict_dl(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None)
):
    try:
        if file is not None and file.filename:
            content = await file.read()
            return dl_service.predict_image(content, filename=file.filename)
        elif sample_id:
            sample_path = os.path.join("backend/samples", sample_id)
            if not os.path.exists(sample_path):
                raise HTTPException(status_code=404, detail="Sample image not found")
            with open(sample_path, "rb") as f:
                content = f.read()
            return dl_service.predict_image(content, filename=sample_id)
        else:
            raise HTTPException(status_code=400, detail="Either an image file or sample_id must be provided")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/rules/info")
def get_rules_info():
    return rules_service.get_tree_metadata()

@app.post("/api/rules/predict")
def predict_rules(req: RulesPredictRequest):
    return rules_service.evaluate(
        dyspnea=req.dyspnea,
        polyuria=req.polyuria,
        RT_PCR=req.RT_PCR,
        skin_lesion=req.skin_lesion
    )

@app.post("/api/ensemble/predict")
async def predict_ensemble(req: EnsemblePredictRequest):
    start = time.time()
    
    ml_result = ml_service.predict(req.symptoms, top_k=5)
    rules_result = rules_service.evaluate(
        dyspnea=req.dyspnea,
        polyuria=req.polyuria,
        RT_PCR=req.RT_PCR,
        skin_lesion=req.skin_lesion
    )
    
    dl_result = None
    if req.sample_image_id:
        sample_path = os.path.join("backend/samples", req.sample_image_id)
        if os.path.exists(sample_path):
            with open(sample_path, "rb") as f:
                dl_result = dl_service.predict_image(f.read(), filename=req.sample_image_id)

    ml_top = ml_result.get("top_prediction", "").lower().strip()
    rule_top = rules_result.get("diagnosis", "").lower().strip()
    dl_top = (dl_result.get("diagnosis", "").lower().strip()) if dl_result else None

    consensus_matches = []
    if "pneumonia" in ml_top and "pneumonia" in rule_top:
        consensus_matches.append("ML & Rules agree on Pneumonia")
    if dl_top and "pneumonia" in dl_top and "pneumonia" in rule_top:
        consensus_matches.append("DL & Rules agree on Pneumonia")
    if dl_top and "pneumonia" in dl_top and "pneumonia" in ml_top:
        consensus_matches.append("ML & DL agree on Pneumonia")
    if "diabetes" in ml_top and "diabetes" in rule_top:
        consensus_matches.append("ML & Rules agree on Diabetes")
    if "hypertension" in ml_top and "hypertension" in rule_top:
        consensus_matches.append("ML & Rules agree on Hypertension")

    total_checked = 3 if dl_result else 2
    if len(consensus_matches) >= 2 or ("pneumonia" in ml_top and "pneumonia" in rule_top and dl_top == "pneumonia"):
        consensus_level = "High Consensus (Full Alignment)"
        consensus_score = 95
    elif len(consensus_matches) >= 1:
        consensus_level = "Partial Consensus (Dual Agreement)"
        consensus_score = 75
    else:
        consensus_level = "Differential Divergence (Independent Findings)"
        consensus_score = 50

    total_latency = round((time.time() - start) * 1000, 2)

    return {
        "ml": ml_result,
        "rules": rules_result,
        "dl": dl_result,
        "consensus": {
            "level": consensus_level,
            "score": consensus_score,
            "matches": consensus_matches,
            "summary": f"Evaluated across {total_checked} distinct paradigms (Statistical ML, Vision DL, Logic Tree)."
        },
        "total_latency_ms": total_latency
    }

@app.get("/api/benchmark/matrix")
def get_benchmark_matrix():
    return {
        "paradigms": [
            {
                "id": "rules",
                "name": "3) Simple Rules Prediction",
                "engine": "J48 Decision Tree (C4.5 Heuristic)",
                "modality": "Structured Tabular Questions (Binary / Categorical)",
                "interpretability": 100,
                "latency_score": 99,
                "data_efficiency": 100,
                "robustness": 70,
                "complexity": 20,
                "pros": [
                    "100% transparent audit trail (every branch is explainable)",
                    "Sub-millisecond inference time (<0.2ms)",
                    "Zero GPU or specialized hardware needed",
                    "Deterministic and reproducible clinical pathways"
                ],
                "cons": [
                    "Rigid decision boundaries cannot capture subtle nuance",
                    "Fragile to unobserved or ambiguous symptoms",
                    "Cannot ingest high-dimensional image data"
                ]
            },
            {
                "id": "ml",
                "name": "1) Machine Learning Prediction",
                "engine": "Random Forest Ensemble (200 Trees)",
                "modality": "59 Clinical Symptoms (Multi-Class Feature Vector)",
                "interpretability": 78,
                "latency_score": 92,
                "data_efficiency": 75,
                "robustness": 88,
                "complexity": 60,
                "pros": [
                    "Calculates probability distribution over 41 complex diseases",
                    "Resilient to missing or noisy symptoms",
                    "Captures non-linear feature interactions and co-morbidities",
                    "Provides probabilistic confidence score"
                ],
                "cons": [
                    "Requires feature engineering and tabular encoding",
                    "Slightly harder to audit individual tree splits across 200 estimators",
                    "Cannot process raw radiographs directly"
                ]
            },
            {
                "id": "dl",
                "name": "2) Deep Learning Prediction",
                "engine": "Deep CNN (31 Layers, Conv2D + BatchNorm + GAP)",
                "modality": "Chest Radiograph Images (224x224x3 Tensor)",
                "interpretability": 65,
                "latency_score": 60,
                "data_efficiency": 50,
                "robustness": 82,
                "complexity": 95,
                "pros": [
                    "Extracts hierarchical spatial features directly from raw image pixels",
                    "Identifies sub-visual pulmonary infiltrates & consolidations",
                    "Grad-CAM visual heatmap localized to lung fields",
                    "Learns continuous anatomical representations without manual feature crafting"
                ],
                "cons": [
                    "Black-box representation requires CAM activation maps to interpret",
                    "Requires neural network accelerator / PyTorch runtime",
                    "Sensitive to imaging artifacts and scanner variations"
                ]
            }
        ]
    }

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
