FROM node:18-alpine
WORKDIR /app
COPY backend/package.json ./
RUN npm install --production
COPY . .
ENV PORT=3001
EXPOSE 3001
CMD ["node", "backend/server.js"]
