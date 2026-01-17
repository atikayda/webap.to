// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package cache

import (
	"context"
	"fmt"
	"strings"

	"ariga.io/atlas/sql/schema"
	"ariga.io/atlas/sql/sqlclient"

	_ "ariga.io/atlas/sql/mysql"
	_ "ariga.io/atlas/sql/postgres"
	_ "ariga.io/atlas/sql/sqlite"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
)

func desiredSchema(name string) *schema.Schema {
	return &schema.Schema{
		Name: name,
		Tables: []*schema.Table{
			{
				Name: "instance_info",
				Columns: []*schema.Column{
					{Name: "domain", Type: &schema.ColumnType{Type: &schema.StringType{T: "varchar", Size: 255}}},
					{Name: "software", Type: &schema.ColumnType{Type: &schema.StringType{T: "varchar", Size: 100}}},
					{Name: "version", Type: &schema.ColumnType{Type: &schema.StringType{T: "varchar", Size: 50}}},
					{Name: "cached_at", Type: &schema.ColumnType{Type: &schema.TimeType{T: "timestamp"}}},
				},
				PrimaryKey: &schema.Index{
					Parts: []*schema.IndexPart{{C: &schema.Column{Name: "domain"}}},
				},
				Indexes: []*schema.Index{
					{
						Name:  "idx_instance_info_cached_at",
						Parts: []*schema.IndexPart{{C: &schema.Column{Name: "cached_at"}}},
					},
				},
			},
		},
	}
}

func autoMigrate(ctx context.Context, dsn string) error {
	client, err := sqlclient.Open(ctx, toAtlasURL(dsn))
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}
	defer func() { _ = client.Close() }()

	current, err := client.InspectSchema(ctx, "", nil)
	if err != nil {
		return fmt.Errorf("failed to inspect schema: %w", err)
	}

	changes, err := client.SchemaDiff(current, desiredSchema(current.Name))
	if err != nil {
		return fmt.Errorf("failed to diff schema: %w", err)
	}

	if len(changes) == 0 {
		return nil
	}

	if err := client.ApplyChanges(ctx, changes); err != nil {
		return fmt.Errorf("failed to apply changes: %w", err)
	}

	return nil
}

func toAtlasURL(dsn string) string {
	if dsn == "" {
		return dsn
	}
	// Already has a scheme
	if strings.Contains(dsn, "://") {
		return dsn
	}
	// Special case for in-memory SQLite
	if dsn == ":memory:" {
		return "sqlite://:memory:"
	}
	// File path - Atlas expects sqlite://file:path format
	return "sqlite://file:" + dsn
}
