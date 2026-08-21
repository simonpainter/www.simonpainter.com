// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';
import backlinksPlugin from 'docusaurus-plugin-backlinks';

// WCAG 2 AA-compliant version of the GitHub light theme.
// The original theme has 5 token colours that fall below 4.5:1 on its
// #f6f8fa background; the replacements below all clear that threshold.
const accessibleGithubTheme = {
  ...prismThemes.github,
  styles: prismThemes.github.styles.map((entry) => {
    switch (entry.style.color) {
      case '#999988': // comment/prolog/doctype/cdata — was 2.7:1
        return { ...entry, style: { ...entry.style, color: '#6b7280' } };
      case '#e3116c': // string/attr-value — was 4.3:1
        return { ...entry, style: { ...entry.style, color: '#b5195c' } };
      case '#36acaa': // entity/number/boolean/variable/constant — was 2.6:1
        return { ...entry, style: { ...entry.style, color: '#187272' } };
      case '#00a4db': // atrule/keyword/attr-name/selector — was 2.7:1
        return { ...entry, style: { ...entry.style, color: '#006fa6' } };
      case '#d73a49': // function/deleted/tag — was 4.3:1
        return { ...entry, style: { ...entry.style, color: '#b5192d' } };
      default:
        return entry;
    }
  }),
};

// WCAG 2 AA-compliant version of the Dracula dark theme.
// The comment colour rgb(98,114,164) is 3.0:1 on #282A36; replaced with a
// lighter value that reaches 4.8:1.
const accessibleDraculaTheme = {
  ...prismThemes.dracula,
  styles: prismThemes.dracula.styles.map((entry) =>
    entry.types.includes('comment')
      ? { ...entry, style: { ...entry.style, color: 'rgb(136, 150, 188)' } }
      : entry,
  ),
};

function quietBacklinksPlugin(context, options) {
  const plugin = backlinksPlugin(context, options);
  return {
    ...plugin,
    async postBuild(params) {
      const originalWarn = console.warn;
      console.warn = (...args) => {
        if (typeof args[0] === 'string' &&
          args[0].includes('[backlinks-plugin] postBuild hook, NOT resolved Url')) {
          return;
        }
        originalWarn(...args);
      };
      try {
        await plugin.postBuild?.(params);
      } finally {
        console.warn = originalWarn;
      }
    },
  };
}

