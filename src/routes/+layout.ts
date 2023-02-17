// If you want to generate a static html file for your page.
// Documentation: https://kit.svelte.dev/docs/page-options#prerender
export const prerender = true;

// If you want to Generate a SPA you have to set ssr to false.
// This is not the case (so set as true or comment the line)
// Documentation: https://kit.svelte.dev/docs/page-options#ssr
export const ssr = false;

// How to manage the trailing slashes in the URLs:
// The URL for about page will be /about with 'ignore' (default)
// The URL for about page will be /about/ with 'always'
// https://kit.svelte.dev/docs/page-options#trailingslash
export const trailingSlash = 'ignore';