import os
import secrets


def generate_key():
    """Generate a secure random 64-char hex key."""
    return secrets.token_hex(32)


def update_env_file(env_path, overwrite=False):
    """Update or create an .env file safely."""
    env_lines = []

    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            env_lines = f.readlines()

    def set_or_update_key(lines, key_name, value):
        key_found = False
        for i, line in enumerate(lines):
            if line.startswith(key_name + "="):
                if overwrite:
                    lines[i] = f'{key_name}="{value}"\n'
                key_found = True
                break
        if not key_found:
            lines.append(f'{key_name}="{value}"\n')
        return lines

    # Always generate fresh keys
    secret_key = generate_key()
    jwt_key = generate_key()

    env_lines = set_or_update_key(env_lines, "SECRET_KEY", secret_key)
    env_lines = set_or_update_key(env_lines, "JWT_KEY", jwt_key)

    with open(env_path, "w") as f:
        f.writelines(env_lines)

    print(f"{env_path} updated with secure SECRET_KEY and JWT_KEY")


if __name__ == "__main__":
    # Generate for development
    update_env_file(".env.development", overwrite=True)

    # Generate for production (safe: only if file doesn’t exist yet)
    if not os.path.exists(".env.production"):
        update_env_file(".env.production", overwrite=False)
    else:
        print("⚠️ .env.production already exists. Not overwriting!")
