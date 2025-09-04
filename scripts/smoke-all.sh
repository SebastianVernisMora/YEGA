#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Running smoke-auth-otp"
bash "$DIR/smoke-auth-otp.sh"

echo "\n==> Running smoke-products"
bash "$DIR/smoke-products.sh"

echo "\n==> Running smoke-orders"
bash "$DIR/smoke-orders.sh"

echo "\nAll smoke tests completed successfully."

