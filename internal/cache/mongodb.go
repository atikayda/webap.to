// SPDX-FileCopyrightText: 2025 Atikayda Pty Ltd
// SPDX-License-Identifier: AGPL-3.0-only

package cache

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func init() {
	RegisterFactory(newMongoDBStore, "mongodb://", "mongodb+srv://")
}

type mongoDBStore struct {
	client     *mongo.Client
	collection *mongo.Collection
}

type mongoInstanceInfo struct {
	Domain   string    `bson:"_id"`
	Software string    `bson:"software"`
	Version  string    `bson:"version"`
	CachedAt time.Time `bson:"cached_at"`
}

func newMongoDBStore(dsn string) (Cache, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(dsn))
	if err != nil {
		return nil, err
	}

	if err := client.Ping(ctx, nil); err != nil {
		_ = client.Disconnect(ctx)
		return nil, err
	}

	db := client.Database("webap")
	collection := db.Collection("instance_info")

	indexModel := mongo.IndexModel{
		Keys: bson.D{{Key: "cached_at", Value: 1}},
	}
	_, _ = collection.Indexes().CreateOne(ctx, indexModel)

	return &mongoDBStore{
		client:     client,
		collection: collection,
	}, nil
}

func (s *mongoDBStore) Get(domain string) (*InstanceInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var doc mongoInstanceInfo
	err := s.collection.FindOne(ctx, bson.M{"_id": domain}).Decode(&doc)

	if err == mongo.ErrNoDocuments {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &InstanceInfo{
		Domain:   doc.Domain,
		Software: doc.Software,
		Version:  doc.Version,
		CachedAt: doc.CachedAt,
	}, nil
}

func (s *mongoDBStore) Set(info *InstanceInfo) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	doc := mongoInstanceInfo{
		Domain:   info.Domain,
		Software: info.Software,
		Version:  info.Version,
		CachedAt: info.CachedAt,
	}

	opts := options.Replace().SetUpsert(true)
	_, err := s.collection.ReplaceOne(ctx, bson.M{"_id": info.Domain}, doc, opts)
	return err
}

func (s *mongoDBStore) Delete(domain string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := s.collection.DeleteOne(ctx, bson.M{"_id": domain})
	return err
}

func (s *mongoDBStore) Close() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return s.client.Disconnect(ctx)
}
