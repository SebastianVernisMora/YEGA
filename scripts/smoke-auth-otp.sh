#!/usr/bin/env bash
set -euo pipefail

# Smoke test: Registro + (OTP si aplica) + Login + Perfil

BASE_URL="${BASE:-http://localhost:5000}"
CONTENT_HEADER=("-H" "Content-Type: application/json")
MURI="${MONGODB_URI:-}"
DB_NAME="${DB_NAME:-yega_db}"

info() { echo -e "\033[1;34m[INFO]\033[0m $*"; }
ok()   { echo -e "\033[1;32m[ OK ]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERR ]\033[0m $*"; }

json_get() {
  local field="$1";
  node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(String(d?.${field}??''))" 2>/dev/null || true
}

req() {
  local method="$1" path="$2" data="${3:-}" token="${4:-}";
  local tmp_body tmp_code
  tmp_body="$(mktemp)"; tmp_code="$(mktemp)"
  local auth=()
  if [[ -n "$token" ]]; then auth=("-H" "Authorization: Bearer $token"); fi
  if [[ -n "$data" ]]; then
    curl -sS -X "$method" "$BASE_URL$path" "${CONTENT_HEADER[@]}" "${auth[@]}" -d "$data" -o "$tmp_body" -w "%{http_code}" > "$tmp_code"
  else
    curl -sS -X "$method" "$BASE_URL$path" "${CONTENT_HEADER[@]}" "${auth[@]}" -o "$tmp_body" -w "%{http_code}" > "$tmp_code"
  fi
  BODY="$(cat "$tmp_body")"; CODE="$(cat "$tmp_code")"
  rm -f "$tmp_body" "$tmp_code"
}

info "Base URL: $BASE_URL"

# 1) Healthcheck
info "Verificando healthcheck"
req GET "/"
if [[ "$CODE" != "200" ]]; then err "Healthcheck falló (HTTP $CODE)"; exit 1; fi
ok "Healthcheck OK"

# 2) Registrar cliente (auto-login sin OTP)
TS=$(date +%s)
CLIENT_EMAIL="cli_${TS}@test.local"
CLIENT_PHONE="+54911$((RANDOM%9000000+1000000))$((RANDOM%90+10))"
CLIENT_PASS="secret123"
info "Registrando cliente $CLIENT_EMAIL ($CLIENT_PHONE)"
DATA_REG=$(printf '{"nombre":"Cliente CLI","telefono":"%s","email":"%s","password":"%s","rol":"cliente"}' "$CLIENT_PHONE" "$CLIENT_EMAIL" "$CLIENT_PASS")
req POST "/api/auth/register" "$DATA_REG"
if [[ "$CODE" != "201" ]]; then err "Registro falló (HTTP $CODE): $BODY"; exit 1; fi
REQ_OTP="$(printf "%s" "$BODY" | json_get requiere_otp)"
TOKEN_REG="$(printf "%s" "$BODY" | json_get token)"

if [[ "$REQ_OTP" == "true" ]]; then
  ok "Registro OK y requiere OTP"

  # 3) Obtener OTP (intentar via mongosh si MONGODB_URI está disponible)
  OTP_CODE=""
  if command -v mongosh >/dev/null 2>&1 && [[ -n "$MURI" ]]; then
    info "Buscando OTP en Mongo ($DB_NAME.otps)"
    OTP_CODE=$(mongosh "$MURI" --quiet --eval 'db.getSiblingDB("'"$DB_NAME"'"); var r=db.otps.find({telefono:"'"$CLIENT_PHONE"'"}).sort({createdAt:-1}).limit(1).toArray(); if(r.length){print(r[0].codigo)}else{print("")}' || true)
  fi

  if [[ -z "$OTP_CODE" ]]; then
    info "No se pudo leer OTP automáticamente. Solicita el OTP del log del backend."
    read -r -p "Ingrese OTP para $CLIENT_PHONE ($CLIENT_EMAIL): " OTP_CODE || true
  fi
  if [[ -z "$OTP_CODE" ]]; then err "OTP vacío"; exit 1; fi
  ok "OTP obtenido"

  # 4) Verificar OTP
  DATA_VERIFY=$(printf '{"email":"%s","otp":"%s","telefono":"%s","tipo":"registro"}' "$CLIENT_EMAIL" "$OTP_CODE" "$CLIENT_PHONE")
  req POST "/api/auth/verify-otp" "$DATA_VERIFY"
  if [[ "$CODE" != "200" ]]; then err "Verificación OTP falló (HTTP $CODE): $BODY"; exit 1; fi
  CTOKEN="$(printf "%s" "$BODY" | json_get token)"
  if [[ -z "$CTOKEN" ]]; then err "No se recibió token tras verificación"; exit 1; fi
  ok "Verificación OK y sesión iniciada"

else
  # Registro de cliente sin OTP: debe venir token
  if [[ -z "$TOKEN_REG" ]]; then err "Registro sin OTP pero no se recibió token"; exit 1; fi
  CTOKEN="$TOKEN_REG"
  ok "Registro OK sin OTP (auto-login)"
fi

# 5) Login (debe funcionar en ambos casos)
DATA_LOGIN=$(printf '{"email":"%s","password":"%s"}' "$CLIENT_EMAIL" "$CLIENT_PASS")
req POST "/api/auth/login" "$DATA_LOGIN"
if [[ "$CODE" != "200" ]]; then err "Login falló (HTTP $CODE): $BODY"; exit 1; fi
ok "Login OK"

# 6) Perfil
LTOKEN="$(printf "%s" "$BODY" | json_get token)"
req GET "/api/auth/profile" "" "$LTOKEN"
if [[ "$CODE" != "200" ]]; then err "Perfil falló (HTTP $CODE): $BODY"; exit 1; fi
ok "Perfil OK"

ok "Smoke Auth completado"
