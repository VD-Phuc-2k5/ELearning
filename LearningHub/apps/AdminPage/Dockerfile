FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_NEST_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_NEST_API_URL=$NEXT_PUBLIC_NEST_API_URL
RUN --mount=type=cache,id=nx-cache-adminpage,sharing=locked,target=/app/.nx \
    NODE_OPTIONS="--max-old-space-size=4096" \
    pnpm nx build AdminPage

FROM node:22-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
WORKDIR /app
COPY --from=build --chown=nextjs:nodejs /app/dist/apps/AdminPage/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/dist/apps/AdminPage/.next/static ./dist/apps/AdminPage/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/AdminPage/public ./apps/AdminPage/public
USER nextjs
ENV NODE_ENV=production PORT=3001 HOSTNAME=0.0.0.0
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:3001/ || exit 1
CMD ["node", "apps/AdminPage/server.js"]
