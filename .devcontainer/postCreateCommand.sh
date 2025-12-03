#!/bin/bash
set -e

echo "=== Setting up development environment ==="

# Install curl and openssh-client if not available
echo "Installing required packages..."
apt-get update -qq && apt-get install -y -qq curl openssh-client > /dev/null

# Setup SSH for git operations
echo "Setting up SSH..."
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Copy SSH keys from host mount (mounted read-only at /tmp/host-ssh)
# Keys are copied to ~/.ssh with proper permissions for SSH to use them
if [ -d "/tmp/host-ssh" ]; then
    echo "Copying SSH keys from host..."
    # Copy private keys
    for keyfile in id_ed25519 id_ed25519_personal id_rsa; do
        if [ -f "/tmp/host-ssh/$keyfile" ]; then
            cp "/tmp/host-ssh/$keyfile" ~/.ssh/
            chmod 600 ~/.ssh/$keyfile
        fi
    done
    # Copy public keys
    for pubfile in id_ed25519.pub id_ed25519_personal.pub id_rsa.pub; do
        if [ -f "/tmp/host-ssh/$pubfile" ]; then
            cp "/tmp/host-ssh/$pubfile" ~/.ssh/
            chmod 644 ~/.ssh/$pubfile
        fi
    done
    echo "SSH keys copied from host"
else
    echo "Warning: No SSH keys mounted at /tmp/host-ssh"
fi

# Add GitHub to known hosts to avoid host key verification prompts
ssh-keyscan -t ed25519,rsa github.com >> ~/.ssh/known_hosts 2>/dev/null || true

# Create SSH config for multiple GitHub accounts
# Uses IdentityFile to select the correct key for each account
cat > ~/.ssh/config << 'SSHCONFIG'
# Personal GitHub account (use with: git@github.com-personal:user/repo.git)
Host github.com-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Work GitHub account (default: git@github.com:user/repo.git)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
SSHCONFIG
chmod 600 ~/.ssh/config

echo "SSH configured with keys from host"
echo "  Use 'github.com-personal' for personal repos"
echo "  Use 'github.com' for work repos"

# Git configuration
echo "Configuring git..."
git config --global push.autoSetupRemote true

# Install uv
echo "Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH for this script
export PATH="$HOME/.local/bin:$PATH"

# Ensure uv is available (the install script may need PATH set)
if [ -f "$HOME/.local/bin/uv" ]; then
    chmod +x "$HOME/.local/bin/uv"
fi

# Verify uv installation
uv --version

# Initialize uv project if pyproject.toml doesn't exist
if [ ! -f "pyproject.toml" ]; then
    echo "Initializing new uv project..."
    uv init --name "$(basename "$PWD")"
fi

# Create/sync virtual environment
echo "Creating virtual environment and syncing dependencies..."
uv sync

# Add dev dependencies if not already present
echo "Adding development tools..."
uv add --dev ruff pytest

# Setup bash history directory
mkdir -p /commandhistory
touch /commandhistory/.bash_history

# Add useful aliases to bashrc
cat >> ~/.bashrc << 'EOF'

# uv aliases
alias uvr='uv run'
alias uva='uv add'
alias uvad='uv add --dev'
alias uvs='uv sync'
alias uvl='uv lock'

# Activate venv in new shells
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Git aliases
alias gs='git status'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline -10'

# Django helpers for week1
alias week1='cd week1_overview'
alias runserver='cd week1_overview && uv run python manage.py runserver'
alias migrate='cd week1_overview && uv run python manage.py migrate'
EOF

echo "=== Setup complete! ==="
echo "Available commands:"
echo "  uv add <package>     - Add a dependency"
echo "  uv add --dev <pkg>   - Add a dev dependency"
echo "  uv run <command>     - Run command in venv"
echo "  uv sync              - Sync dependencies from lock file"
echo ""
echo "Aliases: uvr, uva, uvad, uvs, uvl, gs, gc, gp, gl"
echo "Django: week1, runserver, migrate"
echo ""
echo "To run the Week 1 Django app:"
echo "  cd week1_overview && uv run python manage.py runserver"
