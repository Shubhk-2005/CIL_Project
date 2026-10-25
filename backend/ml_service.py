import os
import pickle
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional

FEATURE_CATEGORIES = {
    "Respiratory": [
        "breathlessness", "cough", "congestion", "phlegm", "runny_nose",
        "sinus_pressure", "throat_irritation", "blood_in_sputum", "rusty_sputum"
    ],
    "Cardiovascular & Chest": [
        "chest_pain", "fast_heart_rate", "palpitations"
    ],
    "Systemic & Fever": [
        "high_fever", "mild_fever", "chills", "fatigue", "malaise",
        "lethargy", "sweating", "weight_loss", "headache"
    ],
    "Gastrointestinal": [
        "abdominal_pain", "acidity", "nausea", "vomiting", "diarrhoea",
        "loss_of_appetite", "stomach_bleeding"
    ],
    "Musculoskeletal": [
        "back_pain", "joint_pain", "muscle_pain", "muscle_weakness"
    ],
    "Dermatological / Skin": [
        "itching", "skin_rash", "red_spots_over_body", "yellowish_skin", "brittle_nails"
    ],
    "Neurological & Mood": [
        "anxiety", "depression", "irritability", "slurred_speech", "coma"
    ],
    "Sensory & Ocular": [
        "blurred_and_distorted_vision", "visual_disturbances", "loss_of_smell",
        "pain_behind_the_eyes", "redness_of_eyes", "yellowing_of_eyes"
    ],
    "Endocrine & Metabolic": [
        "polyuria", "excessive_hunger", "increased_appetite", "enlarged_thyroid", "abnormal_menstruation"
    ],
    "History & Peripheral": [
        "family_history", "receiving_blood_transfusion", "receiving_unsterile_injections",
        "swelled_lymph_nodes", "swollen_extremeties", "dark_urine"
    ]
}

FEATURE_LABELS = {
    "breathlessness": "Breathlessness (Dyspnea)",
    "cough": "Persistent Cough",
    "congestion": "Chest/Nasal Congestion",
    "phlegm": "Mucus / Phlegm",
    "runny_nose": "Runny Nose (Rhinorrhea)",
    "sinus_pressure": "Sinus Pressure",
    "throat_irritation": "Throat Irritation",
    "blood_in_sputum": "Hemoptysis (Blood in Sputum)",
    "rusty_sputum": "Rusty Sputum",
    "chest_pain": "Chest Pain / Tightness",
    "fast_heart_rate": "Tachycardia (Rapid Pulse)",
    "palpitations": "Heart Palpitations",
    "high_fever": "High Grade Fever (>102°F)",
    "mild_fever": "Low Grade Fever",
    "chills": "Chills & Shivering",
    "fatigue": "Generalized Fatigue",
    "malaise": "General Malaise",
    "lethargy": "Extreme Lethargy",
    "sweating": "Diaphoresis (Profuse Sweats)",
    "weight_loss": "Unexplained Weight Loss",
    "headache": "Cephalea (Headache)",
    "abdominal_pain": "Abdominal Pain",
    "acidity": "Gastric Acidity / Heartburn",
    "nausea": "Nausea",
    "vomiting": "Vomiting",
    "diarrhoea": "Diarrhea",
    "loss_of_appetite": "Anorexia (Loss of Appetite)",
    "stomach_bleeding": "GI Bleeding / Melena",
    "back_pain": "Back Pain",
    "joint_pain": "Arthralgia (Joint Pain)",
    "muscle_pain": "Myalgia (Muscle Aches)",
    "muscle_weakness": "Muscle Weakness",
    "itching": "Pruritus (Itching)",
    "skin_rash": "Cutaneous Rash",
    "red_spots_over_body": "Petechiae / Red Spots",
    "yellowish_skin": "Jaundice (Yellowish Skin)",
    "brittle_nails": "Brittle Nails",
    "anxiety": "Anxiety / Restlessness",
    "depression": "Depressive Mood",
    "irritability": "Irritability",
    "slurred_speech": "Dysarthria (Slurred Speech)",
    "coma": "Altered Sensorium / Coma",
    "blurred_and_distorted_vision": "Blurred / Distorted Vision",
    "visual_disturbances": "Visual Disturbances",
    "loss_of_smell": "Anosmia (Loss of Smell)",
    "pain_behind_the_eyes": "Retro-orbital Pain",
    "redness_of_eyes": "Conjunctival Injection (Red Eyes)",
    "yellowing_of_eyes": "Scleral Icterus (Yellow Eyes)",
    "polyuria": "Polyuria (Excessive Urination)",
    "excessive_hunger": "Polyphagia (Excessive Hunger)",
    "increased_appetite": "Increased Appetite",
    "enlarged_thyroid": "Goiter (Enlarged Thyroid)",
    "abnormal_menstruation": "Menstrual Irregularity",
    "family_history": "Family History of Condition",
    "receiving_blood_transfusion": "Recent Blood Transfusion",
    "receiving_unsterile_injections": "History of Unsterile Injections",
    "swelled_lymph_nodes": "Lymphadenopathy (Swollen Nodes)",
    "swollen_extremeties": "Peripheral Edema (Swollen Limbs)",
    "dark_urine": "Bilirubinuria (Dark Urine)"
}

