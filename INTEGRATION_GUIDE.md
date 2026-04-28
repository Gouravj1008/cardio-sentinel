# Integration Guide - Cardio Sentinel Prediction Dashboards

## Quick Start

### 1. Component Imports

```javascript
// In your main app/page component:
import ComprehensivePredictionDashboard from '@/components/ComprehensivePredictionDashboard';
import DoctorDashboard from '@/components/DoctorDashboard';

// For Next.js with dynamic imports (recommended for large components):
import dynamic from 'next/dynamic';

const ComprehensivePredictionDashboard = dynamic(
  () => import('@/components/ComprehensivePredictionDashboard'),
  { loading: () => <div>Loading dashboard...</div> }
);

const DoctorDashboard = dynamic(
  () => import('@/components/DoctorDashboard'),
  { loading: () => <div>Loading doctor dashboard...</div> }
);
```

### 2. Basic Usage

```javascript
// Patient Dashboard
<ComprehensivePredictionDashboard patientId="12345" />

// Doctor Dashboard
<DoctorDashboard />
```

## Component Props

### ComprehensivePredictionDashboard

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `patientId` | string | Yes | - | Unique patient identifier |
| `onRefresh` | function | No | - | Callback when refresh button clicked |
| `autoRefreshInterval` | number | No | 0 | Auto-refresh interval in milliseconds (0 = disabled) |

#### Example with Props:
```javascript
<ComprehensivePredictionDashboard 
  patientId="patient-123"
  autoRefreshInterval={60000}
  onRefresh={() => console.log('Refreshing data...')}
/>
```

### DoctorDashboard

No required props. Displays all patients.

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `onPatientSelect` | function | No | - | Callback when patient is selected (receives patientId) |
| `initialFilter` | string | No | 'All' | Initial risk level filter |

#### Example with Props:
```javascript
<DoctorDashboard 
  initialFilter="Critical"
  onPatientSelect={(id) => console.log(`Selected: ${id}`)}
/>
```

## API Endpoints Required

### For Patient Dashboard

#### 1. Comprehensive Prediction
```
POST /api/disease-prediction/comprehensive-predict
```

**Request Body:**
```json
{
  "patientId": "patient-123"
}
```

**Response:**
```json
{
  "prediction": 0 | 1,
  "probability": 0.85,
  "riskLevel": "HIGH",
  "confidence": 85,
  "aggregatedData": { ... },
  "visualizations": {
    "summaryCards": [ ... ],
    "radarData": [ ... ],
    "gaugeData": [ ... ],
    "combinedRiskChart": [ ... ],
    "trendCharts": { ... },
    "dataQualityMatrix": { ... }
  }
}
```

#### 2. Patient Dashboard
```
GET /api/disease-prediction/patient-dashboard/:patientId
```

**Response:**
```json
{
  "summaryCards": [ ... ],
  "currentData": { ... },
  "latestReport": { ... },
  "charts": {
    "vitals": [ ... ],
    "trends": { ... }
  }
}
```

### For Doctor Dashboard

#### 1. Batch Prediction
```
POST /api/disease-prediction/batch-predict
```

**Request Body:**
```json
{
  "riskFilter": "All" | "Critical" | "High" | "Moderate" | "Low"
}
```

**Response:**
```json
{
  "totalPatients": 50,
  "criticalCount": 2,
  "highCount": 5,
  "moderateCount": 12,
  "lowCount": 31,
  "predictions": [
    {
      "patientId": "...",
      "riskLevel": "CRITICAL",
      "probability": 0.95,
      "confidence": 95,
      "name": "...",
      "age": 45
    }
  ]
}
```

#### 2. Doctor Patient View
```
POST /api/disease-prediction/doctor-view/:patientId
```

**Response:**
```json
{
  "patient": {
    "id": "...",
    "name": "...",
    "email": "...",
    "age": 45
  },
  "currentAssessment": {
    "riskLevel": "HIGH",
    "probability": 0.85,
    "confidence": 85,
    "dataQuality": 92
  },
  "historyLast30Days": [ ... ],
  "recommendations": {
    "urgent": [ ... ],
    "important": [ ... ],
    "routine": [ ... ]
  },
  "visualizations": {
    "riskFactors": [ ... ],
    "trends": { ... }
  }
}
```

## Data Flow Diagram

