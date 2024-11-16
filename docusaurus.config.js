// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Articles',
  tagline: 'Somewhere to keep things',
  favicon: 'img/favicon.ico',

  url: 'http://www.simonpainter.com.s3-website.eu-west-2.amazonaws.com',
  baseUrl: '/',

  organizationName: 'simonpainter',
  projectName: 'docusaurus',

  // Change this to 'warn' temporarily to help debug
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js')
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
              
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',
      navbar: {
        title: 'A place to keep things',
        logo: {
          src: 'img/logo.svg',
          alt: 'Site Logo'
        },
        items: [
          {
            href: 'https://github.com/simonpainter',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Links',
            items: [
              {
                label: 'Github',
                href: 'https://github.com/simonpainter',
              },
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/sipainter/',
              },
            ],
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Simon Painter`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
