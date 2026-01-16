// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package config

import (
	"os"
	"path/filepath"
)

// Config holds the server configuration loaded from environment variables/.env
//
// Fields:
//   - Port: HTTP server port (env: PORT, default: "9847")
//   - Domain: Public domain name (env: DOMAIN, default: "localhost")
//   - SiteName: Display name for the site (env: SITE_NAME, default: "WebAP.to")
//   - StaticDir: Path to static files directory (env: STATIC_DIR, default: "static")
//   - DatabaseURL: Database connection string (env: DATABASE_URL, default: "$DATA_DIR/webap_cache.db")
type Config struct {
	Port        string
	Domain      string
	SiteName    string
	StaticDir   string
	DatabaseURL string
}

// Load reads configuration from environment variables with sensible defaults.
//
// Environment Variables:
//   - PORT: HTTP server port (default: "9847")
//   - DOMAIN: Public domain name (default: "localhost")
//   - SITE_NAME: Display name for the site (default: "WebAP.to")
//   - STATIC_DIR: Path to static files (default: "static")
//   - DATABASE_URL: Full database connection string (overrides DATA_DIR)
//   - DATA_DIR: Directory for SQLite database (default: ".", creates webap_cache.db)
//
// Returns:
//   - *Config: Populated configuration struct
func Load() *Config {
	cfg := &Config{
		Port:      getEnv("PORT", "9847"),
		Domain:    getEnv("DOMAIN", "localhost"),
		SiteName:  getEnv("SITE_NAME", "WebAP.to"),
		StaticDir: getEnv("STATIC_DIR", "static"),
	}

	cfg.DatabaseURL = os.Getenv("DATABASE_URL")
	if cfg.DatabaseURL == "" {
		dataDir := getEnv("DATA_DIR", ".")
		cfg.DatabaseURL = filepath.Join(dataDir, "webap_cache.db")
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
