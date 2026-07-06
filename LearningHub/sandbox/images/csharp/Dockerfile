FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine
RUN adduser -D -s /bin/sh sandbox
WORKDIR /home/sandbox/project
RUN dotnet new console && dotnet build
RUN chown -R sandbox:sandbox /home/sandbox
USER sandbox
WORKDIR /sandbox
