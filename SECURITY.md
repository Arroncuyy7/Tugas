# Security Audit — Tugas App

## Issues Found & Status

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | 🔴 Critical | Hardcoded Firebase API keys in source code | **Fixed** — config moved to gitignored `firebase-config.js` |
| 2 | 🔴 Critical | XSS via `innerHTML` with unsanitized Firebase data | **Fixed** — replaced with `textContent` + DOM construction |
| 3 | 🟠 High | No authentication — anyone can read/write/delete tasks | **Partially fixed** — added Firebase Anonymous Auth; full auth requires Firebase Security Rules (see below) |
| 4 | 🟠 High | No input validation on task text | **Fixed** — added length limit (200 chars), HTML tag rejection, date format validation |
| 5 | 🟡 Medium | No Content Security Policy | **Fixed** — added CSP `<meta>` tag restricting script/connect sources |
| 6 | 🟡 Medium | Duplicate Firebase config across files | **Fixed** — single config file, single `script.js` loaded by `Index.html` |

## Required: Firebase Security Rules

The current Firebase Realtime Database likely has open rules. Apply these in the
[Firebase Console → Realtime Database → Rules](https://console.firebase.google.com/):

```json
{
  "rules": {
    "tasks": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$taskId": {
        ".validate": "newData.hasChildren(['task', 'deadline'])
                      && newData.child('task').isString()
                      && newData.child('task').val().length > 0
                      && newData.child('task').val().length <= 200
                      && newData.child('deadline').isString()
                      && newData.child('deadline').val().matches(/^\\d{4}-\\d{2}-\\d{2}$/)"
      }
    }
  }
}
```

These rules:
- Require authentication (Anonymous Auth is already wired up in `script.js`)
- Validate that each task has the expected shape and length limits
- Reject malformed data at the database level

## Setup Instructions

1. Copy `firebase-config.example.js` → `firebase-config.js`
2. Fill in your Firebase project credentials
3. Enable **Anonymous Authentication** in Firebase Console → Authentication → Sign-in method
4. Apply the Security Rules above in Firebase Console → Realtime Database → Rules
