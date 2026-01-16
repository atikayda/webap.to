// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package cache

import (
	"context"
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

func init() {
	RegisterFactory(newSQLiteStore, "", "/", "./", "file:", ":memory:")
}

type sqliteStore struct {
	db *sql.DB
}

func newSQLiteStore(path string) (Cache, error) {
	if err := autoMigrate(context.Background(), path); err != nil {
		return nil, err
	}

	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return &sqliteStore{db: db}, nil
}

func (s *sqliteStore) Get(domain string) (*InstanceInfo, error) {
	var info InstanceInfo
	err := s.db.QueryRow(
		"SELECT domain, software, version, cached_at FROM instance_info WHERE domain = ?",
		domain,
	).Scan(&info.Domain, &info.Software, &info.Version, &info.CachedAt)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &info, nil
}

func (s *sqliteStore) Set(info *InstanceInfo) error {
	_, err := s.db.Exec(`
		INSERT OR REPLACE INTO instance_info (domain, software, version, cached_at)
		VALUES (?, ?, ?, ?)
	`, info.Domain, info.Software, info.Version, info.CachedAt)
	return err
}

func (s *sqliteStore) Delete(domain string) error {
	_, err := s.db.Exec("DELETE FROM instance_info WHERE domain = ?", domain)
	return err
}

func (s *sqliteStore) Close() error {
	return s.db.Close()
}
