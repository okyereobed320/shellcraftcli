#!/bin/bash
# Cloud Shell Dev Environment Bootstrap Script
set -e
echo "🚀 Starting Cloud Shell Bootstrap..."
mkdir -p ~/projects ~/tools ~/scripts
if [[ ":$PATH:" != *":$HOME/tools:"* ]]; then
    echo 'export PATH="$HOME/tools:$PATH"' >> ~/.bashrc
    export PATH="$HOME/tools:$PATH"
fi
TERRAFORM_VERSION="1.10.5"
if [[ ! -f ~/tools/terraform ]]; then
    echo "pkg: Installing Terraform $TERRAFORM_VERSION..."
    curl -sSL https://releases.hashicorp.com/terraform/1.10.5/terraform_1.10.5_linux_amd64.zip -o /tmp/terraform.zip
    unzip -o /tmp/terraform.zip -d ~/tools/
    rm /tmp/terraform.zip
fi
grep -q "alias gs='git status'" ~/.bashrc || cat >> ~/.bashrc << 'AL_EOF'

# --- Custom Dev Aliases ---
alias gs='git status'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline --graph --decorate'
alias gdiff='git diff'
alias tf='terraform'
alias k='kubectl'
alias gprj='gcloud config set project'
alias gacc='gcloud config set account'
alias p='cd ~/projects'
alias t='cd ~/tools'
alias s='cd ~/scripts'
alias ace-status='gcloud alpha billing accounts list && gcloud projects list'
AL_EOF
echo "✅ Bootstrap complete! Run 'source ~/.bashrc' to apply changes."
