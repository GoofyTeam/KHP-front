#!/usr/bin/env bash

# Récupère le chemin du fichier de commit
MSG_PATH="$1"

# Vérifie qu'un argument a été passé
if [ -z "$MSG_PATH" ]; then
  echo "Chemin du fichier de commit non spécifié" >&2
  exit 1
fi

# Lit le message (suppression éventuelle du saut de ligne final)
message=$(tr -d '\n' < "$MSG_PATH")

# Regex pour valider le format :
# [KHP-<num>] <type>[ (scope)]: description
commit_regex='^\[KHP-[0-9]+\] (feat|fix|chore|ci)(\((web|pwa|global|config)\))?: .+$'

# Test du format
if [[ "$message" =~ $commit_regex ]]; then
  exit 0
else
  cat << 'EOF' >&2
❌ Mauvais format de commit.

Exemple attendu :
[KHP-123] feat(front): short description
EOF
  exit 1
fi
