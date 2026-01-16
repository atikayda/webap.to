// WebAP.to Database Schema
// Schema Management: Atlas (https://atlasgo.io/)
// To migrate manually, run:
//   atlas schema apply -u "$DATABASE_URL" --to file://database/schema.hcl
// In production, the server will automatically apply migrations

schema "public" {
  comment = "WebAP redirector instance cache"
}

table "instance_info" {
  schema = schema.public

  column "domain" {
    type = text
    null = false
  }

  column "software" {
    type = text
    null = false
  }

  column "version" {
    type = text
    null = false
  }

  column "cached_at" {
    type    = timestamptz
    null    = false
    default = sql("NOW()")
  }

  primary_key {
    columns = [column.domain]
  }

  index "idx_instance_info_cached_at" {
    columns = [column.cached_at]
  }
}
