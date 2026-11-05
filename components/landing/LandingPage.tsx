import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { AuthHeaderActions } from '@/components/auth/AuthHeaderActions';
import { EditorialPortfolio } from '@/components/portfolio/EditorialPortfolio';
import { CREATE_PORTFOLIO_HREF } from '@/lib/portfolio-routes';
import { BuildScene } from './BuildScene';
import { samplePortfolio } from './sample';
import styles from './landing.module.css';

function Wordmark() {
  return (
    <Link href="/" className={styles.wordmark} aria-label="Portlyfolio home">
      <svg viewBox="0 0 26 26" width="26" height="26" aria-hidden="true">
        <path d="M3 4.5h14.5L23 10v11.5H8.5L3 16V4.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8.5 21.5V10H23M8.5 10 3 4.5m14.5 0V10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 14h7.5M12 17.5h4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <span>portlyfolio<span className={styles.domain}>.site</span></span>
    </Link>
  );
}

function CreateLink() {
  return (
    <Link href={CREATE_PORTFOLIO_HREF} className={styles.primary}>
      Create your portfolio <ArrowUpRight size={18} aria-hidden="true" />
    </Link>
  );
}

export function LandingPage() {
  return (
    <div className={styles.landing}>
      <a className={styles.skip} href="#main-content">Skip to content</a>
      <header>
        <div className={styles.headerInner}>
          <Wordmark />
          <nav className={styles.headerNav} aria-label="Main navigation">
            <a className={styles.sampleNav} href="#sample">Example</a>
            <Link href="/explore">Explore</Link>
            <AuthHeaderActions appearance="landing" />
          </nav>
        </div>
      </header>

      <main id="main-content">
        <section className={styles.story} data-build-story aria-labelledby="home-title">
          <div className={styles.intro} id="identity">
            <h1 id="home-title">A place for<br /><em>your best work.</em></h1>
            <p>Build a portfolio for the work you’re proud of. Add your projects, pick a layout, and publish a page you can share.</p>
            <div className={styles.heroActions}>
              <CreateLink />
              <a className={styles.textLink} href="#sample">See an example <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
            <a href="#work" className={styles.scrollCue}>
              <span><ArrowDown size={14} aria-hidden="true" /></span> Follow the build
            </a>
          </div>

          <div className={styles.sceneColumn}>
            <BuildScene />
          </div>

          <div className={styles.chapters}>
            <section id="work" className={styles.chapter}>
              <h2>Put the work first.</h2>
              <p>Give each project an image and a short description. Tell people what you made, what you did, and where to see it.</p>
            </section>
            <section id="publish" className={styles.chapter}>
              <h2>Make it yours.</h2>
              <p>Choose Paper or Ink, preview your page, and publish it under your own URL. The cursors assemble your real work on your published page.</p>
              <a href="#sample" className={styles.textLink}>Open the finished example <ArrowDown size={16} aria-hidden="true" /></a>
            </section>
          </div>
        </section>

        <section id="sample" aria-label="Example portfolio">
          <EditorialPortfolio portfolio={samplePortfolio} mode="example" />
        </section>

        <section className={styles.close} aria-labelledby="close-title">
          <div className={styles.closeInner}>
            <h2 id="close-title">Your work.<br /><em>Your own link.</em></h2>
            <div>
              <p>Start with one project. Add more as you go.</p>
              <CreateLink />
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Wordmark />
        <Link href="/explore">Browse public portfolios <ArrowRight size={16} aria-hidden="true" /></Link>
      </footer>
    </div>
  );
}
