# 🔑 Secure Key Generation Guide

This project includes a helper script, **`generate_keys_safe.py`**, that securely generates and manages application keys (`SECRET_KEY` and `JWT_KEY`).

---

## 📌 Why Do We Need This?

- **`SECRET_KEY`**: Used by Flask for session security, CSRF protection, etc.  
- **`JWT_KEY`**: Used for signing and verifying JWT authentication tokens.  

Instead of hardcoding these values, we generate them securely using Python’s `secrets` module.

---

## ⚙️ How It Works

The script:

- Always refreshes **`.env.development`** with new keys (safe for local testing).  
- Creates **`.env.production`** only if it does **not** exist (to avoid overwriting live secrets).  
- Ensures strong, random 64-character hex values for each key.  

---

## 🚀 Usage

Run the script from the project root:

```bash
pipenv run python generate_keys_safe.py
