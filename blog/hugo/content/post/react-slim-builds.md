---
title: "Creating slim docker images for react apps"
date: 2020-02-28T00:21:37+05:30
draft: false
---

In this blog post, we will create a slim, production ready docker image for a react application. This process is often termed as Dockerization or containerization in developer communities. Containerization helps create portable and reproducible builds of your application that are easy to ship and deploy to any compliant host environment.

<figure style="width: 40%; margin: auto; display: block; margin-bottom: 8px;">
  <img src="/img/02/react_app.png" title="Containerizing a React app"  >
  <figcaption style="font-size: 11px">
    Containerizing a React app
  <figcaption>
</figure>


To do so, we will leverage <a href="https://docs.docker.com/develop/develop-images/multistage-build/" target="_blank">multi-staged</a> docker builds and to keep the image size smaller, we will use <a href="https://github.com/docker-library/docs/blob/master/.template-helpers/variant-alpine.md" target="_blank">alpine variant</a> of popular docker images.

Let's get started.

### Ignore files with .dockerignore

First thing first, we want to reduce the size of the build context i.e. make some of the files invisible to docker daemon when running docker commands. By default, build context is a list of files residing in the same directory as that of `Dockerfile`. A smaller build context means docker can start building images faster.

Let's create a file named `.dockerignore` with a list of files or folders to ignore. 

We want to ignore the `node_modules` folder because we want to fetch npm dependencies again while building docker images instead of using existing dependencies on a developer's machine. This ensures that correct dependencies are installed on the image.

We also want to ignore the `build` folder which is something specific to react applications and it contains the generated application bundles. We want to create an application build within image and hence can ignore the local build folders.

#### **.dockerignore**
``` 
node_modules
build
```

### Create a Dockerfile

Instructions for creating docker images are stored in a file called `Dockerfile`. We are going to use multi-staged builds which means our Dockerfile will include two or more stages i.e. parts of the build process than can be discarded after producing some output. 

For us, the first stage is going to be a node process that installs dependencies and then builds the react applications using something along the lines of `npm install && npm run build`. These instructions are pretty straightforward and React developers should feel right at home.

Let's see how the first stage looks like in a Dockerfile:


#### **Dockerfile**
```
# build
FROM node:10-alpine as build_stage
WORKDIR /src
COPY package.json .
COPY package-lock.json .
RUN npm ci
COPY . .
RUN npm run build
```

This set of instructions in the Dockerfile describes our first stage called the build_stage.

What we did here was copy package-lock and `package.json` first and then run `npm ci`. We used `npm ci` instead of `npm install` because npm ci does a few more checks and makes sure the dependencies installed are from the lock file. This helps prevent accidental upgrades of packages leading to breaking changes. If there's a discrepancy between lock and package.json, `npm ci` may choose to fail which helps catch errors earlier in the build process. 

After dependencies are installed, we make sure that the source code for the application is available to the build stage by copying current directory into the container. `.dockerignore` also comes into play here. Instructions like `COPY . .` use `.dockerignore` to skip copying ignored files and folders into the container.

And finally we run the `npm run build` command which creates the distribution bundle for our react application in the `build` directory.

Next, let's create the second stage of our multi-stage Dockerfile

```
# deploy
FROM nginx:stable-alpine as prod_stage
COPY --from=build_stage /src/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

We have used `nginx:stable-alpine` as the base image for the next stage because this is the production stage that exposes our application to the web. The alpine variant makes sure we get super slim build images, which can reduce network bandwidth, docker repository storage costs and in some cases increase the performance of containers.

We copy the outcome of `build_stage` i.e. our react application bundles into nginx's html directory; then expose port 80 and setup a command to be executed when the container is spun off. At this point, the first stage i.e. `build_stage` is discarded and the final docker image only includes whatever we did within the final stage i.e. the `prod_stage`.

And that's it.

To build, run the docker build command:

```
docker build -t react-starter-2020:latest .
```

And to run the application:

```
docker run -p 9090:80 react-starter-2020
```

With that, we are able to build production ready docker image for our react application. The docker image size for me is `25.9 MB`. This can vary depending on bundles sizes, assets etc. You can also checkout relevant sources on my Github - https://github.com/androidfanatic/react-starter-2020. 

Thanks for reading.

