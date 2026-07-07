FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_NEST_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_NEST_API_URL=$NEXT_PUBLIC_NEST_API_URL
RUN --mount=type=cache,id=nx-cache-learninghub,sharing=locked,target=/app/.nx \
    NODE_OPTIONS="--max-old-space-size=4096" \
    pnpm nx build LearningHub

FROM node:22-alpine
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs
WORKDIR /app
COPY --from=build --chown=nextjs:nodejs /app/dist/apps/LearningHub/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/dist/apps/LearningHub/.next/static ./dist/apps/LearningHub/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/LearningHub/public ./apps/LearningHub/public
USER nextjs
ENV NODE_ENV=production PORT=3002 HOSTNAME=0.0.0.0
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:3002/ || exit 1
CMD ["node", "apps/LearningHub/server.js"]
