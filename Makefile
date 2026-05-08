# AGENTS.md 构建系统

CHAPTER_PATTERN := src/AGENTS.[0-9][0-9]-*.md
CHAPTERS := $(sort $(wildcard $(CHAPTER_PATTERN)))
OUTPUT := AGENTS.md

REQUESTED_GOALS := $(or $(MAKECMDGOALS),all)
ifneq ($(filter-out clean help,$(REQUESTED_GOALS)),)
ifeq ($(strip $(CHAPTERS)),)
$(error No chapter source files found matching $(CHAPTER_PATTERN))
endif
endif

.PHONY: all clean help

# 默认目标：构建 AGENTS.md
all: $(OUTPUT)

# 从章节源文件构建 AGENTS.md
$(OUTPUT): $(CHAPTERS)
	@echo "Building $(OUTPUT) from chapter sources..."
	@cat $(CHAPTERS) > $(OUTPUT)
	@echo "Build complete: $(OUTPUT)"

# 清理生成的文件
clean:
	@echo "Cleaning generated files..."
	@rm -f AGENTS.md
	@echo "Clean complete"

# 显示帮助信息
help:
	@echo "Available targets:"
	@echo "  make        - Build AGENTS.md from chapter sources (default)"
	@echo "  make all    - Same as 'make'"
	@echo "  make clean  - Remove the generated root AGENTS.md file"
	@echo "  make help   - Show this help message"
	@echo ""
	@echo "Chapter source naming:"
	@echo "  src/AGENTS.XX-YYYYYY.md"
	@echo "  XX is a two-digit chapter number used for build order."
