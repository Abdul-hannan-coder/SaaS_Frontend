# Session Security Flow Diagrams

## 1. Normal Login Flow (No Conflict)

```
┌─────────────────────────────────────────────────────────────┐
│                     USER OPENS APP                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                Check localStorage for:                      │
│                • auth_token                                 │
│                • user_data                                  │
│                • session_id                                 │
│                • active_user_id                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                   ┌────────┴────────┐
                   │                 │
             NO ◄──┤  All present?   ├──► YES
                   │                 │
                   └────────┬────────┘
                            │
                            ↓
            ┌───────────────────────────────┐
            │   Redirect to Login Page      │
            └───────────────────────────────┘
                            │
                            ↓
            ┌───────────────────────────────┐
            │   User enters credentials     │
            └───────────────────────────────┘
                            │
                            ↓
            ┌───────────────────────────────┐
            │   Generate new session ID     │
            │   session_<timestamp>_<rand>  │
            └───────────────────────────────┘
                            │
                            ↓
            ┌───────────────────────────────┐
            │   Save to localStorage:       │
            │   • auth_token                │
            │   • user_data                 │
            │   • session_id                │
            │   • active_user_id            │
            └───────────────────────────────┘
                            │
                            ↓
            ┌───────────────────────────────┐
            │   Redirect to Dashboard       │
            └───────────────────────────────┘
                            │
                            ↓
            ┌───────────────────────────────┐
            │   SessionMonitor starts       │
            │   (checks every 5 seconds)    │
            └───────────────────────────────┘
```

## 2. Login with Different Account (Same Tab)

```
┌─────────────────────────────────────────────────────────────┐
│             USER ALREADY LOGGED IN (user1@ex.com)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              User navigates to Login Page                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         User enters credentials for user2@ex.com            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         System checks localStorage.user_data                │
│         Detects: user1@ex.com !== user2@ex.com             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│      ⚠️  SHOW WARNING DIALOG                                │
│                                                             │
│  "You are currently logged in as user1@ex.com"             │
│  "You are attempting to login as user2@ex.com"             │
│  "This will terminate your current session"                 │
│                                                             │
│      [Cancel]  [Yes, Switch Account]                        │
└─────────────────────────────────────────────────────────────┘
         │                                      │
         │ User clicks                          │ User clicks
         │ "Cancel"                             │ "Yes, Switch"
         ↓                                      ↓
┌──────────────────┐              ┌──────────────────────────┐
│ Login cancelled  │              │ Clear old session:       │
│ Remain as user1  │              │ • Remove session_id      │
└──────────────────┘              │ • Remove active_user_id  │
                                  │ • Remove auth_token      │
                                  │ • Remove user_data       │
                                  └──────────┬───────────────┘
                                             ↓
                                  ┌──────────────────────────┐
                                  │ Generate NEW session ID  │
                                  │ for user2@ex.com         │
                                  └──────────┬───────────────┘
                                             ↓
                                  ┌──────────────────────────┐
                                  │ Save user2 data          │
                                  │ Login successful         │
                                  └──────────────────────────┘
```

## 3. Multi-Tab Conflict Detection

```
TAB 1                                    TAB 2
──────────────────────────────────────────────────────────────

┌──────────────────┐                 ┌──────────────────┐
│  User logged in  │                 │   Opens new tab  │
│  user1@ex.com    │                 │                  │
└────────┬─────────┘                 └────────┬─────────┘
         │                                    │
         │                                    ↓
         │                         ┌──────────────────────┐
         │                         │ Goes to Login Page   │
         │                         └──────────┬───────────┘
         │                                    │
         │                                    ↓
         │                         ┌──────────────────────┐
         │                         │ Enters credentials   │
         │                         │ user2@ex.com         │
         │                         └──────────┬───────────┘
         │                                    │
         │                                    ↓
         │                         ┌──────────────────────┐
         │                         │ Sees warning dialog  │
         │                         │ Confirms switch      │
         │                         └──────────┬───────────┘
         │                                    │
         │                                    ↓
         │                         ┌──────────────────────┐
         │                         │ localStorage.setItem │
         │                         │ • session_id (new)   │
         │                         │ • active_user_id=2   │
         │                         │ • user_data (user2)  │
         │                         └──────────┬───────────┘
         │                                    │
         │  ◄──────────────────────────────────
         │  storage event fired
         │
         ↓
┌──────────────────────────────┐
│ 📢 Storage listener detects │
│    session_id changed        │
│    active_user_id changed    │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Validate current session:    │
│ • localStorage.active_user_  │
│   id = "2"                   │
│ • Current user id = "1"      │
│ • MISMATCH! ❌               │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ 🔔 Show Toast Notification   │
│ "Session Conflict Detected"  │
│ "Another account logged in"  │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Wait 1.5 seconds             │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Force logout:                │
│ • Clear all localStorage     │
│ • Redirect to login page     │
└──────────────────────────────┘
```

