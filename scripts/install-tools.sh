#!/usr/bin/env bash

# Versions from the repo
NODE_VERSION=$(sed 's/^v//' ./frontend/.nvmrc)
GO_VERSION=$(grep '^go ' go.mod | awk '{print $2}')

# Installation prefix (user-writable)
TOOL_CACHE="${TOOL_CACHE:-$HOME/.cache/vikunja-tools}"
INSTALL_PREFIX="${INSTALL_PREFIX:-$TOOL_CACHE}"
BIN_DIR="$INSTALL_PREFIX/bin"
GOROOT_DIR="$INSTALL_PREFIX/go"

mkdir -p "$BIN_DIR" "$TOOL_CACHE"

# Ensure our bin dir is on PATH
export PATH="$BIN_DIR:$PATH"

install_node() {
       if command -v node >/dev/null 2>&1 && [[ "$(node -v | sed 's/^v//')" == "$NODE_VERSION" ]]; then
               return
       fi
       mkdir -p "$TOOL_CACHE"
       if [ ! -d "$TOOL_CACHE/node-v$NODE_VERSION" ]; then
               curl -fsSL "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" -o "$TOOL_CACHE/node.tar.xz"
               mkdir -p "$TOOL_CACHE/node-v$NODE_VERSION"
               tar -xf "$TOOL_CACHE/node.tar.xz" -C "$TOOL_CACHE/node-v$NODE_VERSION" --strip-components=1
               rm "$TOOL_CACHE/node.tar.xz"
       fi
       ln -sf "$TOOL_CACHE/node-v$NODE_VERSION/bin/node" "$BIN_DIR/node"
       ln -sf "$TOOL_CACHE/node-v$NODE_VERSION/bin/npm" "$BIN_DIR/npm"
       ln -sf "$TOOL_CACHE/node-v$NODE_VERSION/bin/npx" "$BIN_DIR/npx"
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
       mkdir -p "$TOOL_CACHE"
       if [ ! -d "$TOOL_CACHE/go$GO_VERSION" ]; then
               curl -fsSL "https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz" -o "$TOOL_CACHE/go.tar.gz"
               mkdir -p "$TOOL_CACHE/go$GO_VERSION"
               tar -C "$TOOL_CACHE/go$GO_VERSION" -xzf "$TOOL_CACHE/go.tar.gz" --strip-components=1
               rm "$TOOL_CACHE/go.tar.gz"
       fi
       GOROOT_DIR="$TOOL_CACHE/go$GO_VERSION"
       export PATH="$BIN_DIR:$GOROOT_DIR/bin:$PATH"
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
