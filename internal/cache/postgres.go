// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package cache

import (
	"context"
	"database/sql"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func init() {
	RegisterFactory(newPostgresStore, "postgres://")
}

type postgresStore struct {
	db *sql.DB
}

func newPostgresStore(dsn string) (Cache, error) {
	if err := autoMigrate(context.Background(), dsn); err != nil {
		return nil, err
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return &postgresStore{db: db}, nil
}

func (s *postgresStore) Get(domain string) (*InstanceInfo, error) {
	var info InstanceInfo
	err := s.db.QueryRow(
		"SELECT domain, software, version, cached_at FROM instance_info WHERE domain = $1",
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

func (s *postgresStore) Set(info *InstanceInfo) error {
	_, err := s.db.Exec(`
		INSERT INTO instance_info (domain, software, version, cached_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (domain) DO UPDATE SET
			software = EXCLUDED.software,
			version = EXCLUDED.version,
			cached_at = EXCLUDED.cached_at
	`, info.Domain, info.Software, info.Version, info.CachedAt)
	return err
}

func (s *postgresStore) Delete(domain string) error {
	_, err := s.db.Exec("DELETE FROM instance_info WHERE domain = $1", domain)
	return err
}

func (s *postgresStore) Close() error {
	return s.db.Close()
}
