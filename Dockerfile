FROM golang:1-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./

RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

COPY . .

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o /server .

FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

COPY --from=builder /server /app/server
COPY static /app/static

ENV PORT=9847
ENV STATIC_DIR=/app/static
ENV DATA_DIR=/data

EXPOSE 9847

VOLUME ["/data"]

ENTRYPOINT ["/app/server"]
