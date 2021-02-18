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

- `locale`: set the locale, e.g., `locale=en-us` or set the locale to autodetect language based on `navigator.language` with `locale=autodetect`.
- `region`: scope the running bot to a specific state or territory using state codes, e.g., `region=WA`.
