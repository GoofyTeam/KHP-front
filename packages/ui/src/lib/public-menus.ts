export const buildPublicMenusBaseUrl = (origin?: string | null) => {
  const trimmedOrigin = origin?.trim();

  if (!trimmedOrigin) {
    return "https://dash.goofykhp.fr/public-menus/";
  }

  const sanitizedOrigin = trimmedOrigin.replace(/\/+$/, "");

  return `${sanitizedOrigin}/public-menus/`;
};
