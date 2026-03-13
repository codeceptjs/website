import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightImageZoom from 'starlight-image-zoom';
import rehypeAstroRelativeMarkdownLinks from "astro-rehype-relative-markdown-links";
import starlightScrollToTop from 'starlight-scroll-to-top';

const options = {
    collectionBase: false,
};

export default defineConfig({
    site: 'https://codecept.io',
    integrations: [
        starlight({
            expressiveCode: {
                themes: ['github-dark', 'dracula'],
            },
            disable404Route: true,
            title: '',
            favicon: '/favicon.svg',
            social: [
                {icon: 'github', label: 'GitHub', href: 'https://github.com/codeceptjs/CodeceptJS'},
            ],
            components: {
                Head: "./src/components/Head.astro",
                PageFrame: "./src/components/PageFrame.astro",
                PageTitle: './src/components/PageTitle.astro',
                PageSidebar: './src/components/PageSidebar.astro',
                Footer: './src/components/Footer.astro',
                SiteTitle: './src/components/SiteTitle.astro',
                Search: './src/components/Search.astro',
                SocialIcons: './src/components/Links.astro',
            },
            customCss: [
                './src/styles/custom.css',
                './src/styles/global.css',
            ],
            plugins: [
                starlightImageZoom(),
                starlightSidebarTopics([
                    {
                        id: 'documentation',
                        label: 'Documentation',
                        link: 'quickstart',
                        items: [
                            {
                                label: 'Web Testing',
                                items: [
                                    {label: 'Web Basics', link: 'basics'},
                                    {label: 'Testing with Playwright', link: 'playwright'},
                                    {label: 'Testing with WebDriver', link: 'webdriver'},
                                    {label: 'Testing with Puppeteer', link: 'puppeteer'},
                                    {label: 'Testing React Applications', link: 'react'},
                                    {label: 'Testing Vue Apps', link: 'vue'},
                                ],
                            },
                            {
                                label: 'Mobile Testing',
                                items: [
                                    {label: 'Mobile Testing with Appium', link: 'mobile'},
                                    {label: 'Testing React Native with Detox', link: 'detox'},
                                ],
                            },
                            {
                                label: 'Organizing Tests',
                                items: [
                                    {label: 'Page Objects', link: 'pageobjects'},
                                    {label: 'Data Management', link: 'data'},
                                    {label: 'Behavior Driven Development', link: 'bdd'},
                                    {label: 'Locators', link: 'locators'},
                                    {label: 'Shadow DOM', link: 'shadow'},
                                    {label: 'Translation', link: 'translation'},
                                    {label: 'Best Practices', link: 'best'},
                                ],
                            },
                            {
                                label: 'API Reference',
                                items: [
                                    {label: 'Web API (Unified)', link: 'web-api'},
                                    {label: 'Mobile API (Unified)', link: 'mobile-api'},
                                    {label: 'API Testing', link: 'api'},
                                    {label: 'Commands', link: 'commands'},
                                    {label: 'Configuration', link: 'configuration'},
                                    {label: 'Plugins', link: 'plugins'},
                                    {label: 'Effects', link: 'effects'},
                                    {label: 'Element Access (els)', link: 'els'},
                                    {label: 'WebElement API', link: 'web-element'},
                                ],
                            },
                            {
                                label: 'Advanced Usage',
                                items: [
                                    {label: 'Advanced Usage', link: 'advanced'},
                                    {label: 'TypeScript', link: 'typescript'},
                                    {label: 'ESM Migration', link: 'esm-migration'},
                                    {label: 'CodeceptUI', link: 'ui'},
                                    {label: 'Bootstrap', link: 'bootstrap'},
                                    {label: 'Reporters', link: 'reports'},
                                    {label: 'Docker', link: 'docker'},
                                    {label: 'Parallel Execution', link: 'parallel'},
                                    {label: 'Retry Mechanisms', link: 'retry'},
                                    {label: 'Visual Testing', link: 'visual'},
                                    {label: 'Email Testing', link: 'email'},
                                    {label: 'Secrets', link: 'secrets'},
                                    {label: 'Extending', link: 'hooks'},
                                    {label: 'Concepts', link: 'internal-api'},
                                    {label: 'Testing with AI', link: 'ai'},
                                    {label: 'MCP Server', link: 'mcp'},
                                    {label: 'Self-Healing Tests', link: 'heal'},
                                ],
                            },
                            {
                                label: 'Resources',
                                items: [
                                    {label: 'Tutorial', link: 'tutorial'},
                                    {label: 'Examples', link: 'examples'},
                                    {label: 'Videos', link: 'videos'},
                                    {label: 'Books & Posts', link: 'books'},
                                    {label: 'Community Helpers', link: 'helpers/community-helpers'},
                                    {label: 'Changelog', link: 'changelog'},
                                ],
                            },
                        ],
                    },

                    {
                        id: 'helpers',
                        label: 'Helpers',
                        link: '/helpers/playwright/',
                        items: [
                            {
                                label: 'Web Testing',
                                items: [
                                    {label: 'Playwright', link: 'helpers/playwright'},
                                    {label: 'WebDriver', link: 'helpers/web-driver'},
                                    {label: 'Puppeteer', link: 'helpers/puppeteer'},
                                ],
                            },
                            {
                                label: 'Mobile Testing',
                                items: [
                                    {label: 'Appium', link: 'helpers/appium'},
                                    {label: 'Detox', link: 'helpers/detox'},
                                ],
                            },
                            {
                                label: 'API Helpers',
                                items: [
                                    {label: 'REST', link: 'helpers/rest'},
                                    {label: 'ApiDataFactory', link: 'helpers/api-data-factory'},
                                    {label: 'GraphQL', link: 'helpers/graph-ql'},
                                    {label: 'GraphQLDataFactory', link: 'helpers/graph-ql-data-factory'},
                                    {label: 'JSONResponse', link: 'helpers/json-response'},
                                ],
                            },
                            {
                                label: 'Other Helpers',
                                items: [
                                    {label: 'OpenAI', link: 'helpers/open-ai'},
                                    {label: 'AI', link: 'helpers/ai'},
                                    {label: 'FileSystem', link: 'helpers/file-system'},
                                    {label: 'Expect', link: 'helpers/expect'},
                                    {label: 'SoftExpectHelper', link: 'helpers/soft-expect-helper'},
                                    {label: 'MockRequest', link: 'helpers/mock-request'},
                                    {label: 'MockServer', link: 'helpers/mock-server'},
                                    {label: 'Polly', link: 'helpers/polly'},
                                    {label: 'Mochawesome', link: 'helpers/mochawesome'},
                                    {label: 'Custom Helpers', link: 'custom-helpers'},
                                ],
                            },
                        ]
                    },
                    {
                        id: 'blog',
                        label: 'Blog',
                        link: '/blog/my-first-blog-post/',
                        items: [
                            {label: 'Blog', autogenerate: {directory: 'blog/'}},
                        ],
                    },
                ], {
                    exclude: ['/404'],
                    topics: {
                        documentation: ['/mobile-react-native-locators', '/installation', '/continuous-integration', '/internal-test-server'],
                        helpers: ['/helpers/puppeteer-firefox', '/helpers/protractor'],
                    },
                }),
                starlightScrollToTop({
                    position: 'right',
                    tooltipText: 'Back to top',
                    showTooltip: true,
                    smoothScroll: true,
                    threshold: 30,
                    svgPath: 'M12 5V19M7 10L12 5L17 10',
                    svgStrokeWidth: 1,
                    borderRadius: '100',
                    showProgressRing: true,
                    progressRingColor: '#ffe680',
                }),
            ],
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
        build: {
            assetsInlineLimit: 0,
        },
    },
    markdown: {
        rehypePlugins: [
            [rehypeAstroRelativeMarkdownLinks, options],
        ],
    },
});