PRESETS = {
    "pneumonia_case": {
        "name": "Patient 1: Acute Pneumonia Profile",
        "description": "Patient presenting with high fever, productive cough, breathlessness, and chest pain.",
        "symptoms": ["cough", "breathlessness", "high_fever", "chills", "chest_pain", "phlegm", "fatigue", "malaise"]
    },
    "diabetes_case": {
        "name": "Patient 2: Metabolic / Diabetes Profile",
        "description": "Patient experiencing polyuria, excessive hunger, blurred vision, and persistent lethargy.",
        "symptoms": ["polyuria", "excessive_hunger", "increased_appetite", "fatigue", "lethargy", "blurred_and_distorted_vision", "weight_loss"]
    },
    "malaria_case": {
        "name": "Patient 3: Tropical Fever / Malaria",
        "description": "Severe chills, episodic high fever, profuse sweating, headache, and muscle pain.",
        "symptoms": ["chills", "high_fever", "sweating", "headache", "nausea", "muscle_pain", "vomiting", "diarrhoea"]
    },
    "common_cold": {
        "name": "Patient 4: Viral Upper Respiratory / Cold",
        "description": "Mild fever, runny nose, sinus pressure, throat irritation, and sneezing.",
        "symptoms": ["runny_nose", "congestion", "throat_irritation", "cough", "sinus_pressure", "mild_fever", "headache"]
    },
    "hypertension_gerd": {
        "name": "Patient 5: Hypertensive & Chest Discomfort",
        "description": "Headache, palpitations, chest discomfort, and visual disturbances.",
        "symptoms": ["headache", "chest_pain", "fast_heart_rate", "palpitations", "visual_disturbances"]
    }
}

class MLService:
    def __init__(self, model_path: str = "disease_prediction_model.pkl"):
        self.model_path = model_path
        self.model = None
        self.label_encoder = None
        self.scaler = None
        self.selected_features = []
        self.classes = []
        self._load_model()

    def _load_model(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at: {self.model_path}")
        with open(self.model_path, "rb") as f:
            bundle = pickle.load(f)
        self.model = bundle["model"]
        self.label_encoder = bundle["label_encoder"]
        self.scaler = bundle["scaler"]
        self.selected_features = bundle["selected_features"]
        self.classes = list(self.label_encoder.classes_)

    def get_features_metadata(self) -> Dict[str, Any]:
        return {
            "features": self.selected_features,
            "feature_labels": FEATURE_LABELS,
            "categories": FEATURE_CATEGORIES,
            "total_features": len(self.selected_features),
            "classes": self.classes,
            "presets": PRESETS
        }

    def predict(self, active_symptoms: List[str], top_k: int = 5) -> Dict[str, Any]:
        import time
        start_time = time.time()
        
        # Build 1D binary feature vector
        vector = np.zeros((1, len(self.selected_features)), dtype=np.float32)
        matched_symptoms = []
        for s in active_symptoms:
            if s in self.selected_features:
                idx = self.selected_features.index(s)
                vector[0, idx] = 1.0
                matched_symptoms.append(s)

        if not matched_symptoms:
            return {
                "top_prediction": "No Symptoms Selected",
                "confidence": 0.0,
                "top_predictions": [],
                "matched_symptoms": [],
                "total_active": 0,
                "latency_ms": round((time.time() - start_time) * 1000, 2),
                "model_type": "RandomForestClassifier (200 Estimators)",
                "note": "Please select at least one clinical symptom to evaluate."
            }

        # Apply StandardScaler then predict probabilities with feature names
        df_vector = pd.DataFrame(vector, columns=self.selected_features)
        vector_scaled = self.scaler.transform(df_vector)
        df_scaled = pd.DataFrame(vector_scaled, columns=self.selected_features)
        proba = self.model.predict_proba(df_scaled)[0]
        
        sorted_indices = np.argsort(proba)[::-1]
        
        top_predictions = []
        for rank, idx in enumerate(sorted_indices[:top_k]):
            disease_name = self.label_encoder.inverse_transform([idx])[0]
            probability = float(proba[idx])
            top_predictions.append({
                "rank": rank + 1,
                "disease": disease_name,
                "probability": round(probability, 4),
                "confidence_percent": round(probability * 100, 1),
                "risk_level": "High" if probability >= 0.35 else ("Moderate" if probability >= 0.15 else "Low")
            })

        top_pred = top_predictions[0] if top_predictions else None
        latency = round((time.time() - start_time) * 1000, 2)

        return {
            "top_prediction": top_pred["disease"] if top_pred else "Unknown",
            "confidence": top_pred["confidence_percent"] if top_pred else 0.0,
            "risk_level": top_pred["risk_level"] if top_pred else "Low",
            "top_predictions": top_predictions,
            "all_probabilities": [
                {"disease": self.label_encoder.inverse_transform([i])[0], "probability": round(float(proba[i]), 4)}
                for i in sorted_indices if proba[i] > 0.005
            ],
            "matched_symptoms": matched_symptoms,
            "total_active": len(matched_symptoms),
            "latency_ms": latency,
            "model_type": "RandomForestClassifier (200 trees, 59 features)",
            "selected_features_summary": [FEATURE_LABELS.get(s, s) for s in matched_symptoms]
        }
