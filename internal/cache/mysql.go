// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package cache

import (
	"context"
	"database/sql"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

func init() {
	RegisterFactory(newMySQLStore, "mysql://")
}

type mySQLStore struct {
	db *sql.DB
}

func newMySQLStore(dsn string) (Cache, error) {
	if err := autoMigrate(context.Background(), dsn); err != nil {
		return nil, err
	}

	connStr := dsn
	connStr = strings.TrimPrefix(connStr, "mysql://")

	if idx := strings.Index(connStr, "@"); idx != -1 {
		userPass := connStr[:idx]
		rest := connStr[idx+1:]

		if slashIdx := strings.Index(rest, "/"); slashIdx != -1 {
			hostPort := rest[:slashIdx]
			dbName := rest[slashIdx:]
			connStr = userPass + "@tcp(" + hostPort + ")" + dbName
		}
	}

	if strings.Contains(connStr, "?") {
		connStr += "&parseTime=true"
	} else {
		connStr += "?parseTime=true"
	}

	db, err := sql.Open("mysql", connStr)
	if err != nil {
		return nil, err
	}

	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return &mySQLStore{db: db}, nil
}

func (s *mySQLStore) Get(domain string) (*InstanceInfo, error) {
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

func (s *mySQLStore) Set(info *InstanceInfo) error {
	_, err := s.db.Exec(`
		INSERT INTO instance_info (domain, software, version, cached_at)
		VALUES (?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE
			software = VALUES(software),
			version = VALUES(version),
			cached_at = VALUES(cached_at)
	`, info.Domain, info.Software, info.Version, info.CachedAt)
	return err
}

func (s *mySQLStore) Delete(domain string) error {
	_, err := s.db.Exec("DELETE FROM instance_info WHERE domain = ?", domain)
	return err
}

func (s *mySQLStore) Close() error {
	return s.db.Close()
}
