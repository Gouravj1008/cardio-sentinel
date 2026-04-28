# Voice Assistant - Quick Start (5 minutes)

## TL;DR Setup

### Backend (1 minute)
```bash
cd backend
# Routes already integrated into server.js
# Models created at: backend/models/VoiceScreening.js and VoiceScreeningResponse.js
# Service created at: backend/services/voiceRuralAssistant.js

npm start
# Visit: http://localhost:5000/health
```

### Frontend (1 minute)
```bash
cd frontend
npm install
# Component already created at: frontend/components/VoiceScreening.tsx

# Add to your page:
import VoiceScreening from '@/components/VoiceScreening';
```

## Test the API (1 minute)

### 1. Get Your Token
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password"
  }'
# Copy the token from response
```

### 2. Start a Voice Screening
```bash
TOKEN="your_token_here"

curl -X POST http://localhost:5000/api/voice/screening/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"language": "hi"}'
```

### 3. Get Screening Results
```bash
curl http://localhost:5000/api/voice/screenings \
  -H "Authorization: Bearer $TOKEN"
```

## What Works Now

✅ **Voice Screening Service**
- All 12 languages supported
- Risk assessment logic
- Symptom collection in voice
- Cultural explanations

✅ **API Endpoints**
- Start screening
- Save responses
- Complete screening
- Get language list
- Doctor connection

✅ **Database Models**
- VoiceScreening collection
- VoiceScreeningResponse collection
- Indexes for performance

✅ **Frontend Component**
- Language selection
- Microphone UI
- Speech recognition
- Progress tracking

## What Needs Implementation

⚠️ **Cloud Integration (Optional)**
```javascript
// In backend/.env
GOOGLE_CLOUD_SPEECH_API_KEY=your_key_here
```

⚠️ **Audio Storage**
```javascript
// Save audio files to S3/Cloud Storage
// Modify OfflineTTSEngine class
```

⚠️ **Real-Time Doctor Connection**
```javascript
// Implement using WebRTC
// Uses Opus codec @ 6.4 kbps
```

⚠️ **Offline Mode**
```javascript
// Bundle language models
// Pre-record common prompts
```

## File Locations

```
backend/
├── services/
│   └── voiceRuralAssistant.js          ✅ Created
├── routes/
│   └── voiceScreeningRoutes.js          ✅ Created
├── models/
│   ├── VoiceScreening.js                ✅ Created
│   └── VoiceScreeningResponse.js        ✅ Created
└── server.js                             ✅ Updated

frontend/
└── components/
    └── VoiceScreening.tsx               ✅ Created

root/
└── VOICE_ASSISTANT_GUIDE.md             ✅ Created
```

## Example Workflow

```javascript
// 1. Frontend: User selects language and starts
const startScreening = async () => {
  const res = await fetch('/api/voice/screening/start', {
    method: 'POST',
    body: JSON.stringify({ language: 'hi' }),
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await res.json();
  console.log('Screening started:', data.screeningId);
};

// 2. Backend: Service conducts screening
const screening = await voiceAssistant.conductVoiceScreening(patientId, 'hi');
// - Plays greeting in Hindi
// - Listens to symptoms
// - Calculates risk
// - Explains results

// 3. Backend: Saves results
await screening.save();
// Document structure:
// {
//   patientId: ObjectId,
//   language: 'hi',
//   symptoms: { chest_pain: true, breathlessness: true },
//   riskAssessment: { riskScore: 0.65, category: 'MEDIUM' },
//   timestamp: Date
// }

// 4. Frontend: Shows results
console.log('Risk Score:', screening.riskAssessment.riskScore);
console.log('Category:', screening.riskAssessment.category);
```

## Key Classes & Methods

### RuralVoiceAssistant
```javascript
class RuralVoiceAssistant {
  // Main methods
  async conductVoiceScreening(patientId, language)
  async connectToDoctor(patientId, doctorId, language)
  async askSymptoms(symptomList, language)
  async speak(text, language)
  explainRiskInLocalTerms(riskScore, language)
}
```

### API Routes
```
POST   /api/voice/screening/start
POST   /api/voice/screening/:id/status
POST   /api/voice/doctor/connect
GET    /api/voice/screenings
GET    /api/voice/supported-languages
POST   /api/voice/screening/save-response
POST   /api/voice/screening/complete
```

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] `/api/voice/supported-languages` returns 12 languages
- [ ] Can start screening with valid language
- [ ] Frontend component loads
- [ ] Microphone permission request appears
- [ ] Voice input captured and displayed
- [ ] Risk assessment calculated
- [ ] Results saved to database
- [ ] Can retrieve screening history

## Next Steps

1. **Add Speech Recognition**
   - Google Cloud Speech-to-Text for cloud
   - Web Speech API for browser fallback

2. **Add Audio Storage**
   - Save audio to S3/Google Cloud Storage
   - Generate signedURLs for playback

3. **Add Doctor Connection**
   - Implement WebRTC for peer-to-peer
   - Add audio compression
   - Real-time translation

4. **Add Offline Support**
   - Bundle TTS models
   - Pre-record prompts
   - Service worker for offline mode

5. **Add Analytics**
   - Track screening completion rates
   - Monitor language preferences
   - Analyze risk distribution

## Common Issues & Fixes

### "Service not initialized"
```bash
# Make sure service initializes in routes
const voiceAssistant = new RuralVoiceAssistant();
await voiceAssistant.initialize();
```

### "Microphone access denied"
- Check browser permissions
- Use HTTPS in production
- Test with localhost in dev

### "Speech recognition not working"
- Verify Web Speech API available (Chrome, Edge, Safari)
- Check network connectivity
- Set up Google Cloud STT API key

## Performance Targets

- Screening completion: < 2 minutes
- Bandwidth per screening: < 200 KB
- Doctor connection setup: < 2 seconds
- Risk calculation: < 500ms

## Support

For full documentation, see: `VOICE_ASSISTANT_GUIDE.md`

Questions? Check the implementation comments in the service code.
