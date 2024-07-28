# CI/CD Workshop - aws

https://catalog.workshops.aws/cicdonaws/en-US/20-source-control

## Run

```
docker run -it --rm -v "cd:/app" -v /app/node_modules -p 8081:8081 -e CHOKIDAR_USEPOLLING=true my-app:dev
```
