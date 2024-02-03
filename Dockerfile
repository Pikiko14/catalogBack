version: "3"
services:
  app:
    image: nodeimage
    container_name: catalogocrewweb
    build: ./
    restart: always
    ports:
      - "3001:3001"
    environment:
      - DB_URI=mongodb://mongodb:27017/catalog_crew_web
      - PORT=3001
      - JWT_SECRET=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ920231009
      - APP_URL=https://gv244r-4000.csb.app
      - EPAYCO_ID_CLIENT=646482
      - EPAYCO_PRIVATE_KEY=ee0e83f7ea7a5b1f051334858998f06ee361c12a
  mongodb:
    image: mongo
    container_name: mongodb
    restart: always
    ports:
      - "27017:27017"
