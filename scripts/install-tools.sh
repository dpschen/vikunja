#!/usr/bin/env bash

# Versions from the repo
NODE_VERSION=$(sed 's/^v//' ./frontend/.nvmrc)
GO_VERSION=$(grep '^go ' go.mod | awk '{print $2}')
PNPM_VERSION=$(grep -oP 'pnpm@\K[0-9.]+' frontend/package.json)

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
        if command -v pnpm >/dev/null 2>&1 && [[ "$(pnpm -v)" == "$PNPM_VERSION" ]]; then
                return
        fi

        corepack enable >/dev/null 2>&1
        corepack prepare "pnpm@$PNPM_VERSION" --activate >/dev/null 2>&1

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

install_chrome() {
        if command -v google-chrome >/dev/null 2>&1; then
                return
        fi

        local deb="google-chrome.deb"
        curl -fsSL -o "$deb" "https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb"
        sudo apt-get update -qq >/dev/null
        sudo apt-get install -y "./$deb" >/dev/null
        rm "$deb"
}

install_node
install_pnpm
install_go
install_mage
install_chrome

echo "Setup complete. Binaries are in $BIN_DIR."
