.PHONY: run build clean dev lint lint-fix

run:
	go run .

build:
	go build -o webap .

clean:
	rm -f webap

dev:
	go run .

lint:
	golangci-lint run

lint-fix:
	golangci-lint run --fix
