#!/usr/bin/env bash
set -euo pipefail

# Smoke test: Productos (login tienda, CRUD básico, listados y stock)

BASE_URL="${BASE:-http://localhost:5000}"
CONTENT_HEADER=("-H" "Content-Type: application/json")

info() { echo -e "\033[1;34m[INFO]\033[0m $*"; }
ok()   { echo -e "\033[1;32m[ OK ]\033[0m $*"; }
err()  { echo -e "\033[1;31m[ERR ]\033[0m $*"; }

# Extract JSON field from STDIN using node (jq-less)
json_get() {
  local field="$1";
  node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(0,'utf8'));process.stdout.write(String(d?.${field}??''))" 2>/dev/null || true
}

# Simple request helper: method, path, [data-json]
req() {
  local method="$1" path="$2" data="${3:-}";
  local tmp_body tmp_code
  tmp_body="$(mktemp)"; tmp_code="$(mktemp)"
  if [[ -n "$data" ]]; then
    curl -sS -X "$method" "$BASE_URL$path" "${CONTENT_HEADER[@]}" -H "Authorization: Bearer ${AUTH_TOKEN:-}" -d "$data" -o "$tmp_body" -w "%{http_code}" > "$tmp_code"
  else
    curl -sS -X "$method" "$BASE_URL$path" "${CONTENT_HEADER[@]}" -H "Authorization: Bearer ${AUTH_TOKEN:-}" -o "$tmp_body" -w "%{http_code}" > "$tmp_code"
  fi
  BODY="$(cat "$tmp_body")"
  CODE="$(cat "$tmp_code")"
  rm -f "$tmp_body" "$tmp_code"
}

info "Base URL: $BASE_URL"

# 1) Health
info "Verificando healthcheck del backend"
req GET "/"
if [[ "$CODE" != "200" ]]; then err "Healthcheck falló (HTTP $CODE)"; exit 1; fi
ok "Healthcheck OK"

# 2) Login tienda (seed)
SHOP_EMAIL="${SHOP_EMAIL:-tienda@yega.local}"
SHOP_PASS="${SHOP_PASS:-tienda123}"
info "Iniciando sesión como tienda seed ($SHOP_EMAIL)"
req POST "/api/auth/login" "{\"email\":\"$SHOP_EMAIL\",\"password\":\"$SHOP_PASS\"}"
if [[ "$CODE" != "200" ]]; then err "Login tienda falló (HTTP $CODE): $BODY"; exit 1; fi
AUTH_TOKEN="$(printf "%s" "$BODY" | json_get token)"
if [[ -z "$AUTH_TOKEN" ]]; then err "No se pudo extraer token de respuesta login"; exit 1; fi
ok "Login tienda OK"

# 3) Crear producto
info "Creando producto demo"
PROD_DATA='{"nombre":"Empanada CLI","descripcion":"Carne","precio":3.5,"stock":100,"categoria":"comida","tags":["demo","cli"]}'
req POST "/api/products" "$PROD_DATA"
if [[ "$CODE" != "201" ]]; then err "Crear producto falló (HTTP $CODE): $BODY"; exit 1; fi
PROD_ID="$(printf "%s" "$BODY" | json_get producto._id)"
if [[ -z "$PROD_ID" ]]; then err "No se pudo extraer producto._id"; exit 1; fi
ok "Producto creado: $PROD_ID"

# 4) Listado público
info "Listando productos públicos"
req GET "/api/products"
if [[ "$CODE" != "200" ]]; then err "Listado productos falló (HTTP $CODE)"; exit 1; fi
ok "Listado público OK"

# 5) Detalle
info "Obteniendo detalle del producto"
req GET "/api/products/$PROD_ID"
if [[ "$CODE" != "200" ]]; then err "Detalle producto falló (HTTP $CODE)"; exit 1; fi
ok "Detalle OK"

# 6) Actualizar
info "Actualizando producto (precio y descripción)"
UPDATE_DATA='{"descripcion":"Carne a cuchillo","precio":3.99,"tags":["demo","cli","mejorado"]}'
req PUT "/api/products/$PROD_ID" "$UPDATE_DATA"
if [[ "$CODE" != "200" ]]; then err "Actualizar producto falló (HTTP $CODE): $BODY"; exit 1; fi
ok "Actualización OK"

# 7) Stock operations
info "Actualizando stock (subtract 5)"
req PATCH "/api/products/$PROD_ID/stock" '{"stock":5,"operacion":"subtract"}'
if [[ "$CODE" != "200" ]]; then err "Stock subtract falló (HTTP $CODE): $BODY"; exit 1; fi
ok "Stock subtract OK"

info "Actualizando stock (add 10)"
req PATCH "/api/products/$PROD_ID/stock" '{"stock":10,"operacion":"add"}'
if [[ "$CODE" != "200" ]]; then err "Stock add falló (HTTP $CODE): $BODY"; exit 1; fi
ok "Stock add OK"

info "Seteando stock a 50"
req PATCH "/api/products/$PROD_ID/stock" '{"stock":50,"operacion":"set"}'
if [[ "$CODE" != "200" ]]; then err "Stock set falló (HTTP $CODE): $BODY"; exit 1; fi
ok "Stock set OK"

# 8) Categorías
info "Obteniendo categorías"
req GET "/api/products/categories"
if [[ "$CODE" != "200" ]]; then err "Categorías falló (HTTP $CODE)"; exit 1; fi
ok "Categorías OK"

# 9) Eliminar
info "Eliminando producto $PROD_ID"
req DELETE "/api/products/$PROD_ID"
if [[ "$CODE" != "200" ]]; then err "Eliminar producto falló (HTTP $CODE): $BODY"; exit 1; fi
ok "Producto eliminado"

ok "Smoke de productos completado con éxito"

