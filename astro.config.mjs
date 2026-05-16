import { loadEnvFile } from 'node:process';
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
import rehypeInjectFigure from './src/lib/rehype-inject-figure.mjs';
import rehypeSearchStrip from './src/lib/rehype-search-strip.mjs';

loadEnvFile(); // Loads default .env file

const options = {
    collectionBase: false,
};

// Figures injected into synced docs after a specific heading. Lets us enrich
// upstream-managed pages without editing the markdown (which gets overwritten
// on `pnpm sync:docs`). Add a row per figure — no plugin edits needed.
//   slug         — page slug relative to src/content/docs (no extension)
//   afterHeading — heading text to find (case-insensitive, trimmed)
//   before       — if true, insert immediately *before* the matched heading
//                  (useful when the figure introduces the section)
//   replace      — optional HTML tagName to swap with the figure within that
//                  section (e.g. 'table'). If omitted, the figure is inserted
//                  immediately after the heading.
//   src          — image path under /public
//   alt          — required for a11y
//   width/height — optional, recommended to avoid layout shift
//   caption      — optional <figcaption> text
//   className    — optional, defaults to "injected-figure"
const figureInjections = [
    {
        slug: 'agents',
        afterHeading: 'The loop',
        src: '/agents-loop.svg',
        alt: 'CodeceptJS agentic testing loop: Open → Read → Try → Verify → Commit, with a live-feedback loop returning to the start.',
        width: 1700,
        height: 580,
    },
    {
        slug: 'basics',
        afterHeading: 'How It Works',
        src: '/helpers-delegation.svg',
        alt: 'CodeceptJS delegates every I.* command to a configurable helper engine: Playwright (Chromium, Firefox, WebKit — auto-waiting and network mocking, the modern default), WebDriver (W3C protocol — runs on Selenium Grid and cloud vendors), Puppeteer (Chromium via DevTools — lightweight, Chrome-only), or Appium (real iOS and Android devices, the same I.* API). Tests call the actor, never the engine, so backends can be swapped.',
        width: 1120,
        height: 620,
    },
    {
        slug: 'pageobjects',
        afterHeading: 'Dependency Injection',
        before: true,
        src: '/pageobjects-di.svg',
        alt: 'CodeceptJS dependency injection: register page objects in codecept.conf.js, inject them by name into Scenarios or other page objects via inject(); inject() returns lazy proxies, so circular page-object references that a plain import would leave undefined resolve at call time.',
        width: 2450,
        height: 710,
    },
    {
        slug: 'locators',
        afterHeading: 'Locator types at a glance',
        before: true,
        src: '/locators.svg',
        alt: 'CodeceptJS locator strategies in preference order: Semantic + Context, ARIA Role, CSS, and XPath as a last resort.',
        width: 3050,
        height: 590,
    },
    {
        slug: 'test-structure',
        afterHeading: 'Feature',
        before: true,
        src: '/test-structure.svg',
        alt: 'CodeceptJS test file structure: a required Feature wraps optional BeforeSuite/Before hooks, one or more required Scenarios, and optional After/AfterSuite hooks.',
        width: 1890,
        height: 1282,
    },
    {
        slug: 'data',
        afterHeading: 'Data Objects',
        src: '/data-management.svg',
        alt: 'CodeceptJS Data Object lifecycle inside a Scenario: Data Preparation creates records via data objects (posts.createPost, comments.createComment), the Test interacts with that data, then Data Cleanup runs automatically (comments._after, posts._after) in reverse order at the end of the scenario.',
        width: 980,
        height: 774,
    },
    {
        slug: 'data',
        afterHeading: 'Data Generation with Factories',
        src: '/data-factories.svg',
        alt: 'CodeceptJS data factories lifecycle: inside a Scenario, Data Generation builds records via factories (I.have, I.haveMultiple), the Test interacts with that data, then Cleanup runs automatically afterwards — the ApiDataFactory helper sends DELETE requests for every built record in reverse order.',
        width: 980,
        height: 774,
    },
    {
        slug: 'retry',
      afterHeading: 'Retry Levels',
        before: true,
        src: '/retry-levels.svg',
        alt: 'CodeceptJS retry scopes from narrowest to widest: Helper Retries (built-in — every browser action retries for ~5s), Automatic Step Retry (the retryFailedStep plugin, enabled by default — failed steps retry on their own), Manual Step Retry (step.retry — explicit retry and timing for one flaky step), Retry a Block (retryTo around steps that must pass together), Scenario Retry (re-run the whole test on failure), Feature Retry (re-run every test in a feature), and Global Retry (config.retry — retry tests by grep across the whole run). Start with the smallest scope that fixes the flakiness.',
        width: 980,
        height: 1184,
    },
    {
        slug: 'timeouts',
        afterHeading: 'Step Timeout',
        before: true,
        src: '/timeout-levels.svg',
        alt: 'CodeceptJS timeout levels from narrowest to widest: Helper Timeouts (per browser action, in milliseconds), Step Timeout (step.timeout on a single step, in seconds), Scenario Timeout (cap the whole test), Feature Timeout (cap every test in a feature), and Global Timeout (config default for every test, refinable by grep). All test-level timeouts are measured in seconds.',
        width: 980,
        height: 900,
    },
    {
        slug: 'agents',
        afterHeading: 'Skills bundle',
        replace: 'table',
        src: '/skills-bundle.svg',
        alt: 'CodeceptJS skills bundle: Write Tests, Debug Tests, Clean Code, and CI Auto-fix shown as a 4-step staircase of perspective cards.',
        width: 2030,
        height: 1179,
        captionHtml:
            'Also available: ' +
            '<code>/codeceptjs-fundamentals</code> · ' +
            '<code>/codeceptjs-exploration</code> · ' +
            '<code>/codeceptjs-run-analysis</code> · ' +
            '<code>/codeceptjs-auth</code>',
    },
];

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
                        label: 'Guides',
                        link: 'quickstart',
                        items: [
                            {
                            label: 'Setup',
                            items: [
                              { label: 'Quickstart', link: 'quickstart' },
                              { label: 'Installation', link: 'installation' },
                              { label: 'Upgrade', link: 'migration-4' },
                              { label: 'Migrate from Cypress.io', link: 'migrate-from-cypress' },
                              { label: 'Migrate from Java Selenium', link: 'migrate-from-java' },
                              { label: 'Migrate from TestCafe', link: 'migrate-from-testcafe' },
                              { label: 'Migrate from Protractor', link: 'migrate-from-protractor' },
                              ]
                            },
                            {
                                label: 'Basics',
                                items: [
                                  { label: 'Web Basics', link: 'basics' },
                                  {label: 'Agentic Testing', link: 'agents'},
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
                                    {label: 'Element Functions', link: 'els'},
                                    {label: 'WebElement', link: 'web-element'},
                                ],
                            },
                            {
                                label: 'Advanced Usage',
                                items: [
                                  { label: 'TypeScript', link: 'typescript' },
                                    {label: 'Continuous Integration', link: 'continuous-integration'},
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
                                    {label: 'Architecture', link: 'architecture'},
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
                                    {label: 'Cheatsheet', link: 'cheatsheet'},
                                ],
                            },
                        ],
                    },

                    {
                        id: 'reference',
                        label: 'Reference',
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
                                    {label: 'FileSystem', link: 'helpers/file-system'},
                                    {label: 'Expect', link: 'helpers/expect'},
                                ],
                            },
                            {
                                label: 'Plugins',
                                items: [
                                    {label: 'auth', link: 'plugins/auth'},
                                    {label: 'autoDelay', link: 'plugins/auto-delay'},
                                    {label: 'browser', link: 'plugins/browser'},
                                    {label: 'pause', link: 'plugins/pause'},
                                    {label: 'pauseOnFail', link: 'plugins/pause-on-fail'},
                                    {label: 'retryFailedStep', link: 'plugins/retry-failed-step'},
                                    {label: 'stepTimeout', link: 'plugins/step-timeout'},
                                ],
                            },
                            {
                                label: 'AI Plugins',
                                items: [
                                    {label: 'aiTrace', link: 'plugins/ai-trace'},
                                    {label: 'analyze', link: 'plugins/analyze'},
                                    {label: 'heal', link: 'plugins/heal'},
                                ],
                            },
                            {
                                label: 'Diagnostics Plugins',
                                items: [
                                    {label: 'pageInfo', link: 'plugins/page-info'},
                                    {label: 'screencast', link: 'plugins/screencast'},
                                    {label: 'screenshot', link: 'plugins/screenshot'},
                                    {label: 'screenshotOnFail', link: 'plugins/screenshot-on-fail'},
                                ],
                            },
                            {
                                label: 'Reporter Plugins',
                                items: [
                                    {label: 'customReporter', link: 'plugins/custom-reporter'},
                                    {label: 'junitReporter', link: 'plugins/junit-reporter'},
                                ],
                            },
                            {
                                label: 'Utility Plugins',
                                items: [
                                    {label: 'coverage', link: 'plugins/coverage'},
                                    {label: 'customLocator', link: 'plugins/custom-locator'},
                                    {label: 'expose', link: 'plugins/expose'},
                                ],
                            },
                        ]
                    },
                    {
                        id: 'blog',
                        label: 'Blog',
                        link: '/blog/codeceptjs-4/',
                        items: [
                            {label: 'Blog', autogenerate: {directory: 'blog/'}},
                        ],
                    },
                ], {
                    exclude: [
                        '/',
                        '/advanced',
                        '/changelog',
                        '/email',
                        '/helpers/community-helpers',
                        '/helpers/protractor',
                        '/helpers/puppeteer-firefox',
                        '/internal-api',
                        '/internal-test-server',
                        '/mobile-react-native-locators',
                        '/react',
                        '/ui',
                        '/videos',
                        '/visual',
                        '/vue',
                    ],
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
        plugins: [
            tailwindcss(),
            {
                // rehypeInjectFigure reads diagram SVGs from /public at render
                // time; Vite doesn't know about that dependency, so editing a
                // diagram wouldn't refresh the page in `astro dev`. Force a full
                // reload when any /public/*.svg changes.
                name: 'reload-on-public-svg-change',
                handleHotUpdate({file, server}) {
                    const f = file.replace(/\\/g, '/');
                    if (f.includes('/public/') && f.endsWith('.svg')) {
                        server.ws.send({type: 'full-reload'});
                        return [];
                    }
                },
            },
        ],
        build: {
            assetsInlineLimit: 0,
        },
    },
    markdown: {
        rehypePlugins: [
            [rehypeAstroRelativeMarkdownLinks, options],
            [rehypeInjectFigure, { injections: figureInjections }],
            rehypeSearchStrip,
        ],
    },
});
