FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine
RUN adduser -D -s /bin/sh sandbox
WORKDIR /home/sandbox/project
RUN dotnet new console && dotnet build && dotnet publish -c Release -o /home/sandbox/app && rm -rf /usr/share/dotnet/sdk/*/SdkManifests
ENV DOTNET_CLI_HOME=/tmp \
    DOTNET_NOLOGO=1 \
    DOTNET_CLI_TELEMETRY_OPTOUT=1 \
    DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 \
    DOTNET_CLI_WORKLOAD_UPDATE_NOTIFY_DISABLE=1
RUN chown -R sandbox:sandbox /home/sandbox
USER sandbox
WORKDIR /sandbox
