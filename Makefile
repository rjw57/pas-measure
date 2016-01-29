SRCDIR:=app
BUILDDIR:=build

STATICFILES:= \
	index.html \
	ol.css ol.js

NPM?=$(shell which npm)
ifeq ($(NPM),)
$(error "npm not found on PATH. Specify NPM variable manually.")
endif

NPMBIN=$(shell npm bin)
WEBPACK=$(NPMBIN)/webpack

all: copy pack

watch: copy
	"$(WEBPACK)" --watch

copy: $(addprefix $(BUILDDIR)/,$(STATICFILES))

pack:
	"$(WEBPACK)"

$(BUILDDIR):
	mkdir -p "$(BUILDDIR)"

$(BUILDDIR)/%: $(SRCDIR)/% $(BUILDDIR)
	cp "$<" "$@"

clean:
	rm -rf "$(BUILDDIR)"

.PHONY: all copy pack clean watch
