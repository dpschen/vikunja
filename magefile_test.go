// Vikunja is a to-do list application to facilitate your life.
// Copyright 2018-present Vikunja and contributors. All rights reserved.

// Vikunja placeholder test helpers
package main

//nolint:err113,gosec,staticcheck

// Test helpers for placeholder creation.

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

var RootPath string

const FakeFrontendEnv = "VIKUNJA_FAKE_FRONTEND"

const placeholderHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vikunja</title>
</head>
<body>
    <h1>Vikunja frontend placeholder</h1>
    <p>The frontend was not built. Do not ship this file.</p>
</body>
</html>
`

func ensureFrontendDistIndex() (bool, error) {
	p := filepath.Join(RootPath, "frontend", "dist", "index.html")
	if _, err := os.Stat(p); err == nil {
		return false, nil
	} else if !os.IsNotExist(err) {
		return false, err
	}

	v, ok := os.LookupEnv(FakeFrontendEnv)
	if !ok || !(v == "1" || strings.ToLower(v) == "true") { //nolint:staticcheck
		abs, _ := filepath.Abs(p)
		return false, fmt.Errorf("%s not found; build the frontend or set %s=1", abs, FakeFrontendEnv) //nolint:err113
	}

	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil { //nolint:err113
		return false, fmt.Errorf("creating frontend dist directory: %w", err)
	}

	if err := os.WriteFile(p, []byte(placeholderHTML), 0o600); err != nil { //nolint:gosec,err113
		return false, fmt.Errorf("creating placeholder index.html: %w", err)
	}

	log.Println("Created placeholder", p)
	return true, nil
}

func TestEnsureFrontendDistIndexCreatesFile(t *testing.T) {
	dir := t.TempDir()
	oldRoot := RootPath
	RootPath = dir
	defer func() { RootPath = oldRoot }()
	os.Setenv(FakeFrontendEnv, "1")
	defer os.Unsetenv(FakeFrontendEnv)

	created, err := ensureFrontendDistIndex()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !created {
		t.Fatal("expected placeholder to be created")
	}

	p := filepath.Join(dir, "frontend", "dist", "index.html")
	data, err := os.ReadFile(p)
	if err != nil {
		t.Fatalf("index.html not created: %v", err)
	}
	if string(data) != placeholderHTML {
		t.Fatalf("unexpected content:\n%s", data)
	}
}

func TestEnsureFrontendDistIndexFailsWithoutEnv(t *testing.T) {
	dir := t.TempDir()
	oldRoot := RootPath
	RootPath = dir
	defer func() { RootPath = oldRoot }()
	os.Unsetenv(FakeFrontendEnv)

	_, err := ensureFrontendDistIndex()
	if err == nil {
		t.Fatal("expected error but got none")
	}
}