## 4. Session Monitor Periodic Check

```
┌─────────────────────────────────────────────────────────────┐
│                   Dashboard Loaded                          │
│                   SessionMonitor starts                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                 ┌──────────────────┐
                 │  setInterval     │
                 │  (every 5 sec)   │
                 └────────┬─────────┘
                          │
                          ↓
        ┌─────────────────────────────────────┐
        │      Call validateSession()         │
        │                                     │
        │  Check:                             │
        │  1. auth_token exists? ────────► NO ─┐
        │  2. user_data exists? ─────────► NO ─┤
        │  3. session_id exists? ────────► NO ─┤
        │  4. active_user_id exists? ────► NO ─┤
        │  5. active_user_id matches          │
        │     current user.id? ──────────► NO ─┤
        │                                     │
        └───────────┬─────────────────────────┘
                    │ All YES                 │ Any NO
                    ↓                         ↓
        ┌───────────────────┐    ┌────────────────────┐
        │ Session VALID ✅  │    │ Session INVALID ❌  │
        │ Continue          │    └──────────┬─────────┘
        └───────────────────┘               │
                    │                       ↓
                    │          ┌────────────────────────┐
                    │          │ Show error toast       │
                    │          │ "Session Expired"      │
                    │          └──────────┬─────────────┘
                    │                     │
                    │                     ↓
                    │          ┌────────────────────────┐
                    │          │ Force logout           │
                    │          │ Redirect to login      │
                    │          └────────────────────────┘
                    │
                    ↓
        ┌───────────────────┐
        │ Wait 5 seconds    │
        └─────────┬─────────┘
                  │
                  └──────► Loop back to start
```

## 5. Session Data Structure

```
localStorage
├── auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
├── user_data: {
│     "id": "123",
│     "email": "user@example.com",
│     "username": "user",
│     "full_name": "User Name",
│     "is_active": true,
│     "created_at": "2024-01-01T00:00:00Z",
│     "updated_at": "2024-01-01T00:00:00Z"
│   }
├── session_id: "session_1728400000000_abc123xyz"
└── active_user_id: "123"

             ↓
    Session Validation Logic
             ↓
    
    ✅ VALID if:
       • All 4 keys exist
       • user_data.id === active_user_id
    
    ❌ INVALID if:
       • Any key missing
       • user_data.id !== active_user_id
       • user_data is not valid JSON
```

## 6. Key Security Checkpoints

```
┌─────────────────────────────────────────────────────────────┐
│                   Security Checkpoints                      │
└─────────────────────────────────────────────────────────────┘

Checkpoint 1: App Initialization
├── When: User opens app or refreshes page
├── What: Validate session on useAuth initialization
└── Action: If invalid, force logout immediately

Checkpoint 2: Login Attempt
├── When: User submits login form
├── What: Check if different user already logged in
└── Action: Show warning dialog, require confirmation

Checkpoint 3: URL-Based Auth
├── When: Auth token arrives via URL params
├── What: Check for existing session conflict
└── Action: Clear old session, create new one

Checkpoint 4: Google OAuth
├── When: Google auth callback completes
├── What: Check for existing session conflict
└── Action: Clear old session, create new one

Checkpoint 5: Periodic Monitoring
├── When: Every 5 seconds while app is open
├── What: Validate session data integrity
└── Action: Force logout if validation fails

Checkpoint 6: Cross-Tab Detection
├── When: localStorage changes in another tab
├── What: Validate if change affects current session
└── Action: Show notification, force logout after delay

Checkpoint 7: Manual Logout
├── When: User clicks logout button
├── What: Clear ALL session and auth data
└── Action: Redirect to login page
```

## Legend

```
┌─────────────────────────────────────────┐
│ Symbol Reference                        │
├─────────────────────────────────────────┤
│ ✅ = Valid/Success                      │
│ ❌ = Invalid/Failure                    │
│ ⚠️  = Warning/Caution                   │
│ 🔔 = Notification                       │
│ 📢 = Event/Signal                       │
│ 🔒 = Security Action                    │
│ ◄─ = Data Flow Direction               │
│ ↓  = Sequential Step                    │
│ └─ = Branch/Decision                    │
└─────────────────────────────────────────┘
```
