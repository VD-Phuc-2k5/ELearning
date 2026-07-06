#!/bin/bash
docker build -t sandbox-python ./images/python
docker build -t sandbox-node ./images/node
docker build -t sandbox-c ./images/c
docker build -t sandbox-java ./images/java
docker build -t sandbox-go ./images/go
docker build -t sandbox-csharp ./images/csharp
docker build -t sandbox-rust ./images/rust
docker build -t sandbox-typescript ./images/typescript
docker build -t sandbox-swift ./images/swift