```
Patient Request
    ↓
ComprehensivePredictionDashboard (React Component)
    ↓
  1. Call /api/disease-prediction/comprehensive-predict
    ↓
  2. Backend: aggregatePatientData()
    ↓
    ├── WearableData (Latest + Historical)
    ├── HealthRecords (Clinical data)
    ├── Reports (Medical documents)
    ├── OpenMeteo Weather API
    └── OpenMeteo Air Quality API
    ↓
  3. Backend: callPythonPredictionService()
    ↓
    Python: advancedPredictionService.py
    └── 5 ML Algorithms (RF, XGBoost, SVM, GB, NN)
    └── Consensus Voting
    └── Risk Stratification
    ↓
  4. Backend: generateVisualizationData()
    ↓
    ├── Summary Cards
    ├── Radar Chart (Vitals)
    ├── Risk Gauge
    ├── Combined Risk Bar
    ├── Trend Charts
    ├── Data Quality Matrix
    ├── Algorithm Consensus Bar
    └── Recommendations
    ↓
  5. Frontend: Display Dashboard
    ├── Overview Tab (Radar, Gauge, Risk Chart, Quality Matrix)
    ├── Vitals Tab (Cards, Trend Charts)
    ├── Environmental Tab (Cards, Impact Chart)
    ├── Prediction Tab (Risk Banner, Algorithm Breakdown)
    └── Recommendations Tab (Actions, Doctor Contact)
```

## Environment Setup

### Required Environment Variables

```env
# Backend
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cardio-sentinel
PYTHON_SERVICE_PATH=/path/to/backend/services

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend Setup

1. Ensure Python dependencies installed:
```bash
cd backend
pip install scikit-learn xgboost numpy pandas
```

2. Ensure Node dependencies installed:
```bash
npm install axios lodash dayjs
```

3. Verify database models exist:
   - `WearableData` collection
   - `HealthRecord` collection
   - `Report` collection
   - `User` collection

### Frontend Setup

1. Install React dependencies:
```bash
npm install axios recharts
```

2. Configure API base URL:
```javascript
// src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});
```

## Authentication Integration

Both components expect authentication to be handled at the routing level.

### Protecting Routes

```javascript
// src/middleware/protected.js
export async function middleware(request) {
  const token = request.cookies.get('authToken')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For patient routes
  if (request.nextUrl.pathname.startsWith('/patient/dashboard')) {
    // Verify patient owns the dashboard
  }

  // For doctor routes
  if (request.nextUrl.pathname.startsWith('/doctor/management')) {
    // Verify user is doctor
  }
}

export const config = {
  matcher: [
    '/patient/dashboard/:path*',
    '/doctor/management/:path*'
  ]
}
```

### API Interceptor with Auth

```javascript
// src/config/api.js
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Deployment Checklist

### Frontend

- [ ] Verify all CSS files are bundled
- [ ] Test responsive design at multiple resolutions
- [ ] Verify chart rendering in production build
- [ ] Test all interactive features
- [ ] Check console for errors
- [ ] Verify API connectivity
- [ ] Test error states and fallbacks
- [ ] Performance test in production environment

### Backend

- [ ] Verify Python service is executable
- [ ] Test ML model loading
- [ ] Verify database connections
- [ ] Test API endpoints individually
- [ ] Check external API connectivity (OpenMeteo)
- [ ] Verify authentication middleware
- [ ] Test error handling paths
- [ ] Enable logging for debugging

### Database

- [ ] Create necessary collections/indexes
- [ ] Verify data types match models
- [ ] Backup existing data
- [ ] Test data migration if needed

## Testing Guide

### Unit Testing Components

```javascript
// __tests__/ComprehensivePredictionDashboard.test.jsx
import { render, screen } from '@testing-library/react';
import ComprehensivePredictionDashboard from '../ComprehensivePredictionDashboard';

describe('ComprehensivePredictionDashboard', () => {
  it('renders with patientId prop', () => {
    render(<ComprehensivePredictionDashboard patientId="123" />);
    expect(screen.getByText(/Comprehensive Prediction/i)).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    render(<ComprehensivePredictionDashboard patientId="123" />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

### API Testing

```javascript
// Test comprehensive endpoint
const response = await axios.post('/api/disease-prediction/comprehensive-predict', {
  patientId: 'test-123'
});

expect(response.status).toBe(200);
expect(response.data).toHaveProperty('prediction');
expect(response.data).toHaveProperty('visualizations');
```

### E2E Testing

```javascript
// Cypress/Playwright test
describe('Patient Dashboard Flow', () => {
  it('loads and displays predictions', () => {
    cy.visit('/patient/dashboard');
    cy.contains('Comprehensive Prediction').should('be.visible');
    cy.contains('Overview').click();
    cy.get('[data-testid="radar-chart"]').should('be.visible');
  });
});
```

## Custom Styling

### Modifying Colors

Edit the color constants in CSS files:

```css
/* In ComprehensivePredictionDashboard.css */

:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --risk-critical: #ff6b6b;
  --risk-high: #ff922b;
  --risk-moderate: #ffd43b;
  --risk-low: #51cf66;
}
```

### Custom Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Your-Font:wght@400;600;700&display=swap');

.dashboard-header {
  font-family: 'Your-Font', sans-serif;
}
```

### Theme Configuration

