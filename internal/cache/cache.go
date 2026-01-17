// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package cache

import (
	"errors"
	"strings"
	"sync"
	"time"
)

const cacheTTL = 30 * 24 * time.Hour

// Various errors
var (
	ErrNoFactory        = errors.New("unable to find factory method for supplied DSN")
	ErrDuplicateFactory = errors.New("duplicate factory DSN prefix supplied")
)

// InstanceInfo holds cached information about a fediverse instance.
//
// Fields:
//   - Domain: The instance domain (e.g., "mastodon.social")
//   - Software: The server software name, lowercase (e.g., "mastodon", "pleroma")
//   - Version: The software version string (e.g., "4.2.0")
//   - CachedAt: When this info was fetched and cached
type InstanceInfo struct {
	Domain   string
	Software string
	Version  string
	CachedAt time.Time
}

// Cache provides thread-safe caching of fediverse instance information.
//
// The cache automatically selects a storage backend based on the DSN:
//   - postgres://... or postgresql://... → PostgreSQL
//   - mysql://... → MySQL
//   - mongodb://... or mongodb+srv://... → MongoDB
//   - anything else → SQLite (file path, file:... or ":memory:")
//
// Cache entries expire after 30 days and are lazily deleted on access.
type Cache interface {
	// Get retrieves cached instance info by domain.
	//
	// Expired entries (older than 30 days) are treated as not found and
	// asynchronously deleted from the store.
	//
	// Parameters:
	//   - domain: The instance domain (e.g., "mastodon.social")
	//
	// Returns:
	//   - *InstanceInfo: The cached info, or nil if not found/expired
	//   - err: if an error occurred, else nil
	Get(domain string) (*InstanceInfo, error)

	// Set stores or updates instance info in the cache.
	//
	// Parameters:
	//   - info: The instance info to cache. Must have Domain set.
	//
	// Returns:
	//   - error: Any storage error
	Set(info *InstanceInfo) error

	// Delete removes instance info from the cache.
	//
	// Parameters:
	//   - domain: The instance domain to remove (e.g., "mastodon.social")
	//
	// Returns:
	//   - error: Any storage error (returns nil if domain wasn't cached)
	Delete(domain string) error

	// Close closes the underlying database connection and releases resources.
	//
	// Returns:
	//   - error: Any error from closing the connection
	Close() error
}

// Factory makes a new Cache from a DSN
type Factory func(dsn string) (Cache, error)

type cache struct {
	store Cache
	mu    sync.RWMutex
	ttl   time.Duration
}

// New creates a new cache with the given database connection string.
//
// Parameters:
//   - dsn: Database connection string. Examples:
//     "postgres://user:pass@host/db" for PostgreSQL
//     "mysql://user:pass@host/db" for MySQL
//     "mongodb://host/db" for MongoDB
//     "/path/to/file.db", "file:file.db" or ":memory:" for SQLite
//
// Returns:
//   - Cache: The initialized cache instance
//   - error: Connection or initialization error
func New(dsn string) (Cache, error) {
	store, err := routeStore(dsn)
	if err != nil {
		return nil, err
	}

	return &cache{
		store: store,
		ttl:   cacheTTL,
	}, nil
}

var cacheFactories = map[string]Factory{}

// RegisterFactory is used to register a factory for a particular DSN scheme.
func RegisterFactory(handler Factory, schemes ...string) error {
	for _, scheme := range schemes {
		if _, ok := cacheFactories[scheme]; ok {
			return ErrDuplicateFactory
		}

		cacheFactories[scheme] = handler
	}
	return nil
}

func routeStore(dsn string) (Cache, error) {
	var match Factory
	specificity := -1

	for prefix, factory := range cacheFactories {
		if strings.HasPrefix(dsn, prefix) {
			n := len(prefix)
			if specificity < n {
				match = factory
				specificity = n
			}
		}
	}

	if match == nil {
		return nil, ErrNoFactory
	}

	return match(dsn)
}

// Get retrieves cached instance info by domain.
//
// Expired entries (older than 30 days) are treated as not found and
// asynchronously deleted from the store.
//
// Parameters:
//   - domain: The instance domain (e.g., "mastodon.social")
//
// Returns:
//   - *InstanceInfo: The cached info, or nil if not found/expired
//   - err: if an error occurred, else nil
func (c *cache) Get(domain string) (*InstanceInfo, error) {
	c.mu.RLock()
	defer c.mu.RUnlock()

	info, err := c.store.Get(domain)
	if err != nil || info == nil {
		return nil, err
	}

	// Check if the entry has expired its ttl (not a big deal, the store shouldn't
	// have allowed it, but we should tell it to delete it anyhow).
	if time.Since(info.CachedAt) > c.ttl {
		_ = c.store.Delete(domain)
	}

	return info, nil
}

// Set stores or updates instance info in the cache.
//
// Parameters:
//   - info: The instance info to cache. Must have Domain set.
//
// Returns:
//   - error: Any storage error
func (c *cache) Set(info *InstanceInfo) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	return c.store.Set(info)
}

// Delete removes instance info from the cache.
//
// Parameters:
//   - domain: The instance domain to remove (e.g., "mastodon.social")
//
// Returns:
//   - error: Any storage error (returns nil if domain wasn't cached)
func (c *cache) Delete(domain string) error {
	c.mu.Lock()
	defer c.mu.Unlock()

	return c.store.Delete(domain)
}

// Close closes the underlying database connection and releases resources.
//
// Returns:
//   - error: Any error from closing the connection
func (c *cache) Close() error {
	return c.store.Close()
}
