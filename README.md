1. [**Github**] Create a Github key attached to your account.

> 2.  [**LOCAL**] Clone the repository to your local machine and install the dependencies `npm install` on each directory.

3.  [**AWS**] Create Secret Manager and store the Github key as **plain text**, suggested name: `github/personal_access_token`.

> 4.  [**LOCAL**] Verify `app-cdk/pipeline-cdk-stack.ts` to ensure the correct Secret Manager name is being used.

> 5.  [**LOCAL**] Run `cdk deploy pipeline-stack` on the `app-cdk/` directory to deploy the pipeline.
