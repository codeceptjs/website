import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightImageZoom from 'starlight-image-zoom';
import rehypeAstroRelativeMarkdownLinks from "astro-rehype-relative-markdown-links";

const options = {
	contentPath: 'src/content/docs',
};

export default defineConfig({
	integrations: [
		starlight({
			title: '',
			favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/codeceptjs/CodeceptJS' },
      ],
			components: {
				Head: "./src/components/Head.astro",
				PageTitle: './src/components/PageTitle.astro',
				Footer: './src/components/Footer.astro',
				SiteTitle: './src/components/SiteTitle.astro',
			},
			customCss: [
				'./src/styles/custom.css',
        		'./src/styles/global.css',
			],
			plugins: [
				starlightImageZoom(),
				starlightSidebarTopics([
					{
						label: 'Documentation',
						link: 'quickstart',
						items: [
							{
								label: 'Web Testing',
								items: [
									{ label: 'Getting Started', link: 'basics' },
									{ label: 'CodeceptUI', link: 'ui' },
									{ label: 'Testing with Playwright', link: 'playwright' },
									{ label: 'Testing with WebDriver', link: 'webdriver' },
									{ label: 'Testing with Puppeteer', link: 'puppeteer' },
									{ label: 'API Testing', link: 'api' },
									{ label: 'Testing with TestCafe', link: 'testcafe' },
								],
							},
							{
								label: 'Mobile Testing',
								items: [
									{ label: 'Mobile Testing with Appium', link: 'mobile' },
									{ label: 'Testing React Native with Detox', link: 'detox' },
								],
							},
							{
								label: 'Organizing Tests',
								items: [
									{ label: 'Page Objects', link: 'pageobjects' },
									{ label: 'TypeScript', link: 'typescript' },
									{ label: 'Data Management', link: 'data' },
									{ label: 'Behavior Driven Development', link: 'bdd' },
									{ label: 'Locators', link: 'locators' },
									{ label: 'Translation', link: 'translation' },
									{ label: 'Custom Helpers', link: 'custom-helpers' },
									{ label: 'Best Practices', link: 'best' },
								],
							},
							{
								label: 'Advanced Usage',
								items: [
									{ label: 'Advanced Usage', link: 'advanced' },
									{ label: 'Bootstrap', link: 'bootstrap' },
									{ label: 'Reporters', link: 'reports' },
									{ label: 'Continuous Integration', link: 'continuous-integration' },
									{ label: 'Parallel Execution', link: 'parallel' },
									{ label: 'Visual Testing', link: 'visual' },
									{ label: 'Email Testing', link: 'email' },
									{ label: 'Secrets', link: 'secrets' },
									{ label: 'Extending', link: 'hooks' },
									{ label: 'Concepts', link: 'internal-api' },
									{ label: 'Testing React Applications', link: 'react' },
									{ label: 'Testing with AI', link: 'ai' },
									{ label: 'Self-Healing Tests', link: 'heal' },
									{ label: 'Testing with Protractor', link: 'angular' },
									{ label: 'Testing Vue Apps', link: 'vue' },
								],
							},
						],
					},

					{
						label: 'Helpers',
						link: '/helpers/playwright/',
						items: [
							{
								label: 'Web Testing',
								items: [
									{ label: 'WebDriver', link: 'helpers/web-driver' },
									{ label: 'Puppeteer', link: 'helpers/puppeteer' },
									{ label: 'TestCafe', link: 'helpers/test-cafe' },
								],
							},
							{
								label: 'Mobile Testing',
								items: [
									{ label: 'Appium', link: 'helpers/appium' },
									{ label: 'Detox', link: 'helpers/detox' },
								],
							},
							{
								label: 'API Helpers',
								items: [
									{ label: 'REST', link: 'helpers/rest' },
									{ label: 'ApiDataFactory', link: 'helpers/api-data-factory' },
									{ label: 'GraphQL', link: 'helpers/graph-ql' },
									{ label: 'GraphQLDataFactory', link: 'helpers/graph-ql-data-factory' },
									{ label: 'JSONResponse', link: 'helpers/json-response' },
									{ label: 'MockRequest', link: 'helpers/mock-request' },
								],
							},
							{
								label: 'Other Helpers',
								items: [
									{ label: 'OpenAI', link: 'helpers/open-ai' },
									{ label: 'FileSystem', link: 'helpers/file-system' },
									{ label: 'Expect', link: 'helpers/expect' },
									{ label: 'SoftExpectHelper', link: 'helpers/soft-expect-helper' },
									{ label: 'MockServer', link: 'helpers/mock-server' },
									{ label: 'Community Helpers', link: 'community-helpers' },
								],
							},
						]
					},
					{
						label: 'Wiki',
						link: '/wiki/home/',
						items: [
							{ label: 'Wiki', autogenerate: { directory: 'wiki/' } },
						],
					},
				]),
			],
		}),
	],
  vite: { plugins: [tailwindcss()] },
	markdown: {
		rehypePlugins: [
			[rehypeAstroRelativeMarkdownLinks, options],
		],
	},
});
