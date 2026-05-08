# AGENTS.md 构建系统

.PHONY: all clean help

# 默认目标：构建 AGENTS.md
all: AGENTS.md

# 从 src/AGENTS.src.md 构建 AGENTS.md
AGENTS.md: src/AGENTS.src.md
	@echo "Building AGENTS.md from src/AGENTS.src.md..."
	@cp src/AGENTS.src.md AGENTS.md
	@echo "Build complete: AGENTS.md"

# 清理生成的文件
clean:
	@echo "Cleaning generated files..."
	@rm -f AGENTS.md
	@echo "Clean complete"

# 显示帮助信息
help:
	@echo "Available targets:"
	@echo "  make        - Build AGENTS.md from src/AGENTS.src.md (default)"
	@echo "  make all    - Same as 'make'"
	@echo "  make clean  - Remove generated AGENTS.md file"
	@echo "  make help   - Show this help message"
