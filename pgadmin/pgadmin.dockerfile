# Use the official pgAdmin image as the base image
FROM dpage/pgadmin4

# Set environment variables (optional)
# Replace these with your own values or use a .env file with docker-compose


# Expose the port pgAdmin runs on
EXPOSE 80

# The entrypoint and command are inherited from the base image, so they don't need to be set explicitly
