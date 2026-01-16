// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package server

import (
	"io/fs"
	"log"
	"net/http"
	"strings"
	"time"

	"webap.to/internal/api"
	"webap.to/internal/cache"
	"webap.to/internal/config"
)

// Server is the main HTTP server for the WebAP.to service.
//
// Embeds http.Server and adds cache management. Routes:
//   - GET /api/software?instance={domain} - Returns instance software info
//   - GET / - Landing page
//   - GET /css/*, /js/*, /images/*, /components/*, /dist/* - Static assets
//   - GET /manifest.json, /sw.js, /handle.html, /set-home.html - PWA files
//   - GET /* (anything else) - Redirects to /handle.html for client-side routing
type Server struct {
	http.Server
	cache  cache.Cache
	config *config.Config
}

// New creates a new server with the given configuration and static file system.
//
// Initializes the cache, registers API routes, and sets up static file serving.
// Cache initialization failures are logged but don't prevent server startup.
//
// Parameters:
//   - cfg: Server configuration (port, database URL, etc.)
//   - staticFS: Filesystem containing static assets (typically embedded)
//
// Returns:
//   - *Server: Configured server ready to start with ListenAndServe()
func New(cfg *config.Config, staticFS fs.FS) *Server {
	mux := http.NewServeMux()

	fileServer := http.FileServer(http.FS(staticFS))

	instanceCache, err := cache.New(cfg.DatabaseURL)
	if err != nil {
		log.Printf("Warning: Failed to initialize cache: %v", err)
	} else {
		api.SetCache(instanceCache)
	}

	mux.HandleFunc("/api/software", api.SoftwareHandler)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		path := r.URL.Path

		if path == "/" {
			fileServer.ServeHTTP(w, r)
			return
		}

		if strings.HasPrefix(path, "/css/") ||
			strings.HasPrefix(path, "/js/") ||
			strings.HasPrefix(path, "/images/") ||
			strings.HasPrefix(path, "/components/") ||
			strings.HasPrefix(path, "/dist/") ||
			path == "/manifest.json" ||
			path == "/sw.js" ||
			path == "/handle.html" ||
			path == "/set-home.html" {
			fileServer.ServeHTTP(w, r)
			return
		}

		r.URL.Path = "/handle.html"
		fileServer.ServeHTTP(w, r)
	})

	return &Server{
		Server: http.Server{
			Addr:              ":" + cfg.Port,
			Handler:           mux,
			ReadHeaderTimeout: 10 * time.Second,
		},
		cache:  instanceCache,
		config: cfg,
	}
}

// Close shuts down the server and releases resources.
//
// Closes the cache connection (if initialized) and the HTTP server.
//
// Returns:
//   - error: Any error from closing the HTTP server (cache errors are ignored)
func (s *Server) Close() error {
	if s.cache != nil {
		_ = s.cache.Close()
	}
	return s.Server.Close()
}
