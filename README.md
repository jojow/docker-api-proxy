# docker-api-proxy

Proxy for accessing Docker daemon's remote API. By default, the API proxy blocks all requests that can run containers and commands that are not covered by the stored images and their predefined commands. However, you can easily customize the filter logic by adapting the lib/filter.js file.

Configure Docker daemon to listen on a port on localhost (e.g., /etc/default/docker on Ubuntu):

    DOCKER_OPTS="-H tcp://127.0.0.1:2374 -H unix:///var/run/docker.sock"

Prepare the host using curl (may require root access):

    curl -L https://raw.github.com/jojow/docker-api-proxy/master/prepare.sh | bash

Or using wget:

    wget -qO- https://raw.github.com/jojow/docker-api-proxy/master/prepare.sh | bash

Install using curl:

    curl -L https://raw.github.com/jojow/docker-api-proxy/master/install.sh | bash

By default, everything gets installed to $HOME/docker-api-proxy, so you can run it from there:

    cd $HOME/docker-api-proxy
    ./run.sh

You can also set certain environment variables to configure the API proxy:

    export PROXY_PORT=2375
    export TARGET_URL=http://127.0.0.1:2374
    ./run.sh
