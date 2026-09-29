#!/usr/bin/env bash

set -u

MAX_ITERATIONS=10

for ((i=1; i<=MAX_ITERATIONS; i++)); do

    echo "================================="
    echo "LOOP ITERATION $i / $MAX_ITERATIONS"
    echo "================================="

    if grep -q "status: DONE" .loop/STATE.md; then
        echo "Projeto concluído."
        exit 0
    fi

    if grep -q "status: BLOCKED" .loop/STATE.md; then
        echo "Loop bloqueado. Intervenção humana necessária."
        exit 2
    fi

    opencode run \
      --agent loop-worker \
      "Execute UMA iteração. Leia GOAL e STATE. Se houver VERIFICATION: FAIL, corrija o feedback antes de selecionar outra tarefa."

    opencode run \
      --agent loop-reviewer \
      "Faça verificação independente da tarefa atual. Atualize STATE.md com VERIFICATION: PASS ou FAIL."

done

echo "Budget do loop esgotado."
exit 1
