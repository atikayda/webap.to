// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package main

import (
	"log"

	"github.com/atikayda/cachedfs"
	"github.com/joho/godotenv"

	"webap.to/internal/config"
	"webap.to/internal/server"
)

func main() {
	_ = godotenv.Load()

	cfg := config.Load()

	staticFS, err := cachedfs.New(cfg.StaticDir, cachedfs.WithFSNotify())
	if err != nil {
		log.Fatalf("Failed to initialize static file cache: %v", err)
	}
	defer func() { _ = staticFS.Close() }()

	srv := server.New(cfg, staticFS)
	log.Printf("%s starting on http://%s:%s", cfg.SiteName, cfg.Domain, cfg.Port)
	log.Fatal(srv.ListenAndServe()) //nolint:gocritic // intentional: cleanup not needed on fatal server error
}
