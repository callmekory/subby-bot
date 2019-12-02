FROM node:latest

# Update system
RUN apt update && apt install git -y
RUN npm install -g pm2
RUN curl https://rclone.org/install.sh | bash

# Create the directory
RUN mkdir -p /app
WORKDIR /app

# Copy and Install bot
COPY . /app
RUN npm install

# Expose ports
EXPOSE 5700

# Expose volume
VOLUME /app/config

# Start
CMD ["pm2-runtime", "index.js"]