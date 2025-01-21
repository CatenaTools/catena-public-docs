---
markdown:
  toc:
    depth: 3
---

# Deploying to Heroku

## Estimated Time
Starting from scratch, deploying Catena to Heroku is estimated to take **10-20 minutes**.

## What Is Heroku?
[Heroku](https://www.heroku.com/) is a cloud platform that allows developers to build, manage, and scale applications in the cloud.

## Deployment Instructions
{% partial file="/_partials/install-catena/obtain-catena-source.md" /%}

### 2. Prep Work

#### 2a. Create a Heroku Account
To create a Heroku account, you can [sign up here](https://signup.heroku.com/).

To deploy applications to Heroku, you will need to have a credit card on file. You can add one in the [Heroku Billing Center](https://dashboard.heroku.com/account/billing).

*Note: We will be running with minimal resources. Your deployment is estimated to cost **~$15 a month**.*

#### 2b. Install The Heroku CLI
You will need the Heroku CLI to deploy Catena to Heroku. You can follow [these instructions from Heroku](https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli) to install it.

You can verify your installation by:

```bash
heroku --version

# Expected Output:
# heroku/10.0.0 win32-x64 node-v20.17.0
```

#### 2c. Login To Heroku via CLI
After you install the CLI, login.

```bash
heroku login

# Expected Output:
# heroku: Press any key to open up the browser to login or q to exit: 
# Opening browser to https://cli-auth.heroku.com/auth/cli/browser/***
# heroku: Waiting for login... \

# After Login:
# Logging in... done
# Logged in as example@example.com
```

### 3. Deploy Catena
Now that you have everything prepped, it's time to actually deploy Catena.

1. Navigate to the Catena Core repository that you cloned earlier.
2. Create an empty Heroku application.

```bash
heroku create catena-tools-core

# Expected Output:
# Creating ⬢ catena-tools-core... done
# https://catena-tools-core-d6fe81ff54bf.herokuapp.com/ | https://git.heroku.com/catena-tools-core.git
```

3. This will automatically add a Git remote.

```bash
git remote -v

# Expected Output:
# heroku  https://git.heroku.com/catena-tools-core.git (fetch)
# heroku  https://git.heroku.com/catena-tools-core.git (push)
# origin  git@github.com:CatenaTools/catena-tools-core.git (fetch)
# origin  git@github.com:CatenaTools/catena-tools-core.git (push)
```

4. Tell Heroku to use the Dotnet buildpack.
```bash
heroku buildpacks:set heroku/dotnet
```

5. Configure PostgreSQL and Redis by first creating addons for each and then waiting for each to come online. This may take a few minutes.

```bash
heroku addons:create heroku-postgresql:essential-0 # "heroku addons:plans heroku-postgresql" to see options other than essential-0
heroku addons:create heroku-redis:mini # "heroku addons:plans heroku-redis" to see options other than mini
heroku pg:wait
heroku redis:wait
```

5. Configure the proper environment variables for Catena to run.

{% tabs %}
    <!--
    -- TODO (@HF): Add Entitlements Connection String in Both Powershell and Bash Implementations
    -- This will depend on a bug within the Entitlements service being fixed, where migrations run out of order
    -->

    {% tab label="Powershell" %}

        ```bash
        $platformUrl = (heroku apps:info --json | ConvertFrom-Json).app.web_url

        $redisUrl = heroku config:get REDIS_URL

        $dbUrl = heroku config:get DATABASE_URL
        $uri = [System.Uri]$dbUrl

        $dbHost = $uri.Host
        $port = $uri.Port
        $database = $uri.AbsolutePath.Trim('/')
        $username = $uri.UserInfo.Split(':')[0]
        $password = $uri.UserInfo.Split(':')[1]

        $connectionString = "Host=$dbHost;Port=$port;Database=$database;Username=$username;Password=$password;"

        heroku config:set `
            Catena__PlatformUrl="$platformUrl" `
            Catena__Accounts__Database__ConnectionString="$connectionString" `
            Catena__ApiKeys__Database__ConnectionString="$connectionString" `
            Catena__Friends__Database__ConnectionString="$connectionString" `
            Catena__Parties__Database__ConnectionString="$connectionString" `
            Catena__Titles__Database__ConnectionString="$connectionString" `
            Catena__ServerReleases__Database__ConnectionString="$connectionString" `
            Catena__SessionStore__SessionProviderConfigurations__RedisSessionStoreAccessor__ConnectionString="$redisUrl"
        ```

    {% /tab %}

    {% tab label="Bash" %}
        
        ```bash
        PLATFORM_URL=$(heroku apps:info | grep "Web URL:" | awk '{print $3}' | tr -d '\n')

        REDIS_URL=$(heroku config:get REDIS_URL)

        DB_URL=$(heroku config:get DATABASE_URL)
        if [[ $DB_URL =~ ^postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)$ ]]; then
            USERNAME="${BASH_REMATCH[1]}"
            PASSWORD="${BASH_REMATCH[2]}"
            DB_HOST="${BASH_REMATCH[3]}"
            PORT="${BASH_REMATCH[4]}"
            DATABASE="${BASH_REMATCH[5]}"
        else
            echo "Failed to parse database URL"
            exit 1
        fi

        CONNECTION_STRING="Host=$DB_HOST;Port=$PORT;Database=$DATABASE;Username=$USERNAME;Password=$PASSWORD;"

        heroku config:set \
            "Catena__PlatformUrl=$PLATFORM_URL" \
            "Catena__Accounts__Database__ConnectionString=$CONNECTION_STRING" \
            "Catena__ApiKeys__Database__ConnectionString=$CONNECTION_STRING" \
            "Catena__Friends__Database__ConnectionString=$CONNECTION_STRING" \
            "Catena__Parties__Database__ConnectionString=$CONNECTION_STRING" \
            "Catena__Titles__Database__ConnectionString=$CONNECTION_STRING" \
            "Catena__ServerReleases__Database__ConnectionString=$CONNECTION_STRING" \
            "Catena__SessionStore__SessionProviderConfigurations__RedisSessionStoreAccessor__ConnectionString=$REDIS_URL"
        ```

    {% /tab %}
{% /tabs %}

7. Deploy your application, specifying the `catena-tools-core` directory where Catena Core lives.

```bash
git push heroku main
```

7. In your deployment output, you should see something similar to the following. Take note of the URL that Heroku provides to you.

```
remote: -----> Launching...
remote:        Released v7
remote:        https://catena-tools-core-328909998aac.herokuapp.com/ deployed to Heroku
```

8. Check that Catena is running by navigating to [https://<your_deployment_url>/api/v1/node_inspection/is_healthy](https://<your_deployment_url>/api/v1/node_inspection/is_healthy)

## What Next?
{% partial file="/_partials/install-catena/what-next.md" /%}