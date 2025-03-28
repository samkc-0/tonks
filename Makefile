.PHONY: dev frontend backend venv

VENV_DIR := venv
PYTHON := $(VENV_DIR)/bin/python
UVICORN := $(VENV_DIR)/bin/uvicorn

venv:
	@test -d $(VENV_DIR) || python3 -m venv $(VENV_DIR)
	@$(PYTHON) -m pip install --upgrade pip

frontend:
	cd apps/frontend && pnpm dev

backend: venv
	cd apps/backend && ../../$(UVICORN) main:app --reload

dev:
	$(MAKE) frontend & \
	$(MAKE) backend & \
	wait