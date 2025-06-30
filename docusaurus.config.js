// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Connectivity Matters',
  favicon: 'img/favicon.ico',

  url: 'https://www.connectivitymatters.uk',
  baseUrl: '/',

  organizationName: 'simonpainter',
  projectName: 'my-website',

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
          editUrl: 'https://github.com/simonpainter/my-website/blob/connectivitymatters.uk/',
          routeBasePath: '/',
          blogTitle: 'Connectivity Matters',
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
        {name: 'og:title', content: 'Connectivity Matters Blog'},
        {name: 'og:description', content: 'A collection of articles on cloud, programming, networking, and more'},
      ],
      navbar: {
        hideOnScroll: false,
        logo: {
          src: 'img/logo.png',
          alt: 'Connectivity Matters Logo'
        },
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
            href: '/tags/programming',
            label: 'Programming',
            position: 'left',
          },
          {
            href: '/tags/security',
            label: 'Security',
            position: 'left',
          },
          {
            href: '/tags/business',
            label: 'Business',
            position: 'left',
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