import { formatEventDateLabel, listEvents } from "@/lib/events-db";
import { HomeBrowse, type BrowseEvent } from "@/components/home-browse";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await listEvents();
  const browseEvents: BrowseEvent[] = events.map((event) => ({
    slug: event.slug,
    title: event.title,
    type: event.type,
    purpose: event.purpose,
    neighborhood: event.neighborhood,
    city: event.city,
    dateLabel: formatEventDateLabel(event),
  }));

  return <HomeBrowse events={browseEvents} />;
}
