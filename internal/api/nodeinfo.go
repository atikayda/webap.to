// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"webap.to/internal/cache"
)

var httpClient = &http.Client{
	Timeout: 10 * time.Second,
}

var instanceCache cache.Cache

// SetCache sets the cache instance used by API handlers.
//
// Parameters:
//   - c: The cache instance to use for storing instance info. May be nil to disable caching.
func SetCache(c cache.Cache) {
	instanceCache = c
}

func setCORSHeaders(w http.ResponseWriter, origin string) {
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func normalizeInstance(instance string) string {
	instance = strings.TrimPrefix(instance, "https://")
	instance = strings.TrimPrefix(instance, "http://")
	instance = strings.Split(instance, "/")[0]
	return strings.ToLower(instance)
}

type nodeInfoLinks struct {
	Links []struct {
		Rel  string `json:"rel"`
		Href string `json:"href"`
	} `json:"links"`
}

type nodeInfoResponse struct {
	Software struct {
		Name    string `json:"name"`
		Version string `json:"version"`
	} `json:"software"`
}

type softwareResponse struct {
	Software string `json:"software"`
	Version  string `json:"version"`
	Cached   bool   `json:"cached"`
}

// SoftwareHandler returns the software name and version for a fediverse instance.
//
// Returns cached data if available, otherwise fetches from the instance's
// well-known nodeinfo endpoint and caches the result.
//
// Query Parameters:
//   - instance: The domain of the fediverse instance (e.g., "mastodon.social")
//
// Response (200 OK):
//
//	{
//	  "software": "mastodon",
//	  "version": "4.2.0",
//	  "cached": true
//	}
//
// Errors:
//   - 400 Bad Request: Missing instance parameter
//   - 405 Method Not Allowed: Non-GET/OPTIONS request
//   - 502 Bad Gateway: Failed to fetch nodeinfo from instance
func SoftwareHandler(w http.ResponseWriter, r *http.Request) {
	origin := "*"
	if v, ok := r.Header["Origin"]; ok && len(v) > 0 {
		origin = v[0]
	}
	setCORSHeaders(w, origin)

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	instance := r.URL.Query().Get("instance")
	if instance == "" {
		http.Error(w, "Missing instance parameter", http.StatusBadRequest)
		return
	}
	instance = normalizeInstance(instance)

	if instanceCache != nil {
		if info, err := instanceCache.Get(instance); err == nil {
			w.Header().Set("Content-Type", "application/json")
			_ = json.NewEncoder(w).Encode(softwareResponse{
				Software: info.Software,
				Version:  info.Version,
				Cached:   true,
			})
			return
		}
	}

	software, version, err := fetchNodeInfo(instance)
	if err != nil {
		http.Error(w, "Failed to fetch nodeinfo: "+err.Error(), http.StatusBadGateway)
		return
	}

	if instanceCache != nil {
		_ = instanceCache.Set(&cache.InstanceInfo{
			Domain:   instance,
			Software: software,
			Version:  version,
			CachedAt: time.Now(),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(softwareResponse{
		Software: software,
		Version:  version,
		Cached:   false,
	})
}

func fetchNodeInfo(instance string) (software, version string, err error) {
	wellKnownURL := "https://" + instance + "/.well-known/nodeinfo"
	resp, err := httpClient.Get(wellKnownURL)
	if err != nil {
		return "", "", err
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("well-known returned status %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", err
	}

	var links nodeInfoLinks
	if err := json.Unmarshal(body, &links); err != nil {
		return "", "", err
	}

	var nodeInfoURL, fallbackURL string
	for _, link := range links.Links {
		if strings.Contains(link.Rel, "nodeinfo.diaspora.software/ns/schema/2") {
			nodeInfoURL = link.Href
			break
		}
		if fallbackURL == "" && strings.Contains(link.Rel, "nodeinfo") {
			fallbackURL = link.Href
		}
	}
	if nodeInfoURL == "" {
		nodeInfoURL = fallbackURL
	}

	if nodeInfoURL == "" {
		return "", "", errors.New("no nodeinfo link found")
	}

	nodeInfoResp, err := httpClient.Get(nodeInfoURL)
	if err != nil {
		return "", "", err
	}
	defer func() { _ = nodeInfoResp.Body.Close() }()

	var nodeInfo nodeInfoResponse
	if err := json.NewDecoder(nodeInfoResp.Body).Decode(&nodeInfo); err != nil {
		return "", "", err
	}

	return strings.ToLower(nodeInfo.Software.Name), nodeInfo.Software.Version, nil
}
