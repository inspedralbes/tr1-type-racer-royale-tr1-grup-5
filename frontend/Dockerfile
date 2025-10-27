# Solo Node, sin Nginx
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Exponer el puerto de Vite
EXPOSE 5174

# Comando para correr Vite en modo dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
