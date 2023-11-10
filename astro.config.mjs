import { defineConfig } from 'astro/config';

import Compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
	site: 'https://rootenginear.github.io',
	base: '/26th-parliament-meeting',
	integrations: [
		Compress({
			HTML: {
				'html-minifier-terser': {
					collapseWhitespace: true,
					ignoreCustomFragments: [/<p itemprop="articleBody">[\S\s]+?<\/p>/],
					removeComments: true,
					removeRedundantAttributes: true
				}
			},
			Image: false
		})
	]
});
