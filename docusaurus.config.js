// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {

  title: 'Simon Painter - MVP',
  tagline: 'Simon Painter - MVP',
  favicon: 'img/favicon.ico',

  url: 'https://www.simonpainter.com',
  baseUrl: '/',

  organizationName: 'simonpainter',
  projectName: 'www.simonpainter.com',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  
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
          blogDescription: 'Simon Painter - MVP',
          postsPerPage: 'ALL',
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          showReadingTime: true,
          sortPosts: 'descending',
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
        {name: 'og:title', content: 'Simon Painter - MVP'},
    {name: 'og:description', content: 'A collection of articles on cloud, programming, networking, and more'},
      ],
      navbar: {
        hideOnScroll: false,
        title: 'Simon Painter - MVP',

      items: [
          {
            href: '/tags',
            label: 'All Tags',
            position: 'right',
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
            href: 'https://github.com/simonpainter',
            label: 'GitHub',
            position: 'right',
          },
          {
            href: 'https://www.linkedin.com/in/sipainter/',
            label: 'LinkedIn',
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
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'diff', 'json', 'yaml', 'markdown'],
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
    }),
};

export default config;
