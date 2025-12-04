# 🔧 Amazon Clone Troubleshooting Guide

## Current Status Check

### ✅ What's Working:
- Backend server is running on port 5001 ✓
- Startup scripts created successfully ✓
- Project structure is correct ✓

### ❓ What to Check:
- Frontend server status
- Browser access to websites
- API connectivity between frontend and backend

---

## Step-by-Step Debugging

### Step 1: Verify Both Servers Are Running

#### Check Backend (should be running):
```bash
# In any terminal/command prompt:
curl http://localhost:5001/api/status
# OR visit in browser: http://localhost:5001/api/status
```

**Expected Response**: JSON with status information

#### Check Frontend:
```bash
# In any terminal/command prompt:
netstat -ano | findstr :5173
```

**Expected Result**: Should show a listening port

### Step 2: Manual Frontend Startup (if needed)

1. **Open Command Prompt/PowerShell as Administrator**
2. **Navigate to Frontend**:
   ```bash
   cd "C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-frontend"
   ```
3. **Verify you're in the right directory**:
   ```bash
   dir package.json
   # Should show package.json file exists
   ```
4. **Start Frontend**:
   ```bash
   npm run dev
   ```

**Look for Output Like**:
```
  VITE v4.4.5  ready in 1045 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 3: Test URLs in Browser

#### Test Backend API:
1. Open browser
2. Go to: `http://localhost:5001/api/status`
3. **Expected**: JSON response with project status

#### Test Frontend App:
1. Open browser
2. Go to: `http://localhost:5173`
3. **Expected**: Amazon Clone React application

### Step 4: Common Issues & Solutions

#### Issue A: "This site can't be reached"
**Possible Causes**:
- Server not running
- Wrong port number
- Firewall blocking access

**Solutions**:
1. Check if server is running: `netstat -ano | findstr :5173`
2. Try different port numbers (5174, 5175, etc.)
3. Check Windows Firewall settings
4. Try: `http://127.0.0.1:5173` instead of `localhost`

#### Issue B: Frontend Shows Blank Page
**Possible Causes**:
- JavaScript errors
- Missing dependencies
- Build issues

**Solutions**:
1. Open browser Developer Tools (F12)
2. Check Console tab for error messages
3. Reinstall frontend dependencies:
   ```bash
   cd amazon-frontend
   rm -rf node_modules
   rm package-lock.json
   npm install
   npm run dev
   ```

#### Issue C: Frontend Can't Connect to Backend
**Symptoms**: Frontend loads but shows "Network Error" or no data

**Solutions**:
1. Verify backend is running: `http://localhost:5001/health`
2. Check CORS settings in backend
3. Verify API base URL in frontend code

#### Issue D: Port Already in Use
**Error**: `EADDRINUSE: address already in use`

**Solutions**:
1. **Find process using port**:
   ```bash
   netstat -ano | findstr :5173
   ```
2. **Kill the process**:
   ```bash
   taskkill /PID <process_id> /F
   ```
3. **Or use different port**: Vite will auto-select next available port

---

## Alternative Testing Methods

### Method 1: Use Static HTML Version
If React frontend has issues, test with static HTML:
1. Navigate to: `amazon_react/amazon/`
2. Open `amazon.html` in browser
3. This tests basic HTML/CSS/JS functionality

### Method 2: Backend-Only Testing
Test backend API independently:
1. Use Postman or browser to test endpoints
2. Key URLs to test:
   - `GET http://localhost:5001/health`
   - `GET http://localhost:5001/api/status`
   - `GET http://localhost:5001/`

### Method 3: Frontend-Only Testing
Test frontend without backend:
1. Modify frontend to use mock data
2. Check if React app renders correctly
3. Isolate frontend issues from backend issues

---

## Emergency Manual Setup

If automated scripts fail, here's the manual process:

### Terminal 1 - Backend:
```bash
cd "C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-backend"
npm run dev
```
**Wait for**: "Server running on port 5001"

### Terminal 2 - Frontend:
```bash
cd "C:\Users\GAURAB\OneDrive\Desktop\code\webDproject\amazon_react\amazon-frontend"  
npm run dev
```
**Wait for**: "Local: http://localhost:5173/"

### Browser:
Go to: `http://localhost:5173`

---

## Success Indicators

### ✅ Everything Working Correctly:
- Backend terminal shows: "Server running on port 5001"
- Frontend terminal shows: "Local: http://localhost:5173/"
- Browser at `http://localhost:5173` shows Amazon Clone interface
- Browser at `http://localhost:5001/api/status` shows JSON response

### 🔍 Debug Information to Collect:
1. **Screenshot of both terminal windows**
2. **Browser error messages (F12 → Console)**
3. **Network requests in browser (F12 → Network)**
4. **Exact error messages from terminals**

---

## Contact Points for Issues

1. **Server won't start**: Check port conflicts, dependencies
2. **Blank page**: Check browser console, JavaScript errors  
3. **Can't reach server**: Check firewall, try 127.0.0.1 instead of localhost
4. **Data not loading**: Check backend connection, CORS settings

Remember: Both servers MUST be running simultaneously for the full application to work!