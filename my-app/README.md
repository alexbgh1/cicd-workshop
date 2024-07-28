# CI/CD Workshop - aws

[Link to Workshop](https://catalog.workshops.aws/cicdonaws/en-US/20-source-control)

## Run

```
docker run -it --rm -v "$(pwd):/app" -v /app/node_modules -p 8081:8081 -e CHOKIDAR_USEPOLLING=true my-app:dev
```

- **-it** Runs the container in interactive mode so we can execute commands inside the container while it is still running.
- **--rm** Removes the anonymous volumes associated with the container when the container is removed.
- **-v** Mounts a volume at a specified location.
- **-p** Explicitly map a single port or range of ports.
- **-e** Sets an environment variable.
