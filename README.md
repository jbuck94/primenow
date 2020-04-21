# Prime Now Delivery Finder

## Environment Set Up

1. Install [Homebrew](https://brew.sh/)

   ```bash
   /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
   ```

2. Run brew update to make sure Homebrew is up to date.

   ```bash
   brew update
   ```

3. Add Homebrew’s location to your \$PATH in your .bash_profile or .zshrc file.

   ```bash
   export PATH="/usr/local/bin:$PATH"
   ```

4. Install [Node](https://nodejs.org/en/) (npm will be installed with Node):

   ```bash
   brew install node
   ```

5. Check your node version:

   ```bash
   node -v
   ```

6. Check your npm version:

   ```bash
   npm -v
   ```

   _Note:_ Node version should be greater than `10.0.0` and npm version should be greater than `6.0.0`

7. Install [Chromium](https://www.chromium.org/)

   ```bash
   brew cask install chromium
   ```

8. Install [yarn](https://yarnpkg.com/)

   ```bash
   brew install yarn
   ```

## Project Installation

1. clone this repo
   ```bash
    git clone https://github.com/jbuck94/primenow.git
   ```
2. CD into the project directory

   ```bash
   cd primenow
   ```

3. Install project dependencies
   ```bash
   yarn install
   ```
4. Install [PM2](https://pm2.keymetrics.io/), a daemon process process manager that will keep your application online

   ```bash
   yarn global add pm2
   ```

## Configuration

Rename `secrets-example.json` to `secrets.json`, and fill out the values.

**NOTE: never check this file into version control**

- **amazon:** the `username` and `password` is what you would use to log into amazon in your browser, this is so the script can get to your cart.

- **mailjet:** Follow [this tutorial](https://www.youtube.com/watch?v=-pBwzl7stTE&list=PL0BaQoZdfN0K-3guga2E2WBub5R9aSzIx) from Mailjet to setup an account and verify your domain. Once your account and domain are setup, click your name in the top right corner, then go to "API Key Management" and copy your API Key and Secret key into the config

- **notifications:** the `send_to_email` is the address that will be notified upon finding delivery windows

- **two_captcha_key:** sign up for [2captcha](https://2captcha.com/) account, and purchase captchas by clicking "add funds". Copy your API key from the "Account Settings" section on the dashboard

- **delivery_zip_code:** the zipcode you will have your amazon order delivered to

## Run The Job

The final step is to start the chron job, which will continually run in the background, every 5 minutes.

```bash
pm2 run app.js
```

To check that the project is running

```bash
pm2 list
```

To see full metrics and logs

```
pm2 monit
```
