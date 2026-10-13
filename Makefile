.DEFAULT_GOAL := all
.PHONY: all markdown skill check test clean help
all markdown skill check:
	node scripts/build.mjs $@
test:
	npm test
clean:
	rm -rf dist/
help:
	@echo 'Targets: all (default), markdown, skill, check, test, clean, help'
	@echo 'src/chapters.json defines titles and chapter order; only listed inputs are read.'
	@echo 'all: dist/markdown/AGENTS.md + dist/skill/spec4agents/ + SKILL.spec4agents.tgz'
	@echo 'markdown/skill build independently; check validates both without updating outputs.'
	@echo 'Install build dependencies with npm ci. clean removes only dist/.'
