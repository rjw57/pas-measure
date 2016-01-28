SRCDIR:=app
BUILDDIR:=build

STATICFILES:= \
	index.html \
	ol.css ol.js

NPM?=$(shell which npm)
ifeq ($(NPM),)
$(error "npm not found on PATH. Specify NPM variable manually.")
endif

NODEMODULES:=node_modules
NPMBIN=$(shell npm bin)
WEBPACK=$(NPMBIN)/webpack

all: copy pack

copy: $(addprefix $(BUILDDIR)/,$(STATICFILES))

pack:
	"$(WEBPACK)"

$(BUILDDIR):
	mkdir -p "$(BUILDDIR)"

$(BUILDDIR)/%: $(SRCDIR)/% $(BUILDDIR)
	cp "$<" "$@"

clean:
	rm -rf "$(BUILDDIR)" "$(NODEMODULES)"

.PHONY: all copy pack clean
