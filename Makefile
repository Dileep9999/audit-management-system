# Makefile

# Set environment variables file
ENV_FILE=.env
VENV_DIR=venv
PYTHON=$(VENV_DIR)/bin/python
PIP=$(VENV_DIR)/bin/pip
MANAGE=$(PYTHON) manage.py

.PHONY: help hello run venv migrate messages compilemessages clean-translations run_ui build_ui pip_freeze shell dump_data restore_data install create-superuser collectstatic

# Default target
help:
	@echo "Available commands:"
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

hello: ## Print hello message
	@echo "Hello, $(USER)!"

run: ## Run server
	$(MANAGE) runserver

venv: ## Create virtual environment and install requirements
	python3 -m venv $(VENV_DIR)
	. $(VENV_DIR)/bin/activate && $(PIP) install --upgrade pip
	. $(VENV_DIR)/bin/activate && $(PIP) install -r requirements.txt

migrate: ## Make migrations
	$(PYTHON) manage.py makemigrations
	$(PYTHON) manage.py migrate

messages: ## Make messages
	django-admin makemessages --all --ignore=venv --extension html,py
	python manage.py compilemessages --ignore venv

compilemessages: ## Compile messages
	django-admin compilemessages --ignore=venv

clean-translations: ## Delete all compiled translation files (.mo)
	find . -name "*.mo" -delete
	@echo "Deleted all compiled translation files (.mo)"

run_ui: ## Run UI
	cd ui && npm start

build_ui: ## Build UI
	cd ui && npm run build && cd ..

pip_freeze: ## Freeze pip requirements
	$(PIP) freeze > requirements.txt

shell: ## Run shell
	$(PYTHON) manage.py shell

dump_data: ## Save entire database into a json file for backup/portability
	$(MANAGE) dumpdata --exclude auth.permission --exclude contenttypes > db.json

restore_data: ## Restore db data from db.json
	$(MANAGE) loaddata db.json

install: ## Install pip requirements
	pip install -r requirements.txt

create-superuser: ## Create a superuser
	$(MANAGE) createsuperuser

collectstatic: ## Collect static files
	$(MANAGE) collectstatic

