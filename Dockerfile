FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Force Nitro to build a Node.js server instead of Cloudflare Workers
ENV NITRO_PRESET=node-server
RUN npm run build

FROM node:20-alpine

WORKDIR /app
COPY --from=builder /app/.output ./.output

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
