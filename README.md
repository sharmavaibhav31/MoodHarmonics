# 🎵 MoodHarmonics  
## End-to-End AI Music & Lyrics Generation System

### TL;DR
MoodHarmonics is a full-stack AI system that converts natural-language prompts into music, lyrics, and genre-classified audio.  
The focus of this project is **multi-model orchestration, system reliability, and production-style ML integration**, not just standalone model demos.

### Demo Preview

[![MoodHarmonics Demo](https://img.youtube.com/vi/_zNX8DbLzZ0/0.jpg)](https://youtu.be/_zNX8DbLzZ0)

---

## 🚀 What This Project Does
- Text-to-music generation using **Meta MusicGen**
- AI-generated lyrics using **fine-tuned GPT-based models**
- Automatic genre classification using **YAMNet embeddings + GTZAN**
- Library and playlist management for generated and uploaded tracks

---

## 🧠 System Focus 
This project was built to explore how **multiple AI models with different runtimes and constraints** can be integrated into a single, usable system.

Key engineering goals:
- Orchestrating heterogeneous ML models (audio, text, classification)
- Managing heavy model initialization via **preloading**
- Designing **fallback paths** when local models fail
- Exposing ML inference through clean backend APIs
- Handling real-world trade-offs (latency, failures, storage)

---

## 🏗️ Architecture Overview

```text
Frontend (React) - User Prompt
      ↓
Backend API Layer (Flask)
      ↓
Orchestration Layer
-----------------------------------------
| MusicGen       → Audio Generation      |
| GPT-based LLM  → Lyrics Generation     |
| YAMNet + NN    → Genre Classification  |
-----------------------------------------
      ↓
MongoDB (Metadata, Users)
Local Storage (Audio Files)
``` 

## 🧩 Core Components

### 1️⃣ Music Generation
- **Model:** Meta MusicGen (Small)
- **Input:** Natural language prompt
- **Output:** 20–30 second WAV audio

**Optimizations:**
- Model preloaded at server startup
- Local inference preferred, with Hugging Face fallback

---

### 2️⃣ Lyrics Generation
- **Model:** Fine-tuned GPT-based lyric models
- **Fallback:** GPT-2

**Why fine-tuned?**
- Base GPT models produce descriptive text
- Fine-tuning enforces lyrical structure (verses, chorus)

---

### 3️⃣ Genre Classification
- **Feature Extraction:** Google YAMNet
- **Classifier:** GTZAN-trained neural network
- **Output:** Genre + confidence score

**Used for:**
- Automatic categorization
- Library and playlist organization

---

## 🗄️ Data & Storage

### MongoDB
- Semi-structured song metadata
- User credentials (hashed before storage)

### Local File Storage
- Generated and uploaded audio files  
  `static/music/`

---

## ⚙️ Performance & Reliability
- ✅ Model preloading to avoid repeated initialization
- ✅ Graceful fallbacks for missing or failed models
- ❌ No aggressive caching (intentional, learning-focused)

---

## 🛠️ Tech Stack

### Frontend
- React
- JavaScript
- HTML
- CSS

### Backend
- Python
- Flask
- REST APIs

### AI / ML
- Meta MusicGen
- GPT-based language models
- Google YAMNet
- Librosa
- NumPy
- TensorFlow
- PyTorch

### Database
- MongoDB

---

## 🧪 Running Locally

### 1️⃣ Clone the Repository
```
git clone https://github.com/sharmavaibhav31/MoodHarmonics.git
cd MoodHarmonics
```

### 2️⃣ Install Dependencies
```
pip install -r requirements.txt
```
3️⃣ Start the Server
```
python app.py    
```
### 4️⃣ Open in Browser
```
http://127.0.0.1:5000
```

## 🧠 Challenges & Learnings
- Coordinating models across different ML frameworks
- Preventing repeated heavy model loading
- Improving lyric structure without training from scratch
- Designing APIs around ML inference constraints

📌 Future Improvements
- Dockerized deployment
- Cloud-based storage and inference
- JWT-based authentication
- Streaming-optimized audio generation
- Add an async task queue

## 🎯 Why This Project Matters
- MoodHarmonics demonstrates:
- Applied ML integration
- System-level thinking
- Performance awareness
- Engineering trade-offs  
- End-to-end ownership

```
Right now inference likely runs inside Flask requests.
API
 ↓
Task Queue (Redis + Celery)
 ↓
Model Workers
```
## 👤 Author
Vaibhav Sharma   
Backend & Applied ML Engineer   
Learning by building real systems.
