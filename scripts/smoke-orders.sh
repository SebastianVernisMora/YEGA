#!/usr/bin/env bash
set -euo pipefail

# Smoke test: Pedidos (cliente crea, tienda avanza estados)

BASE_URL="${BASE:-http://localhost:5000}"
CONTENT_HEADER=("-H" "Content-Type: application/json")
MURI="${MONGODB_URI:-}"
DB_NAME="${DB_NAME:-yega_db}"

info() { echo -e "\033[1;34m[INFO]\033[0m $*"; }
ok()   { echo -e "\033[1;32m[ OK ]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERR ]\033[0m $*"; }

json_get() { local field="$1"; node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(String(d?.${field}??''))" 2>/dev/null || true; }

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
  BODY="$(cat "$tmp_body")"; CODE="$(cat "$tmp_code)"; rm -f "$tmp_body" "$tmp_code"
}

info "Base URL: $BASE_URL"

# 1) Login tienda seed
SHOP_EMAIL="${SHOP_EMAIL:-tienda@yega.local}"
SHOP_PASS="${SHOP_PASS:-tienda123}"
info "Login tienda seed ($SHOP_EMAIL)"
req POST "/api/auth/login" "{\"email\":\"$SHOP_EMAIL\",\"password\":\"$SHOP_PASS\"}"
if [[ "$CODE" != "200" ]]; then err "Login tienda falló: $BODY"; exit 1; fi
STOKEN="$(printf "%s" "$BODY" | json_get token)"

# 2) Crear producto
info "Creando producto para el pedido"
req POST "/api/products" '{"nombre":"Pizza CLI","descripcion":"Muzza","precio":12.5,"stock":25,"categoria":"comida"}' "$STOKEN"
if [[ "$CODE" != "201" ]]; then err "Crear producto falló: $BODY"; exit 1; fi
PID="$(printf "%s" "$BODY" | json_get producto._id)"
ok "Producto creado: $PID"

# 3) Registrar + verificar cliente (si no existe)
TS=$(date +%s)
CMAIL="cli_order_${TS}@test.local"
CTEL="+54911$((RANDOM%9000000+1000000))$((RANDOM%90+10))"
CPASS="secret123"
info "Registrando cliente $CMAIL ($CTEL)"
req POST "/api/auth/register" "{\"nombre\":\"Cliente Pedido\",\"telefono\":\"$CTEL\",\"email\":\"$CMAIL\",\"password\":\"$CPASS\",\"rol\":\"cliente\"}"
if [[ "$CODE" != "201" ]]; then err "Registro cliente falló: $BODY"; exit 1; fi

OTP=""
if command -v mongosh >/dev/null 2>&1 && [[ -n "$MURI" ]]; then
  info "Buscando OTP en Mongo ($DB_NAME.otps)"
  OTP=$(mongosh "$MURI" --quiet --eval 'db.getSiblingDB("'"$DB_NAME"'"); var r=db.otps.find({telefono:"'"$CTEL"'"}).sort({createdAt:-1}).limit(1).toArray(); if(r.length){print(r[0].codigo)}else{print("")}' || true)
fi
if [[ -z "$OTP" ]]; then
  info "Ingrese OTP mostrado en logs del backend"
  read -r -p "OTP para $CTEL ($CMAIL): " OTP || true
fi
if [[ -z "$OTP" ]]; then err "OTP vacío"; exit 1; fi

req POST "/api/auth/verify-otp" "{\"email\":\"$CMAIL\",\"otp\":\"$OTP\",\"telefono\":\"$CTEL\",\"tipo\":\"registro\"}"
if [[ "$CODE" != "200" ]]; then err "Verificar OTP falló: $BODY"; exit 1; fi
CTOKEN="$(printf "%s" "$BODY" | json_get token)"
ok "Cliente verificado"

# 4) Crear pedido
info "Creando pedido del cliente"
req POST "/api/orders" "{\"productos\":[{\"producto\":\"$PID\",\"cantidad\":2}],\"direccion_envio\":{\"calle\":\"Falsa\",\"numero\":\"123\",\"ciudad\":\"Test\"},\"metodo_pago\":\"efectivo\"}" "$CTOKEN"
if [[ "$CODE" != "201" ]]; then err "Crear pedido falló: $BODY"; exit 1; fi
OID="$(printf "%s" "$BODY" | json_get pedido._id)"
ok "Pedido creado: $OID"

# 5) Avanzar estados (tienda)
info "Confirmando pedido"
req PUT "/api/orders/$OID/status" '{"estado":"confirmado"}' "$STOKEN"
if [[ "$CODE" != "200" ]]; then err "Confirmar falló: $BODY"; exit 1; fi

info "Preparando pedido"
req PUT "/api/orders/$OID/status" '{"estado":"preparando"}' "$STOKEN"
if [[ "$CODE" != "200" ]]; then err "Preparando falló: $BODY"; exit 1; fi

info "Listo para envío"
req PUT "/api/orders/$OID/status" '{"estado":"listo"}' "$STOKEN"
if [[ "$CODE" != "200" ]]; then err "Listo falló: $BODY"; exit 1; fi

# 6) Limpieza: eliminar producto creado
info "Eliminando producto $PID"
req DELETE "/api/products/$PID" "" "$STOKEN"
if [[ "$CODE" != "200" ]]; then err "Eliminar producto falló: $BODY"; exit 1; fi
ok "Producto eliminado"

ok "Smoke de pedidos completado"

