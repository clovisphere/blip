# ---------------------------------------
# 🏴‍☠️ Project: Blip
# ---------------------------------------

PROJECT_NAME := blip
PORT         ?= 3000
BUN_VERSION  ?= 1.2
IMAGE        := $(PROJECT_NAME)

# --------------------------------------------------------------------
# 🛠️ Shell Configuration
# --------------------------------------------------------------------
SHELL       := bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c

# Colors for flair
CLR_TEAL   = \033[0;36m
CLR_YELLOW = \033[0;33m
CLR_GREEN  = \033[0;32m
CLR_RESET  = \033[0m

# --------------------------------------------------------------------
# ⚡ Phony Targets
# --------------------------------------------------------------------
.PHONY: help dev test \
        build run stop logs clean \
        commit \
        c-feat c-fix c-chore c-refactor c-test \
        c-docs c-style c-perf c-ci c-build

# --------------------------------------------------------------------
# 📖 Help
# --------------------------------------------------------------------

## help: 📋 Display this help message
help:
	@printf "$(CLR_TEAL)🏴‍☠️  Blip — Pirate Deduction Game$(CLR_RESET)\n"
	@printf "Usage: make <target>\n\n"
	@printf "Available targets:\n"
	@sed -n 's/^##//p' $(MAKEFILE_LIST) | while IFS=':' read -r target help; do \
		printf "  $(CLR_GREEN)%-18s$(CLR_RESET) %s\n" "$$target" "$$help"; \
	done
	@printf "\n"

# --------------------------------------------------------------------
# 🌊 Development
# --------------------------------------------------------------------

## dev: 🌊 Start the dev server on http://localhost:$(PORT)
dev:
	@printf "$(CLR_TEAL)→ 🌊 Starting dev server at http://localhost:$(PORT)...$(CLR_RESET)\n"
	@bun run dev

## test: 🧪 Run unit tests
test:
	@printf "$(CLR_TEAL)→ 🧪 Running tests...$(CLR_RESET)\n"
	@bun test
	@printf "$(CLR_GREEN)✅ All tests passed!$(CLR_RESET)\n"

# --------------------------------------------------------------------
# 🐳 Docker
# --------------------------------------------------------------------

## build: 🐳 Build the Docker image
build:
	@printf "$(CLR_TEAL)→ 🐳 Building $(IMAGE):latest (Bun $(BUN_VERSION))...$(CLR_RESET)\n"
	@docker build \
		--build-arg BUN_VERSION=$(BUN_VERSION) \
		--build-arg PORT=$(PORT) \
		-t $(IMAGE):latest .
	@printf "$(CLR_GREEN)✅ Image ready: $(IMAGE):latest$(CLR_RESET)\n"

## run: ⚓ Build and run the container (detached)
run: build
	@printf "$(CLR_TEAL)→ ⚓ Launching $(IMAGE) at http://localhost:$(PORT)...$(CLR_RESET)\n"
	@docker run -d -p $(PORT):$(PORT) --name $(PROJECT_NAME) $(IMAGE):latest
	@printf "$(CLR_GREEN)✅ Container running — open http://localhost:$(PORT)$(CLR_RESET)\n"

## stop: 🛑 Stop and remove the container
stop:
	@printf "$(CLR_TEAL)→ 🛑 Stopping $(PROJECT_NAME)...$(CLR_RESET)\n"
	@docker stop $(PROJECT_NAME) && docker rm $(PROJECT_NAME) 2>/dev/null || \
		printf "$(CLR_YELLOW)⚠️  No running container named $(PROJECT_NAME).$(CLR_RESET)\n"
	@printf "$(CLR_GREEN)✅ Stopped.$(CLR_RESET)\n"

## logs: 📋 Tail container logs
logs:
	@printf "$(CLR_TEAL)→ 📋 Tailing logs for $(PROJECT_NAME)...$(CLR_RESET)\n"
	@docker logs -f $(PROJECT_NAME)

## clean: 🧹 Remove the Docker image
clean:
	@printf "$(CLR_TEAL)→ 🧹 Removing image $(IMAGE):latest...$(CLR_RESET)\n"
	@docker rmi $(IMAGE):latest 2>/dev/null || \
		printf "$(CLR_YELLOW)⚠️  Image not found.$(CLR_RESET)\n"
	@printf "$(CLR_GREEN)✨ Clean complete!$(CLR_RESET)\n"

# --------------------------------------------------------------------
# 🌿 Git / Conventional Commits
# --------------------------------------------------------------------

## commit: 💾 Commit all changes (usage: make commit MSG="your message")
commit:
	@if [ -z "$(MSG)" ]; then \
		printf "$(CLR_YELLOW)❌ Error: MSG is required.$(CLR_RESET)\n"; \
		printf "Usage: make commit MSG=\"your message\"\n"; \
		exit 1; \
	fi
	@git add .
	@git commit -m "$(MSG)"
	@printf "$(CLR_GREEN)✅ Committed: $(MSG)$(CLR_RESET)\n"

# Conventional commit shortcuts — usage: make c-feat MSG="add something"
define commit_template
c-$1:
	@$(MAKE) --no-print-directory commit MSG="$(1): $$(MSG)"
endef

$(eval $(call commit_template,feat))
$(eval $(call commit_template,fix))
$(eval $(call commit_template,chore))
$(eval $(call commit_template,refactor))
$(eval $(call commit_template,test))
$(eval $(call commit_template,docs))
$(eval $(call commit_template,style))
$(eval $(call commit_template,perf))
$(eval $(call commit_template,ci))
$(eval $(call commit_template,build))
