# Use the official Node.js image as the base image
FROM node:19-alpine

ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

# Needed for the wait-for-db script
RUN apk add --no-cache netcat-openbsd

# Set the working directory
WORKDIR /next

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]