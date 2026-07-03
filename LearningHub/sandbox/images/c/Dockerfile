FROM alpine:3.20
RUN apk add --no-cache gcc g++ musl-dev && adduser -D -s /bin/sh sandbox
USER sandbox
WORKDIR /sandbox
