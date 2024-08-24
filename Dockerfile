FROM node:18


RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy pnpm lockfile and package.json to the working directory
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Copy .env file into the container
COPY .env ./

# Generate Prisma Client
RUN pnpm prisma:generate

# Build the application
RUN pnpm build

# Run Prisma migrations
RUN pnpm prisma:migrate

# Expose the port that the app runs on
EXPOSE 3000

# Command to run the application
CMD ["pnpm", "start:prod"]