/** @type {import('@docusaurus/types').Config} */
const config = {

  title: 'Simon Painter',
  tagline: 'Esoteric musings of a cloud and networking professional',
  favicon: 'img/favicon.ico',

  url: 'https://www.simonpainter.com',
  baseUrl: '/',

  organizationName: 'simonpainter',
  projectName: 'www.simonpainter.com',

  onBrokenLinks: 'warn',


  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
    hooks: {
        onBrokenMarkdownLinks: 'warn',
      },
  },
  themes: ['@docusaurus/theme-mermaid'],
  clientModules: [require.resolve('./src/scripts/mermaid_icons.js')],

  plugins: [
    function suppressVscodeLanguageServerTypesWarning() {
      return {
        name: 'suppress-vscode-languageserver-types-warning',
        configureWebpack() {
          return {
            ignoreWarnings: [
              // vscode-languageserver-types uses a UMD dynamic require() that
              // webpack can't statically analyse. The warning is benign.
              {
                module: /vscode-languageserver-types/,
                message: /Critical dependency: require function is used in a way/,
              },
            ],
          };
        },
      };
    },
    quietBacklinksPlugin,
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'updates',
        routeBasePath: '/updates',
        path: './updates',
        blogTitle: 'Cloud Updates',
        blogDescription: 'Azure and cloud release notes and announcements',
        postsPerPage: 'ALL',
        blogSidebarTitle: 'All updates',
        blogSidebarCount: 'ALL',
        showReadingTime: true,
        sortPosts: 'descending',
        feedOptions: {
          xslt: true,
        },
      },
    ],
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'field-notes',
        routeBasePath: '/field-notes',
        path: './field-notes',
        authorsMapPath: './authors.yml',
        blogTitle: "Huckleberry's Field Notes",
        blogDescription: "Huckleberry's weekly networking field notes and roundups",
        postsPerPage: 'ALL',
        blogSidebarTitle: 'All field notes',
        blogSidebarCount: 'ALL',
        showReadingTime: true,
        sortPosts: 'descending',
        feedOptions: {
          xslt: true,
        },
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {
            from: '/generally-available-azure-virtual-network-updates-default-limits-increased-for-nsgs-and-route-tables',
            to: '/updates/generally-available-azure-virtual-network-updates-default-limits-increased-for-nsgs-and-route-tables',
          },
          {
            from: '/launched-generally-available-managed-virtual-network-for-evaluations-in-microsoft-foundry',
            to: '/updates/launched-generally-available-managed-virtual-network-for-evaluations-in-microsoft-foundry',
          },
          {
            from: '/public-preview-summarized-advertised-gateway-prefixes-for-route-advertisement',
            to: '/updates/public-preview-summarized-advertised-gateway-prefixes-for-route-advertisement',
          },
          {
            from: '/field-notes-week-one',
            to: '/field-notes/field-notes-week-one',
          },
          {
            from: '/how-huck-writes-this-column',
            to: '/field-notes/how-huck-writes-this-column',
          },
          {
            from: '/bgp-origin-cloudflare-internal-dns-azure-ddos',
            to: '/field-notes/bgp-origin-cloudflare-internal-dns-azure-ddos',
          },
          {
            from: '/private-origins-and-an-australian-bgp-wobble',
            to: '/field-notes/private-origins-and-an-australian-bgp-wobble',
          },
          {
            from: '/mcp-stateless-route-server-multi-region-network-firewall-proxy-private-link-ipv6',
            to: '/field-notes/mcp-stateless-route-server-multi-region-network-firewall-proxy-private-link-ipv6',
          },
          {
            from: '/post-quantum-origins-cloudflare-q2-disruptions-afd-edge-actions',
            to: '/field-notes/post-quantum-origins-cloudflare-q2-disruptions-afd-edge-actions',
          },
          {
            from: '/quiet-week-cloud-wan-routing-policy-post-quantum-clock',
            to: '/field-notes/quiet-week-cloud-wan-routing-policy-post-quantum-clock',
          },
          {
            from: '/tgw-cloudwan-mcp-expressroute-revisited-ipspace-returns',
            to: '/field-notes/tgw-cloudwan-mcp-expressroute-revisited-ipspace-returns',
          },
          {
            from: '/encrypted-dns-leaks-and-azure-shipping-plumbing',
            to: '/field-notes/encrypted-dns-leaks-and-azure-shipping-plumbing',
          },
          {
            from: '/united-airlines-nat-front-door-tenant-isolation-ml-dsa-pragmatism',
            to: '/field-notes/united-airlines-nat-front-door-tenant-isolation-ml-dsa-pragmatism',
          },
          {
            from: '/al-dnssec-front-door-edge-actions-aws-extranet',
            to: '/field-notes/al-dnssec-front-door-edge-actions-aws-extranet',
          },
        ],
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          editUrl: 'https://github.com/simonpainter/www.simonpainter.com/blob/main/',
          routeBasePath: '/',
          blogTitle: 'Simon Painter',
          blogDescription: 'A collection of articles on cloud, programming, networking, and more',
          postsPerPage: 'ALL',
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          showReadingTime: true,
          sortPosts: 'descending',
          feedOptions: {
            xslt: true,
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
              
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      image: 'img/social-card.png',
      metadata: [
        {name: 'keywords', content: 'blog, tech, cloud, programming, azure, aws, networking, security'},
        {name: 'twitter:card', content: 'summary_large_image'},
        {name: 'og:type', content: 'website'},
        {name: 'og:title', content: 'Simon Painter'},
    {name: 'og:description', content: 'A collection of articles on cloud, programming, networking, and more'},
      ],
      navbar: {
        hideOnScroll: false,
        logo: {
          alt: 'Simon Painter Logo',
          src: 'img/mvp.png',
          srcDark: 'img/mvp_light.png',
        },
      items: [
          {
            to: '/',
            label: 'Home',
            position: 'left',
            exact: true,
          },
          {
            to: '/updates',
            label: 'Cloud Updates',
            position: 'left',
          },
          {
            to: '/field-notes',
            label: 'Field Notes',
            position: 'left',
          },
          {
            href: '/tags/azure',
            label: 'Azure',
            position: 'left',
          },
          {
            href: '/tags/aws',
            label: 'AWS',
            position: 'left',
          },
          {
            href: '/tags/networks',
            label: 'Networks',
            position: 'left',
          },
          {
            href: '/tags/security',
            label: 'Security',
            position: 'left',
          },
          {
            to: '/authors/simonpainter',
            label: 'About me',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Content',
            items: [
              {
                label: 'All Posts',
                to: '/',
              },
              {
                label: 'Cloud Updates',
                to: '/updates',
              },
              {
                label: 'Field Notes',
                to: '/field-notes',
              },
              {
                label: 'All Tags',
                to: '/tags',
              },
            ],
          },
          {
            title: 'Connect',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/simonpainter',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/sipainter/',
              },
            ],
          },
          {
            title: 'Projects',
            items: [
              {
                label: 'Refried Bean',
                href: 'https://www.refriedbean.uk',
              },
              {
                label: 'Connectivity Matters',
                href: 'https://www.connectivitymatters.uk',
              },
            ],
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Simon Painter`,
      },
      ...(process.env.ALGOLIA_APP_ID && process.env.ALGOLIA_API_KEY ? {
        algolia: {
          appId: process.env.ALGOLIA_APP_ID,
          apiKey: process.env.ALGOLIA_API_KEY,
          indexName: process.env.ALGOLIA_INDEX_NAME || 'simonpainter',
          ...(process.env.ALGOLIA_ASSISTANT_ID ? {
            askAi: process.env.ALGOLIA_ASSISTANT_ID,
          } : {}),
        },
      } : {}),
      prism: {
        theme: accessibleGithubTheme,
        darkTheme: accessibleDraculaTheme,
        additionalLanguages: ['bash', 'diff', 'json', 'yaml', 'markdown'],
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
    }),
};

export default config;
