import { useState } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./index.module.css";

const examples = [
  {
    id: "github-action",
    label: "GitHub Action",
    description: "Release workflow with deploy inputs and runtime files.",
    language: "yaml",
    code: [
      "uses: BootstrapLaboratory/rush-delivery@v0.3.4",
      "with:",
      '  dry-run: "false"',
      "  toolchain-image-provider: github",
      "  rush-cache-provider: github",
      "  runtime-file-map: |",
      "    ${{ steps.auth.outputs.credentials_file_path }}=>gcp-credentials.json",
      "  deploy-env: |",
      "    GCP_PROJECT_ID=${{ vars.GCP_PROJECT_ID }}",
    ].join("\n"),
  },
  {
    id: "dagger-cli",
    label: "Dagger CLI",
    description: "The same module call from a shell or another CI provider.",
    language: "sh",
    code: [
      "dagger -m github.com/BootstrapLaboratory/rush-delivery@v0.3.4 call workflow \\",
      '  --git-sha="${GITHUB_SHA}" \\',
      '  --event-name="${GITHUB_EVENT_NAME}" \\',
      "  --source-mode=git \\",
      '  --source-repository-url="${SOURCE_REPOSITORY_URL}" \\',
      '  --source-ref="${SOURCE_REF}" \\',
      "  --source-auth-token-env=GITHUB_TOKEN",
    ].join("\n"),
  },
  {
    id: "pr-validation",
    label: "PR Validation",
    description: "Read-only validation that reuses published CI artifacts.",
    language: "yaml",
    code: [
      "uses: BootstrapLaboratory/rush-delivery@v0.3.4",
      "with:",
      "  entrypoint: validate",
      "  toolchain-image-provider: github",
      "  toolchain-image-policy: pull-or-build",
      "  rush-cache-provider: github",
      "  rush-cache-policy: pull-or-build",
    ].join("\n"),
  },
];

const capabilities = [
  {
    title: "Isolated",
    description:
      "Run every stage in an isolated Dagger environment, even locally, with each stage receiving only the secrets it is allowed to use.",
  },
  {
    title: "Portable",
    description:
      "Call the same workflow from local development, other CI providers, or deeper stage-level debugging.",
  },
  {
    title: "Complete",
    description:
      "Manage the full CI cycle from changed-target detection through validation, build, package, release, and deployment.",
  },
];

function HeroDiagram() {
  const diagramSrc = useBaseUrl("/img/rush-delivery-orbital-pipeline.svg");

  return (
    <img
      className={styles.heroDiagram}
      src={diagramSrc}
      alt="Rush plus project metadata flows into Rush Delivery, which connects to planned deploys, PR checks, releases, and versioning."
      decoding="async"
    />
  );
}

function ExampleSwitcher() {
  const [activeId, setActiveId] = useState(examples[0].id);
  const activeExample =
    examples.find((example) => example.id === activeId) ?? examples[0];

  function activateExample(index: number) {
    const nextExample = examples[index];
    setActiveId(nextExample.id);
    requestAnimationFrame(() => {
      document.getElementById(`example-tab-${nextExample.id}`)?.focus();
    });
  }

  return (
    <section className={styles.exampleSwitcher} aria-label="Workflow examples">
      <div
        className={styles.exampleTabs}
        role="tablist"
        aria-orientation="vertical"
      >
        {examples.map((example, index) => {
          const isActive = example.id === activeExample.id;

          return (
            <button
              key={example.id}
              type="button"
              id={`example-tab-${example.id}`}
              className={clsx(
                styles.exampleTab,
                isActive && styles.exampleTabActive,
              )}
              role="tab"
              aria-selected={isActive}
              aria-controls={`example-panel-${example.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveId(example.id)}
              onKeyDown={(event) => {
                const isForward =
                  event.key === "ArrowDown" || event.key === "ArrowRight";
                const isBackward =
                  event.key === "ArrowUp" || event.key === "ArrowLeft";

                if (!isForward && !isBackward) return;

                event.preventDefault();
                const offset = isForward ? 1 : -1;
                activateExample(
                  (index + offset + examples.length) % examples.length,
                );
              }}
            >
              {example.label}
              <span>{example.description}</span>
            </button>
          );
        })}
      </div>
      <div
        id={`example-panel-${activeExample.id}`}
        className={styles.examplePanel}
        role="tabpanel"
        aria-labelledby={`example-tab-${activeExample.id}`}
      >
        <div className={styles.examplePanelBar}>
          <span />
          <span />
          <span />
          <strong>{activeExample.language}</strong>
        </div>
        <pre>
          <code>{activeExample.code}</code>
        </pre>
      </div>
    </section>
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
            <p className={styles.eyebrow}>Dagger module for Rush monorepos</p>
            <Heading as="h1" className={styles.heroTitle}>
              DETECT/<wbr />
              BUILD/<wbr />
              PACKAGE/<wbr />
              DEPLOY/<wbr />
              VALIDATE
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
                to="/docs/tutorial"
              >
                Tutorial
              </Link>
            </div>
          </div>
          <HeroDiagram />
        </section>

        <ExampleSwitcher />

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
