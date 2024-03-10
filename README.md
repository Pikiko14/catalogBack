
# Crew Web Catalog

Catalogo digital inteligente para pequeñas y medianas empresas.




## Deployment

Para instalar el proyecto en tu entorno local

```bash
  sudo Git clone https://github.com/Pikiko14/catalogBack
  cd catalogBack
  sudo npm install
  sudo mkdir uploads
  sudo mkdir catalogues
  sudo mkdir categories
  sudo mkdir images
  sudo mkdir pages
  sudo mkdir pdfs
  sudo mkdir products
  sudo mkdir profile
  npm run dev
```

Para instalar el proyecto en tu entorno producción, importante validar las url de produccion en el archivo .env

```bash
  sudo Git clone https://github.com/Pikiko14/catalogBack
  cd catalogBack
  sudo npm install
  sudo mkdir uploads
  cd uploads
  sudo mkdir catalogues
  sudo mkdir categories
  sudo mkdir images
  sudo mkdir pages
  sudo mkdir pdfs
  sudo mkdir products
  sudo mkdir profile
  npm run build
  install imagemagick like this url https://www.linuxcapable.com/how-to-install-imagemagick-on-debian-linux/
  sudo chown -R admin:admin /home/catalogBack/uploads
  sudo chown -R admin:admin /home/catalogBack/uploads/images
  sudo chown -R admin:admin /home/catalogBack/dist/uploads
  sudo chown -R admin:admin /home/catalogBack/dist/uploads/images
  sudo chmod -R u+w /home/catalogBack/uploads
  sudo chmod -R u+w /home/catalogBack/dist/uploads
  sudo chmod -R u+w /home/catalogBack/uploads/images
  sudo chmod -R u+w /home/catalogBack/dist/uploads/images
```

