BUILDDIR:=build

NPM?=$(shell which npm)
ifeq ($(NPM),)
$(error "npm not found on PATH. Specify NPM variable manually.")
endif

NPMBIN=$(shell npm bin)
WEBPACK=$(NPMBIN)/webpack

all: pack

watch:
	"$(WEBPACK)" --watch

pack:
	"$(WEBPACK)"

clean:
	rm -rf "$(BUILDDIR)"

.PHONY: all pack clean watch
