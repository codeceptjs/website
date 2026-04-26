import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightImageZoom from 'starlight-image-zoom';
import rehypeAstroRelativeMarkdownLinks from "astro-rehype-relative-markdown-links";
import starlightScrollToTop from 'starlight-scroll-to-top';
import {codeceptDark, codeceptLight} from './src/lib/shiki-themes.ts';
import {codeceptShikiTransformer} from './src/lib/shiki-codecept-transformer.ts';

const options = {
    collectionBase: false,
};

export default defineConfig({
    site: 'https://codecept.io',
    integrations: [
        react(),
        starlight({
            expressiveCode: {
                themes: [codeceptDark, codeceptLight],
                themeCssSelector: (theme) =>
                    theme.name === 'codecept-dark'
                        ? '[data-theme="dark"]'
                        : '[data-theme="light"]',
                styleOverrides: {
                    codeFontFamily:
                        "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
                    codeFontSize: '15px',
                    codeLineHeight: '2',
                    codePaddingBlock: '1.1rem',
                    codePaddingInline: '1.1rem',
                    borderRadius: '0.5rem',
                    frames: {
                        shadowColor: 'rgba(0, 0, 0, 0.08)',
                    },
                },
                shiki: {
                    transformers: [codeceptShikiTransformer],
                },
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
                ThemeSelect: './src/components/ThemeSelect.astro',
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
                                label: 'Basics',
                                items: [
                                  { label: 'Web Basics', link: 'basics' },
                                  {label: 'Test Structure', link: 'test-structure'},
                                  { label: 'Locators', link: 'locators' },
                                  { label: 'Assertions', link: 'assertions' },
                                  { label: 'Element Testing', link: 'element-based-testing' },
                                  { label: 'Debugging', link: 'debugging' },
                                ],
                            },
                            {
                                label: 'Web & Mobile Testing',
                                items: [
                                    {label: 'Testing with Playwright', link: 'playwright'},
                                    {label: 'Testing with WebDriver', link: 'webdriver'},
                                    { label: 'Testing with Puppeteer', link: 'puppeteer' },
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
                                    {label: 'Best Practices', link: 'best'},
                                ],
                            },
                            {
                                label: 'API Reference',
                                items: [
                                    {label: 'Web API (Unified)', link: 'web-api'},
                                    {label: 'Mobile API (Unified)', link: 'mobile-api'},
                                   { label: 'API Testing', link: 'api' },
                                    {label: 'Commands', link: 'commands'},
                                    {label: 'Configuration', link: 'configuration'},
                                    {label: 'Plugins', link: 'plugins'},
                                    { label: 'Effects', link: 'effects' },
                                    {label: 'Elements', link: 'els'},
                                    {label: 'WebElement', link: 'web-element'},
                                ],
                            },
                            {
                                label: 'Advanced Usage',
                                items: [
                                    {label: 'TypeScript', link: 'typescript'},
                                    {label: 'ESM Migration', link: 'esm-migration'},
                                    {label: 'Self-Healing', link: 'heal'},
                                    { label: 'Reporting', link: 'reports' },
                                    { label: 'Element Selection', link: 'element-selection'},
                                    {label: 'Enable AI', link: 'ai'},
                                    {label: 'Docker', link: 'docker'},
                                    {label: 'Parallel Execution', link: 'parallel'},
                                   { label: 'Retries', link: 'retry' },
                                    {label: 'Timeouts', link: 'timeouts'},
                                    { label: 'Secrets', link: 'secrets' },
                                    {label: 'Within', link: 'within'},
                                    {label: 'Extending', link: 'hooks'},
                                    {label: 'Concepts', link: 'internal-api'},
                                    {label: 'MCP Server', link: 'mcp'},
                                  { label: 'Bootstrap', link: 'bootstrap' },
                                  {label: 'Shadow DOM', link: 'shadow'},
                                  {label: 'Translation', link: 'translation'},
                                ],
                            },
                            {
                                label: 'Resources',
                                items: [
                                    {label: 'Tutorial', link: 'tutorial'},
                                    {label: 'Examples', link: 'examples'},
                                    {label: 'Cheatsheet', link: 'cheatsheet'},
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
                        documentation: [
                            '/mobile-react-native-locators',
                            '/installation',
                            '/continuous-integration',
                            '/internal-test-server',
                            '/advanced',
                            '/books',
                            '/changelog',
                            '/email',
                            '/react',
                            '/ui',
                            '/videos',
                            '/visual',
                            '/vue',
                            '/community-helpers-page',
                        ],
                        helpers: [
                            '/helpers/puppeteer-firefox',
                            '/helpers/protractor',
                            '/helpers/community-helpers',
                        ],
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
        resolve: {
            alias: {
                zod: 'zod/v3',
            },
        },
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
