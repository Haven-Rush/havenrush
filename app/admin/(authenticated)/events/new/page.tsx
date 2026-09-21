import { EventForm } from "@/components/admin/event-form";
import { createEvent } from "../actions";

export const metadata = {
  title: "New event | Haven Rush Admin",
};

export default function NewEventPage() {
  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold">New event</h1>
      <EventForm action={createEvent} submitLabel="Create event" />
    </div>
  );
}
