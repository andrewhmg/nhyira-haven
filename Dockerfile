# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY backend/NhyiraHaven.csproj ./backend/
COPY backend/*.csproj ./
RUN dotnet restore "backend/NhyiraHaven.csproj"
COPY backend/ ./
RUN dotnet publish "backend/NhyiraHaven.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "NhyiraHaven.dll"]