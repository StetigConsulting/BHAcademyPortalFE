const API_URLS = {
  dev: "https://bhps-dev-e5405195a6cd.herokuapp.com/api",
  uat: "https:///api",
  prod: "https:///api",
} as const;

type AppEnv = keyof typeof API_URLS;

const appEnv = (process.env.APP_ENV ?? "dev") as AppEnv;

if (!(appEnv in API_URLS)) {
  throw new Error(`Invalid APP_ENV "${appEnv}".`);
}

export const config = {
  appEnv,
  apiBaseUrl: API_URLS[appEnv],
};