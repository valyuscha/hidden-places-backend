FROM node:18

WORKDIR /app

COPY supabase-ca.crt ./supabase-ca.crt

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

RUN npm run prestart:prod

EXPOSE 3000

CMD NODE_EXTRA_CA_CERTS=supabase-ca.crt npm run start:prod
