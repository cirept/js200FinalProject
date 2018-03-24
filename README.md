finalproject

Eric Tanaka
Jun Kim

# how to run game

1.  install node.js

2.  install all dependencies

3.  make 'authorization_code' your base folder

  - type this in your node console.

    ```
    cd /d INSERT_FULL_PATH_HERE_TO_PROJECT_FOLDER
    ```

4.  type

    ```
    node app.js
    ```

5.  open Chrome browser and navigate to

    ```
    localhost:8888
    ```

## For local testing
  - Comment out the correct redirectUri variable

```
let redirectUri = http://localhost:8888/callback; // Your redirect uri // local testing

let redirectUri = 'http://js200-final-project.us-west-2.elasticbeanstalk.com/callback'; // Your redirect uri // AWS server testing
```
