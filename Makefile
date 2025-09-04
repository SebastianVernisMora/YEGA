SHELL := /bin/bash

.PHONY: smoke-products smoke-auth smoke-orders smoke-all smoke-cleanup smoke-run

smoke-products:
	@echo "Running products smoke test..."
	@bash scripts/smoke-products.sh

smoke-auth:
	@echo "Running auth+otp smoke test..."
	@bash scripts/smoke-auth-otp.sh

smoke-orders:
	@echo "Running orders smoke test..."
	@bash scripts/smoke-orders.sh

smoke-all:
	@echo "Running all smoke tests..."
	@bash scripts/smoke-all.sh

smoke-cleanup:
	@echo "Running smoke cleanup (removing @test.local users, OTPs, orders and CLI products)..."
	@cd backend && npm run -s smoke:cleanup

smoke-run:
	@echo "Running full smoke (all + cleanup)..."
	@bash scripts/smoke-all.sh && cd backend && npm run -s smoke:cleanup
