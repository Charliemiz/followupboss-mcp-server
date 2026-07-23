FROM node:22-alpine

ENV NODE_ENV=production \
    MCP_TRANSPORT=http \
    PORT=3000

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY index.js ./

USER node

EXPOSE 3000

CMD ["node", "index.js"]
