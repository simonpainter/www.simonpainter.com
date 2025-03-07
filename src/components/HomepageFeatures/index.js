import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Cloud & Infrastructure',
    Svg: require('@site/static/img/cloud-feature.svg').default,
    description: (
      <>
        A place to keep thoughts on AWS, Azure, networking, and modern cloud 
        infrastructure solutions.
      </>
    ),
  },
  {
    title: 'Programming & Development',
    Svg: require('@site/static/img/code-feature.svg').default,
    description: (
      <>
        A place to keep practical programming insights, algorithms, and 
        development best practices.
      </>
    ),
  },
  {
    title: 'Security & Governance',
    Svg: require('@site/static/img/security-feature.svg').default,
    description: (
      <>
        A place to keep ideas on information security, data protection, 
        and implementing effective security strategies.
      </>
    ),
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}