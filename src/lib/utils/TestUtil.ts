import { dev } from '$app/environment';

const IS_DEBUG = dev; // Debug everything on FiveM and Web.
const IS_WEB_DEBUG = IS_DEBUG && true; // Only debug on Web.

export { IS_DEBUG, IS_WEB_DEBUG };