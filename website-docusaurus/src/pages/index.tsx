import clsx from "clsx";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import styles from "./index.module.css";

const capabilities = [
  {
    title: "GitHub Action",
    description:
      "Use Rush Delivery as a versioned CI action that prepares Dagger, deploy env, runtime files, and Git source defaults.",
  },
  {
    title: "Dagger Module",
    description:
      "Call the same workflow from local development, other CI providers, or deeper stage-level debugging.",
  },
  {
    title: "Rush Metadata",
    description:
      "Keep deploy targets, package outputs, runtime env, cache providers, and service order in the product repository.",
  },
];

function TerminalPanel() {
  return (
    <div
      className={styles.terminalPanel}
      aria-label="Rush Delivery workflow summary"
    >
      <div className={styles.panelBar}>
        <span />
        <span />
        <span />
      </div>
      <pre>
        <code>{`uses: BootstrapLaboratory/rush-delivery@v0.3.0
with:
  dry-run: "false"
  runtime-file-map: |
    creds.json=>gcp-credentials.json
  deploy-env: |
    GCP_PROJECT_ID=production`}</code>
      </pre>
    </div>
  );
}

export default function Home() {
  return (
    <Layout
      title="Rush Delivery"
      description="Dagger-powered CI delivery framework for Rush monorepos."
    >
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Dagger-powered release framework</p>
            <Heading as="h1" className={styles.heroTitle}>
              Rush Delivery
            </Heading>
            <p className={styles.heroText}>
              A focused CI delivery layer for Rush monorepos. Detect affected
              targets, build, package, and deploy with Dagger while project
              behavior stays in metadata.
            </p>
            <div className={styles.actions}>
              <Link
                className={clsx(styles.button, styles.primary)}
                to="/docs/quick-start/github-actions"
              >
                Quick Start
              </Link>
              <Link
                className={clsx(styles.button, styles.secondary)}
                to="/docs/github-action"
              >
                GitHub Action
              </Link>
            </div>
          </div>
          <TerminalPanel />
        </section>

        <section
          className={styles.commandBand}
          aria-label="Quick install example"
        >
          <code>uses: BootstrapLaboratory/rush-delivery@v0.3.0</code>
          <span>or</span>
          <code>
            dagger -m github.com/BootstrapLaboratory/rush-delivery call workflow
          </code>
        </section>

        <section className={styles.capabilities}>
          {capabilities.map((capability) => (
            <article key={capability.title}>
              <Heading as="h2">{capability.title}</Heading>
              <p>{capability.description}</p>
            </article>
          ))}
        </section>
      </main>
    </Layout>
  );
}
