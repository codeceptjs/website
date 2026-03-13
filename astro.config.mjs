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
                                    {label: 'Testing with TestCafe', link: 'testcafe'},
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
                                    {label: 'TypeScript', link: 'typescript'},
                                    {label: 'Data Management', link: 'data'},
                                    {label: 'Behavior Driven Development', link: 'bdd'},
                                    {label: 'Locators', link: 'locators'},
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
                                    {label: 'Shadow DOM', link: 'shadow'},
                                ],
                            },
                            {
                                label: 'Advanced Usage',
                                items: [
                                    {label: 'Advanced Usage', link: 'advanced'},
                                    {label: 'CodeceptUI', link: 'ui'},
                                    {label: 'Bootstrap', link: 'bootstrap'},
                                    {label: 'Reporters', link: 'reports'},
                                    {label: 'Continuous Integration', link: 'continuous-integration'},
                                    {label: 'Parallel Execution', link: 'parallel'},
                                    {label: 'Visual Testing', link: 'visual'},
                                    {label: 'Email Testing', link: 'email'},
                                    {label: 'Secrets', link: 'secrets'},
                                    {label: 'Extending', link: 'hooks'},
                                    {label: 'Concepts', link: 'internal-api'},
                                    {label: 'Testing React Applications', link: 'react'},
                                    {label: 'Testing with AI', link: 'ai'},
                                    {label: 'Self-Healing Tests', link: 'heal'},
                                    {label: 'Testing with Protractor', link: 'angular'},
                                    {label: 'Testing Vue Apps', link: 'vue'},
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
                                    {label: 'WebDriver', link: 'helpers/web-driver'},
                                    {label: 'Puppeteer', link: 'helpers/puppeteer'},
                                    {label: 'Puppeteer Firefox', link: 'helpers/puppeteer-firefox'},
                                    {label: 'TestCafe', link: 'helpers/test-cafe'},
                                    {label: 'Protractor (Legacy)', link: 'helpers/protractor'},
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
                                    {label: 'MockRequest', link: 'helpers/mock-request'},
                                ],
                            },
                            {
                                label: 'Other Helpers',
                                items: [
                                    {label: 'OpenAI', link: 'helpers/open-ai'},
                                    {label: 'FileSystem', link: 'helpers/file-system'},
                                    {label: 'Expect', link: 'helpers/expect'},
                                    {label: 'SoftExpectHelper', link: 'helpers/soft-expect-helper'},
                                    {label: 'MockServer', link: 'helpers/mock-server'},
                                    {label: 'Custom Helpers', link: 'custom-helpers'},
                                    {label: 'Community Helpers', link: 'helpers/community-helpers'},
                                ],
                            },
                        ]
                    },
                    {
                        label: 'Wiki',
                        link: '/wiki/home/',
                        items: [
                            {label: 'Wiki', autogenerate: {directory: 'wiki/'}},
                        ],
                    },
                    {
                        label: 'blog',
                        link: '/blog',
                        items: [
                            {label: 'blog', autogenerate: {directory: 'blog/'}},
                        ],
                    },
                ], {
                    exclude: ['/404'],
                    topics: {
                        documentation: ['/mobile-react-native-locators'],
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

