import { defineConfig } from 'astro/config';

import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
	site: 'https://rootenginear.github.io',
	base: '/25th-parliament-meeting',
	integrations: [
		compress({
			html: {
				collapseWhitespace: true,
				ignoreCustomFragments: [/<p itemprop="articleBody">[\S\s]+?<\/p>/],
				removeComments: true,
				removeRedundantAttributes: true
			},
			img: false
		})
	]
});
