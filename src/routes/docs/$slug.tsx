import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/workspace/page-header";
import { guides } from "@/features/docs/content";
export const Route = createFileRoute("/docs/$slug")({
  loader: ({ params }) => {
    const guide = guides.find((g) => g.slug === params.slug);
    if (!guide) throw notFound();
    return guide;
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.title ?? "Guide"} | Technology Universe` }],
  }),
  component: Guide,
});
function Guide() {
  const guide = Route.useLoaderData();
  return (
    <AppShell>
      <Link to="/docs" className="mb-7 inline-block text-xs font-medium text-primary">
        ← All guides
      </Link>
      <PageHeader
        eyebrow={`${guide.category} / ${guide.minutes} min read`}
        title={guide.title}
        description={guide.summary}
      />
      <div className="grid items-start gap-8 xl:grid-cols-[1fr_220px]">
        <article className="surface-card space-y-9 p-6 md:p-9">
          {guide.sections.map((s, i) => (
            <section id={`section-${i + 1}`} key={s.heading} className="scroll-mt-6">
              <span className="eyebrow">0{i + 1}</span>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">{s.heading}</h2>
              <p className="mt-4 text-sm leading-8 text-muted-foreground">{s.body}</p>
            </section>
          ))}
        </article>
        <nav aria-label="On this page" className="rounded-xl border p-5">
          <p className="eyebrow mb-4">On this page</p>
          {guide.sections.map((s, i) => (
            <a
              className="block py-2 text-xs leading-5 text-muted-foreground hover:text-primary"
              href={`#section-${i + 1}`}
              key={s.heading}
            >
              {s.heading}
            </a>
          ))}
        </nav>
      </div>
    </AppShell>
  );
}
