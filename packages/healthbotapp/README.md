# Health Bot App

A web page that allows users to communicate with the [Microsoft Healthcare Bot service](https://www.microsoft.com/en-us/research/project/health-bot/) through a WebChat.

**Note:** In order to use this Web Chat with the Health Bot service, you will need to obtain your Web Chat secret by going to `Integration/Secrets` on the navigation panel.

![Secrets](/secrets.png)

1. Configure environment variables.

add a `.env` to the `healthbotapp` directory with the following values

```
APP_SECRET=<APP_SECRET_FROM_HEALTHBOT_PORTAL>
WEBCHAT_SECRET=<WEBCAHT_SECRET_FROM_HEALTHBOT_PORTAL>
```

2. Run

```
yarn start
```

**Supported query parameters**

- `locale`: set the locale, e.g., `locale=en-us`. Defaults to `navigator.language`.
- `countryRegion`: scope the running bot to a specific country, e.g., `countryRegion=United States`. Defaults to `United States`.
- `adminDistrict`: scope the running bot to a specific state or territory territory using state codes, e.g., `region=WA`.
- `shareLocation`: setting this query parameter will prompt for the user location using the browser location API and bypass location input.
  If the user denies access to location then the bot will fallback to asking for the location.
