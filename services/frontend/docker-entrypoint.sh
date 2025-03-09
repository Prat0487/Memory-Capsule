#!/bin/sh
# Set default port if not provided
export NGINX_PORT=${PORT:-3006}

# Generate nginx config with simple variable
envsubst '$NGINX_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Print the generated config for debugging
echo "Generated Nginx config:"
cat /etc/nginx/conf.d/default.conf

# Execute the CMD
exec "$@"
