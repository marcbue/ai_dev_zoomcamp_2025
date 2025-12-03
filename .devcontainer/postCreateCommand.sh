#!/bin/bash
set -e

echo "=== Setting up development environment ==="

# Install curl if not available
if ! command -v curl &> /dev/null; then
    echo "Installing curl..."
    apt-get update -qq && apt-get install -y -qq curl > /dev/null
fi

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
EOF

echo "=== Setup complete! ==="
echo "Available commands:"
echo "  uv add <package>     - Add a dependency"
echo "  uv add --dev <pkg>   - Add a dev dependency"
echo "  uv run <command>     - Run command in venv"
echo "  uv sync              - Sync dependencies from lock file"
echo ""
echo "Aliases: uvr, uva, uvad, uvs, uvl, gs, gc, gp, gl"

