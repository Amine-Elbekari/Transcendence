
FROM debian:latest

# RUN apt-get update && apt-get install -y python3 python3-pip python3-venv 
#     #   apt-get install -y libpq-dev

# # Copy your script into the container
# COPY tools/script.sh /tmp/script.sh

# # Make your script executable
# RUN chmod +x /tmp/script.sh

# # Set the working directory
# WORKDIR /usr/src/app

# # Set environment variables
# ENV OAUTHLIB_INSECURE_TRANSPORT=1

# # Copy the requirements file
# COPY tools/requirements.txt /requirements.txt

WORKDIR /etc

# Execute the script when the container starts
# CMD ["/tmp/script.sh"]
CMD [ "tail" , "-f"]