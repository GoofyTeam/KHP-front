# Makefile pour construire et gérer les conteneurs Docker des apps Web et PWA

# Noms des images et versions
WEB_IMAGE_NAME := khp_web
PWA_IMAGE_NAME := khp_pwa
WEB_VERSION    := 0.0.2
PWA_VERSION    := 0.0.2

# Emplacement des Dockerfiles et contexte de build
WEB_DOCKERFILE := apps/web/Dockerfile
PWA_DOCKERFILE := apps/pwa/Dockerfile
CONTEXT        := .

# Cibles factices
.PHONY: all build build-web build-pwa start start-web start-pwa stop stop-web stop-pwa clean build-and-start

# Cible par défaut
all: build-and-start

# Construction des images
build-web:
	@echo "[WEB] Building Docker image..."
	@echo "  Dockerfile: $(WEB_DOCKERFILE)"
	@echo "  Context:    $(CONTEXT)"
	docker build -f $(WEB_DOCKERFILE) -t $(WEB_IMAGE_NAME):$(WEB_VERSION) $(CONTEXT)

build-pwa:
	@echo "[PWA] Building Docker image..."
	@echo "  Dockerfile: $(PWA_DOCKERFILE)"
	@echo "  Context:    $(CONTEXT)"
	docker build -f $(PWA_DOCKERFILE) -t $(PWA_IMAGE_NAME):$(PWA_VERSION) $(CONTEXT)

build: build-web build-pwa

# Démarrage des conteneurs
start-web:
	@echo "[WEB] Removing old Web container if exists..."
	docker rm -f $(WEB_IMAGE_NAME) || true
	@echo "[WEB] Starting container..."
	docker run -d -p 5432:3000 --name $(WEB_IMAGE_NAME) $(WEB_IMAGE_NAME):$(WEB_VERSION)

start-pwa:
	@echo "[PWA] Removing old PWA container if exists..."
	docker rm -f $(PWA_IMAGE_NAME) || true
	@echo "[PWA] Starting container..."
	docker run -d -p 5433:80 --name $(PWA_IMAGE_NAME) $(PWA_IMAGE_NAME):$(PWA_VERSION)

start: start-web start-pwa

# Arrêt des conteneurs
stop-web:
	@echo "[WEB] Stopping container..."
	docker stop $(WEB_IMAGE_NAME) || true

stop-pwa:
	@echo "[PWA] Stopping container..."
	docker stop $(PWA_IMAGE_NAME) || true

stop: stop-web stop-pwa

# Nettoyage complet
clean:
	@echo "Cleaning images and containers..."
	docker rm -f $(WEB_IMAGE_NAME) $(PWA_IMAGE_NAME) 2>/dev/null || true
	docker rmi $(WEB_IMAGE_NAME):$(WEB_VERSION) $(PWA_IMAGE_NAME):$(PWA_VERSION) 2>/dev/null || true

# Construire et démarrer en une seule commande
build-and-start: build start

build-and-start-web: build-web start-web

build-and-start-pwa: build-pwa start-pwa