# Use official NGINX image as base
FROM nginx:stable-alpine

# Copy our custom NGINX config into container
COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
