# 🚀 Deployment Guide — ClinicalTriModal AI Platform

This project is built with a **unified single-process architecture**:
- **Frontend**: React 18 + Vite (compiled into static bundle in `frontend/dist`)
- **Backend**: FastAPI + Uvicorn serving both `/api/*` and compiled UI on a single dynamic port (`$PORT` or `8000`)
- **Trained Models**: Random Forest (`disease_prediction_model.pkl`), 31-Layer CNN (`pneumonia_cnn_final.keras`), and J48 Rules (`j48.png`) totaling ~16 MB.

---

## 🌟 Quick Platform Comparison

| Platform | Free Tier | RAM | Best For | Difficulty |
| :--- | :--- | :--- | :--- | :--- |
| **Hugging Face Spaces** | ✅ Free Forever | **16 GB RAM** | AI / ML Demos & Showcases | ⭐ Super Easy |
| **Railway.app** | 💳 $5 Trial / Usage | Up to 8 GB | Production 1-Click Git Deploy | ⭐ Super Easy |
| **Render.com** | ✅ Free Tier | 512 MB (1 GB+ on paid) | Low-cost PaaS Web Service | ⭐ Easy |
| **Google Cloud Run** | 💳 Free monthly quota | Configurable (1–4 GB) | Scalable, Serverless Containers | ⭐⭐ Moderate |
| **AWS EC2 / DigitalOcean** | 💳 From $4–$6/mo | 1–2 GB | Dedicated VPS / Full Root Control | ⭐⭐⭐ Advanced |

---

## Option 1: Deploy to Hugging Face Spaces (Recommended for AI/ML)

Hugging Face Spaces offers **2 vCPU + 16 GB RAM completely free**, which is ideal for PyTorch and Keras models without memory throttling.

### Steps:
1. Go to [Hugging Face](https://huggingface.co/) and log in (or sign up).
2. Click **New Space** ([huggingface.co/new-space](https://huggingface.co/new-space)).
3. Fill in the details:
   - **Space Name**: `clinical-trimodal-ai`
   - **License**: `mit` or `apache-2.0`
   - **Space SDK**: Select **Docker** -> **Blank**
   - **Space Hardware**: Free CPU basic (2 vCPU, 16GB RAM)
4. Clone the new Space repo locally or add it as a git remote:
   ```bash
   git remote add hf https://huggingface.co/spaces/<YOUR_USERNAME>/clinical-trimodal-ai
   git push hf main
   ```
5. Hugging Face will automatically build the `Dockerfile`, install CPU PyTorch, and launch the web dashboard on port `7860` (or dynamic port).

*(Note: In Hugging Face Docker spaces, port `7860` is default. The included `Dockerfile` automatically adapts via `${PORT:-8000}`.)*

---

## Option 2: Deploy to Railway.app (Fastest 1-Click Git Deploy)

Railway provides seamless Dockerfile deployments with instant custom domains and SSL.

### Steps:
1. Push your repository to **GitHub**.
2. Visit [Railway.app](https://railway.app/) and sign in with GitHub.
3. Click **"New Project"** -> **"Deploy from GitHub repo"**.
4. Select your `clinical-trimodal-ai` repository.
5. Railway will automatically detect the `Dockerfile` and start building.
6. Under **Settings** -> **Networking**, click **"Generate Domain"** to get a public `https://...up.railway.app` URL.

---

## Option 3: Deploy Frontend on Vercel + Backend on Render (Split Stack)

This is a popular modern decoupled deployment pattern.

### ⚠️ Backend Memory Benchmark & Render Free Tier Analysis
We profiled the Python process with `psutil`:
- **Startup with Scikit-Learn + Simple Rules**: **~171 MB RAM** (passes Render Free Tier).
- **Deep Learning CNN (Keras 3 + PyTorch 31-Layer CNN + Grad-CAM) Loaded**: **~490–520 MB RAM**.
- **Full DL Image Inference Peak**: **~530–545 MB RAM**.

> [!WARNING]
> Render's **Free Tier** enforces a hard **512 MB RAM** limit.
> Although we added **Lazy Loading** (so the server boots in ~171 MB), when chest radiograph inference or tri-modal consensus runs, peak memory reaches ~530 MB, which risks getting killed by Render's OOM killer.
> **Recommendation**:
> - For Render, use the **Starter Plan ($7/mo with 1 GB RAM)** for 100% stability.
> - Alternatively, deploy the backend to **Hugging Face Spaces** (Free with 16 GB RAM) or **Railway** (Free trial with up to 8 GB RAM).

---

### Step A: Deploy Backend to Render

1. Push your repository to GitHub.
2. On [Render Dashboard](https://dashboard.render.com/), click **"New +"** -> **"Web Service"**.
3. Select your GitHub repository.
4. Settings:
   - **Environment**: `Docker` (Render automatically uses `Dockerfile`)
   - **Root Directory**: Leave blank (root `.`)
   - **Instance Type**: **Starter (1 GB RAM)** recommended (or Free to test).
5. Once deployed, copy your Render service URL:
   `https://<YOUR-RENDER-APP-NAME>.onrender.com`
6. Verify your backend is running by opening:
   `https://<YOUR-RENDER-APP-NAME>.onrender.com/api/health`

---

### Step B: Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/) and click **"Add New..."** -> **"Project"**.
2. Import your GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (click "Edit" and choose `frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://<YOUR-RENDER-APP-NAME>.onrender.com` (your Render URL from Step A without trailing slash)
5. Click **"Deploy"**.

Vercel will build the React application and deploy it to their global edge CDN with a custom URL like `https://clinical-trimodal-ai.vercel.app`.

---

## Option 4: Deploy on Any Linux VPS (Ubuntu / Debian on AWS EC2, DigitalOcean, Hetzner)

For dedicated server hosting with custom domains and SSL certificates:

### 1. Install Docker & Git
```bash
sudo apt update && sudo apt install -y docker.io docker-compose git
sudo systemctl enable --now docker
```

### 2. Clone Repository & Launch with Docker Compose
```bash
git clone <YOUR_GIT_REPO_URL>
cd CIL

# Build and start container in detached mode
sudo docker compose up -d --build
```

The app will now run on `http://YOUR_SERVER_IP:8000`.

### 3. Setup Nginx Reverse Proxy with Free SSL (Let's Encrypt)
Install Nginx and Certbot:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Create `/etc/nginx/sites-available/clinical-ai`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and acquire SSL:
```bash
sudo ln -s /etc/nginx/sites-available/clinical-ai /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Option 5: Google Cloud Run (Serverless Container)

Cloud Run automatically scales down to zero when idle to minimize costs:

```bash
# Authenticate with Google Cloud
gcloud auth login
gcloud config set project <PROJECT_ID>

# Build and deploy directly from source
gcloud run deploy clinical-trimodal-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --port 8000
```

---

## 💡 Important Production Performance Tips

1. **CPU-only PyTorch**:
   Standard `torch` packages bundle over 2.5 GB of CUDA binaries meant for NVIDIA GPUs. For web inference, using the CPU wheel:
   ```bash
   pip install torch --index-url https://download.pytorch.org/whl/cpu
   ```
   reduces installation size to **~180 MB**, preventing build timeouts and out-of-disk crashes.

2. **Memory Allocation**:
   Deep Learning and Scikit-Learn ensembles consume **~400MB–800MB RAM** at runtime. Ensure your hosting container has at least **1 GB of RAM** allocated.

3. **Dynamic Port (`$PORT`)**:
   FastAPI server dynamically binds to `$PORT` passed by hosting platforms (or defaults to `8000`).
