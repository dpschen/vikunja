#!/usr/bin/env bash

# Versions from the repo
NODE_VERSION=$(sed 's/^v//' ./frontend/.nvmrc)
GO_VERSION=$(grep '^go ' go.mod | awk '{print $2}')

# Installation prefix (user-writable)
INSTALL_PREFIX="${INSTALL_PREFIX:-$HOME/.local}"
BIN_DIR="$INSTALL_PREFIX/bin"
GOROOT_DIR="$INSTALL_PREFIX/go"

mkdir -p "$BIN_DIR"

# Ensure our bin dirs are on PATH
export PATH="$BIN_DIR:$GOROOT_DIR/bin:$PATH"

install_node() {
	if command -v node >/dev/null 2>&1 && [[ "$(node -v | sed 's/^v//')" == "$NODE_VERSION" ]]; then
		return
	fi
	curl -fsSL "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" -o node.tar.xz
	tar -xf node.tar.xz -C "$INSTALL_PREFIX" --strip-components=1
	rm node.tar.xz
}

COREPACK_ENABLE_AUTO_PIN=0

install_pnpm() {

	# Install frontend dependencies
	(
	cd frontend && \
	pnpm install --frozen-lockfile
	)

}

install_go() {
	if command -v go >/dev/null 2>&1 && [[ "$(go version | awk '{print $3}' | sed 's/go//')" == "$GO_VERSION" ]]; then
		return
	fi
	curl -fsSL "https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz" -o go.tar.gz
	rm -rf "$GOROOT_DIR"
	mkdir -p "$GOROOT_DIR"
	tar -C "$GOROOT_DIR" -xzf go.tar.gz --strip-components=1
	rm go.tar.gz
}

install_mage() {
	# Install mage into our user bin dir
	GOBIN="$BIN_DIR" GO111MODULE=on go install github.com/magefile/mage@v1.15.0
}

install_node
install_pnpm
install_go
install_mage

echo "Setup complete. Binaries are in $BIN_DIR."
