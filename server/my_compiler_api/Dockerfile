FROM ubuntu:20.04

# Set non-interactive mode
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y --fix-missing \
    python3 python3-pip \
    g++ \
    default-jdk \
    nodejs npm \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

# Set timezone to UTC
RUN ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime && dpkg-reconfigure --frontend noninteractive tzdata

# Create app directory
WORKDIR /app

# Copy app source
COPY app /app

# Install Python dependencies
RUN pip3 install flask

# Set up environment
ENV FLASK_APP=main.py

# Expose the port the app runs on
EXPOSE 5000

# Run the application
CMD ["flask", "run", "--host=0.0.0.0"]
