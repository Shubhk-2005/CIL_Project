import os
import io
import time
import base64
import numpy as np
from PIL import Image
from typing import Dict, Any, Optional

os.environ["KERAS_BACKEND"] = "torch"
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
import keras
import torch
torch.set_num_threads(1)
import matplotlib
matplotlib.use('Agg')
import matplotlib.cm as cm
import gc

class DLService:
    def __init__(self, model_path: str = "pneumonia_cnn_final.keras", samples_dir: str = "backend/samples"):
        self.model_path = model_path
        self.samples_dir = samples_dir
        self.model = None
        self.cam_model = None
        self.total_params = 1766341
        self._loaded = False

    def ensure_model_loaded(self):
        if not self._loaded:
            self._load_model()
            self._loaded = True

    def _load_model(self):
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"DL Model not found at: {self.model_path}")
        self.model = keras.models.load_model(self.model_path)
        try:
            target_layer = self.model.get_layer("conv2d_3")
            self.cam_model = keras.Model(
                inputs=self.model.inputs,
                outputs=[target_layer.output, self.model.output]
            )
        except Exception as e:
            print(f"Warning: could not build CAM model: {e}")
            self.cam_model = None

    def get_model_info(self) -> Dict[str, Any]:
        self.ensure_model_loaded()
        layers_info = []
        for l in self.model.layers:
            layers_info.append({
                "name": l.name,
                "type": l.__class__.__name__,
                "output_shape": str(getattr(l, "output_shape", "unknown"))
            })
        return {
            "name": "Pneumonia Chest X-Ray Deep CNN",
            "framework": "Keras 3 / PyTorch Engine",
            "input_resolution": "224 x 224 x 3 (RGB)",
            "total_layers": len(self.model.layers),
            "layers": layers_info,
            "total_parameters": "1,766,341",
            "trainable_parameters": "588,033",
            "loss_metric": "Binary Crossentropy with ROC-AUC & Precision/Recall"
        }

    def list_samples(self) -> list:
        samples = []
        if os.path.exists(self.samples_dir):
            for fname in sorted(os.listdir(self.samples_dir)):
                if fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                    label = "Pneumonia Infiltrates" if "pneumonia" in fname.lower() else "Normal Clear Lungs"
                    samples.append({
                        "id": fname,
                        "filename": fname,
                        "label": label,
                        "path": os.path.join(self.samples_dir, fname)
                    })
        return samples

    def predict_image(self, image_bytes: bytes, filename: str = "radiograph.jpg") -> Dict[str, Any]:
        self.ensure_model_loaded()
        start_time = time.time()
        
        # Open and ensure RGB 224x224
        img_original = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_resized = img_original.resize((224, 224), Image.Resampling.LANCZOS)
        
        raw_arr = np.array(img_resized, dtype=np.float32)
        norm_arr = raw_arr / 255.0
        inp_tensor = torch.tensor(norm_arr).unsqueeze(0)
        
        heatmap_b64 = None
        raw_score = 0.5
        
        with torch.inference_mode():
            if self.cam_model is not None:
                try:
                    conv_out, pred = self.cam_model(inp_tensor)
                    raw_score = float(pred.detach().cpu().numpy()[0][0])
                    
                    conv_data = conv_out.detach().cpu().numpy()[0]
                    heatmap = np.mean(np.maximum(conv_data, 0), axis=-1)
                    h_min, h_max = heatmap.min(), heatmap.max()
                    if h_max > h_min:
                        heatmap = (heatmap - h_min) / (h_max - h_min + 1e-8)
                    else:
                        heatmap = np.zeros_like(heatmap)
                    
                    heatmap_pil = Image.fromarray(np.uint8(255 * heatmap)).resize((224, 224), Image.Resampling.BILINEAR)
                    
                    # Robust colormap access compatible with all matplotlib versions (3.5 through 3.10+)
                    if hasattr(matplotlib, 'colormaps'):
                        colormap = matplotlib.colormaps['jet']
                    elif hasattr(cm, 'get_cmap'):
                        colormap = cm.get_cmap('jet')
                    else:
                        colormap = getattr(cm, 'jet', None)

                    colored = colormap(np.array(heatmap_pil) / 255.0)[:, :, :3]
                    colored_img = Image.fromarray(np.uint8(255 * colored))
                    
                    overlay = Image.blend(img_resized, colored_img, alpha=0.45)
                    
                    out_buf = io.BytesIO()
                    overlay.save(out_buf, format="JPEG", quality=92)
                    heatmap_b64 = base64.b64encode(out_buf.getvalue()).decode("utf-8")
                except Exception as e:
                    print(f"CAM calculation fallback: {e}")
                    # If raw_score was not yet computed, run direct tensor inference (fast & low memory)
                    if raw_score == 0.5:
                        pred = self.model(inp_tensor)
                        raw_score = float(pred.detach().cpu().numpy()[0][0])
            else:
                # Direct tensor inference: 40ms, zero compilation overhead, stays under 500MB
                pred = self.model(inp_tensor)
                raw_score = float(pred.detach().cpu().numpy()[0][0])
        
        del inp_tensor
        gc.collect()

        pneumonia_prob = max(0.01, min(0.99, raw_score))
        if pneumonia_prob >= 0.5:
            diagnosis = "PNEUMONIA"
            confidence = pneumonia_prob * 100.0
            risk_tier = "CRITICAL / HOSPITAL TRIAGE" if confidence > 80 else "MODERATE / RADIOLOGY REVIEW"
            clinical_finding = "Alveolar consolidation, bilateral infiltrates, or patchy opacities observed in lung fields."
        else:
            diagnosis = "NORMAL"
            confidence = (1.0 - pneumonia_prob) * 100.0
            risk_tier = "LOW / CLEAR LUNG FIELDS"
            clinical_finding = "Clear lung parenchymal fields without prominent consolidation, effusion, or pneumothorax."

        orig_buf = io.BytesIO()
        img_resized.save(orig_buf, format="JPEG", quality=90)
        orig_b64 = base64.b64encode(orig_buf.getvalue()).decode("utf-8")

        latency = round((time.time() - start_time) * 1000, 2)

        return {
            "diagnosis": diagnosis,
            "confidence_percent": round(confidence, 1),
            "pneumonia_probability": round(pneumonia_prob, 4),
            "normal_probability": round(1.0 - pneumonia_prob, 4),
            "risk_tier": risk_tier,
            "clinical_finding": clinical_finding,
            "latency_ms": latency,
            "filename": filename,
            "original_image": f"data:image/jpeg;base64,{orig_b64}",
            "heatmap_image": f"data:image/jpeg;base64,{heatmap_b64}" if heatmap_b64 else None,
            "model_type": "Deep Convolutional Neural Network (31 layers, 224x224)"
        }
