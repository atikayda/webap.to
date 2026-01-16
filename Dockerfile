FROM golang:1.24-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go mod tidy && CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o /server .

FROM alpine:3.20

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