```javascript
// src/config/theme.js
export const theme = {
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    success: '#51cf66',
    warning: '#ffd43b',
    danger: '#ff6b6b',
  },
  spacing: {
    xs: '5px',
    sm: '10px',
    md: '20px',
    lg: '30px',
    xl: '40px',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '999px',
  },
};
```

## Troubleshooting

### Common Issues

#### 1. Charts Not Rendering
**Problem**: Recharts components show blank
**Solution**:
```javascript
// Ensure ResponsiveContainer has parent with height
<div style={{ width: '100%', height: 300 }}>
  <ResponsiveContainer>
    <BarChart data={data}>
      ...
    </BarChart>
  </ResponsiveContainer>
</div>
```

#### 2. API Errors
**Problem**: 500 error from backend
**Solution**:
```javascript
// Check Python service is running
// Verify MongoDB connections
// Check environment variables
console.error('API Error:', error.response?.data);
```

#### 3. Styling Not Applied
**Problem**: CSS not loading
**Solution**:
```javascript
// Ensure CSS import is at top of component
import './ComprehensivePredictionDashboard.css';

// Or in Next.js, use CSS modules
import styles from './Dashboard.module.css';
```

#### 4. Performance Issues
**Problem**: Dashboard slow to load
**Solution**:
```javascript
// Use dynamic imports for large components
const Dashboard = dynamic(() => import('./Dashboard'), {
  loading: () => <Skeleton />,
  ssr: false // Disable server-side rendering for client-only component
});

// Optimize API calls with caching
const [data, setData] = useState(null);
const cacheRef = useRef(new Map());

useEffect(() => {
  if (cacheRef.current.has(patientId)) {
    setData(cacheRef.current.get(patientId));
  } else {
    fetchData().then(data => {
      cacheRef.current.set(patientId, data);
      setData(data);
    });
  }
}, [patientId]);
```

## Monitoring and Logging

### Frontend Logging

```javascript
// Add to components for debugging
const logger = {
  debug: (msg, data) => console.log(`[DEBUG] ${msg}`, data),
  error: (msg, error) => console.error(`[ERROR] ${msg}`, error),
  info: (msg, data) => console.info(`[INFO] ${msg}`, data),
};

// Usage in component
useEffect(() => {
  logger.debug('Dashboard mounted', { patientId });
  
  fetchData()
    .catch(error => logger.error('Failed to fetch data', error));
}, [patientId]);
```

### Backend Monitoring

```javascript
// In diseasePredictionController.js
const auditLog = (action, patientId, status) => {
  console.log(`[${new Date().toISOString()}] ${action} - PatientID: ${patientId} - Status: ${status}`);
  // Could also log to external service like Sentry
};

auditLog('comprehensive-predict', patientId, 'success');
```

## Performance Optimization

### Image Optimization
```javascript
// If using images, optimize them
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Logo"
  width={50}
  height={50}
  priority
/>
```

### Code Splitting
```javascript
// Use React.lazy for code splitting
const ComprehensivePredictionDashboard = React.lazy(() => 
  import('./ComprehensivePredictionDashboard')
);

// In render:
<Suspense fallback={<Loading />}>
  <ComprehensivePredictionDashboard />
</Suspense>
```

### Caching Strategy
```javascript
// In API service
const request = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Cache GET requests
const cache = new Map();

request.interceptors.response.use(
  (response) => {
    if (response.config.method === 'get') {
      cache.set(response.config.url, response);
    }
    return response;
  }
);
```

## Scaling Considerations

### For 1,000+ Patients
1. Implement pagination in doctor dashboard
2. Add lazy loading for patient list
3. Use database indexing for queries
4. Implement caching at API layer
5. Consider vector databases for similarity search

### For Real-Time Updates
1. Implement WebSocket connections
2. Use Server-Sent Events for updates
3. Add real-time notifications
4. Implement refresh intervals (optional)

## Security Considerations

1. **Input Validation**
   - Validate patientId format
   - Sanitize API responses
   - Validate user permissions

2. **Authorization**
   - Check role (patient/doctor)
   - Verify patient ownership
   - Implement RBAC

3. **Data Protection**
   - HTTPS only
   - Secure token storage
   - No sensitive data in logs

## Support and Resources

- **Documentation**: See STYLING_GUIDE.md for styling reference
- **API Reference**: See API_REFERENCE.md for endpoint details
- **Architecture**: See ARCHITECTURE_VISUAL.md for system overview
- **Troubleshooting**: See this document's Troubleshooting section

## Next Steps

1. ✅ Review this integration guide
2. ✅ Set up environment variables
3. ✅ Install dependencies
4. ✅ Test API endpoints
5. ✅ Integrate components into your app
6. ✅ Run tests
7. ✅ Deploy to production
8. ✅ Monitor performance
9. ✅ Collect user feedback
10. ✅ Iterate and improve

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready
