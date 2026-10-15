import { z } from "zod";
import { experiences } from "./experiences.ts";

export const GUIDE_LANGUAGES = ["English", "Sinhala", "Tamil", "Spanish"] as const;
export const VEHICLES = ["walking", "sedan", "van"] as const;
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(32).regex(/^[+\d\s()\-]*$/).optional().default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    const today = new Date();
    const todayString = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && value >= todayString;
  }, "Choose a valid future travel date"),
  guests: z.number().int().min(1).max(20),
  language: z.enum(GUIDE_LANGUAGES),
  vehicle: z.enum(VEHICLES),
  experiences: z.array(z.string().refine((slug) => experiences.some((experience) => experience.slug === slug)))
    .min(1).max(experiences.length).refine((values) => new Set(values).size === values.length),
  message: z.string().trim().max(2500).default(""),
  consent: z.literal(true),
  locale: z.enum(["en", "es"]),
  website: z.string().max(200).default(""),
  requestId: z.string().uuid(),
}).strict().superRefine((value, context) => {
  if (value.vehicle === "sedan" && value.guests > 3) {
    context.addIssue({ code: "custom", path: ["vehicle"], message: "Choose a van for more than three guests" });
  }
  if (value.vehicle === "van" && value.guests > 7) {
    context.addIssue({ code: "custom", path: ["vehicle"], message: "Groups over seven need a custom transport quote" });
  }
});

export type Inquiry = z.infer<typeof inquirySchema>;
export type Plan = Pick<Inquiry, "experiences" | "guests" | "vehicle">;
export function estimatePlan(plan: Plan): { host: number | null; transport: number | null; total: number | null; custom: boolean } {
  const selected = experiences.filter((item) => plan.experiences.includes(item.slug));
  if (selected.some((item) => item.price === null)) {
    return { host: null, transport: null, total: null, custom: true };
  }
  const multiplier = plan.guests <= 2 ? 1 : plan.guests <= 4 ? 1.4 : 1.8;
  const host = Math.round(selected.reduce((total, item) => total + (item.price ?? 0), 0) * multiplier);
  const transport = plan.vehicle === "walking" ? 0 : selected.reduce((total, item) => {
    const dayTrip = item.category === "day-trip";
    return total + (plan.vehicle === "van" ? (dayTrip ? 220 : 100) : (dayTrip ? 140 : 60));
  }, 0);
  return { host, transport, total: host + transport, custom: plan.guests > 7 };
}
