import { Agent, Gemini, PreloadMemoryTool, FunctionTool, CallbackContext } from '@google/adk';

export const MEMORY_BANK_ID = "5621628680225685504";
export const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "qwiklabs-gcp-04-a63326fe2771";
export const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

// 1. Memory generation callback
export async function generateMemoriesCallback(ctx: CallbackContext) {
  if (ctx.addSessionToMemory) {
    await ctx.addSessionToMemory();
  }
}

// 2. APHA Domain Tools with A2UI Card Data Support
export function getUpcomingEvents(params: { level?: string; location?: string }) {
  const events = [
    {
      title: "Basic Pranic Healing (Level 1)",
      level: "Basic",
      dates: "Aug 15-16, 2026",
      location: "Los Angeles, CA & Online",
      instructor: "Dr. Mary Clark",
      prerequisites: "None",
      registrationUrl: "https://pranichealing.us/events/basic-la",
      a2uiSurface: {
        type: "Card",
        header: "Basic Pranic Healing (Level 1)",
        fields: [
          { label: "Dates", value: "Aug 15-16, 2026" },
          { label: "Location", value: "Los Angeles, CA & Online" },
          { label: "Instructor", value: "Dr. Mary Clark" },
          { label: "Prerequisites", value: "None" }
        ],
        action: { label: "Register at pranichealing.us", url: "https://pranichealing.us/events/basic-la" }
      }
    },
    {
      title: "Advanced Pranic Healing (Level 2)",
      level: "Advanced",
      dates: "Aug 22-23, 2026",
      location: "Los Angeles, CA",
      instructor: "Master Stephen Co",
      prerequisites: "Basic Pranic Healing",
      registrationUrl: "https://pranichealing.us/events/advanced-la",
      a2uiSurface: {
        type: "Card",
        header: "Advanced Pranic Healing (Level 2)",
        fields: [
          { label: "Dates", value: "Aug 22-23, 2026" },
          { label: "Location", value: "Los Angeles, CA" },
          { label: "Instructor", value: "Master Stephen Co" },
          { label: "Prerequisites", value: "Basic Pranic Healing" }
        ],
        action: { label: "Register at pranichealing.us", url: "https://pranichealing.us/events/advanced-la" }
      }
    },
    {
      title: "Pranic Psychotherapy (Level 3)",
      level: "Psychotherapy",
      dates: "Sep 12-13, 2026",
      location: "Online / Zoom",
      instructor: "Master Stephen Co",
      prerequisites: "Advanced Pranic Healing",
      registrationUrl: "https://pranichealing.us/events/psychotherapy",
      a2uiSurface: {
        type: "Card",
        header: "Pranic Psychotherapy (Level 3)",
        fields: [
          { label: "Dates", value: "Sep 12-13, 2026" },
          { label: "Location", value: "Online / Zoom" },
          { label: "Instructor", value: "Master Stephen Co" },
          { label: "Prerequisites", value: "Advanced Pranic Healing" }
        ],
        action: { label: "Register at pranichealing.us", url: "https://pranichealing.us/events/psychotherapy" }
      }
    },
    {
      title: "Full Moon Planetary Meditation for Peace",
      level: "All",
      dates: "Aug 28, 2026",
      location: "Global Online",
      instructor: "APHA Instructors",
      prerequisites: "None",
      registrationUrl: "https://pranichealing.us/events/full-moon",
      a2uiSurface: {
        type: "Card",
        header: "Full Moon Planetary Meditation for Peace",
        fields: [
          { label: "Dates", value: "Aug 28, 2026" },
          { label: "Location", value: "Global Online" },
          { label: "Instructor", value: "APHA Instructors" },
          { label: "Prerequisites", value: "None" }
        ],
        action: { label: "Join Meditation", url: "https://pranichealing.us/events/full-moon" }
      }
    }
  ];

  if (!params.level && !params.location) return events;

  return events.filter(e => {
    const matchLevel = !params.level || e.level.toLowerCase().includes(params.level.toLowerCase());
    const matchLoc = !params.location || e.location.toLowerCase().includes(params.location.toLowerCase());
    return matchLevel && matchLoc;
  });
}

export function findStudyGroups(params: { cityOrZip?: string }) {
  const groups = [
    {
      name: "Los Angeles Pranic Healing Center",
      city: "Los Angeles",
      address: "123 Healing Way, Los Angeles, CA",
      meditationSchedule: "Wednesdays 7:00 PM (Twin Hearts Meditation)",
      contact: "la@pranichealing.us",
      a2uiSurface: {
        type: "Card",
        header: "Los Angeles Pranic Healing Center",
        fields: [
          { label: "City", value: "Los Angeles" },
          { label: "Address", value: "123 Healing Way, Los Angeles, CA" },
          { label: "Meditation Schedule", value: "Wednesdays 7:00 PM (Twin Hearts Meditation)" },
          { label: "Contact", value: "la@pranichealing.us" }
        ]
      }
    },
    {
      name: "Southern California Practice Circle",
      city: "Irvine",
      address: "456 Energy Blvd, Irvine, CA",
      meditationSchedule: "Saturdays 10:00 AM",
      contact: "oc@pranichealing.us",
      a2uiSurface: {
        type: "Card",
        header: "Southern California Practice Circle",
        fields: [
          { label: "City", value: "Irvine" },
          { label: "Address", value: "456 Energy Blvd, Irvine, CA" },
          { label: "Meditation Schedule", value: "Saturdays 10:00 AM" },
          { label: "Contact", value: "oc@pranichealing.us" }
        ]
      }
    },
    {
      name: "Online Global Meditation Group",
      city: "Online",
      address: "Zoom",
      meditationSchedule: "Daily 6:00 PM PST",
      contact: "online@pranichealing.us",
      a2uiSurface: {
        type: "Card",
        header: "Online Global Meditation Group",
        fields: [
          { label: "City", value: "Online / Zoom" },
          { label: "Schedule", value: "Daily 6:00 PM PST" },
          { label: "Contact", value: "online@pranichealing.us" }
        ]
      }
    }
  ];

  if (!params.cityOrZip) return groups;
  return groups.filter(g => 
    g.city.toLowerCase().includes(params.cityOrZip!.toLowerCase()) || 
    g.name.toLowerCase().includes(params.cityOrZip!.toLowerCase())
  );
}

export function getPranicFaq(params: { topic?: string }) {
  const faqs = {
    twin_hearts: "Meditation on Twin Hearts is an advanced meditation technique aimed at achieving universal consciousness and divine oneness. It cleanses energy centers and promotes physical and emotional health.",
    prerequisites: "Basic Pranic Healing has no prerequisites. Advanced Pranic Healing requires Basic. Pranic Psychotherapy requires Advanced Pranic Healing.",
    certification: "APHA offers certification programs including Associate Certified Pranic Healer and Certified Pranic Healer.",
    membership: "APHA membership supports community healing clinics, research, and offers event discounts."
  };

  if (params.topic && params.topic.toLowerCase() in faqs) {
    return faqs[params.topic.toLowerCase() as keyof typeof faqs];
  }
  return faqs;
}

export function calculateBundleFee(params: { numWorkshops: number; isEarlyBird?: boolean }) {
  const baseRate = 350;
  const total = params.numWorkshops * baseRate;
  let discount = 0;

  if (params.numWorkshops >= 2) discount += 0.15;
  if (params.isEarlyBird) discount += 0.10;

  const finalTotal = total * (1 - discount);
  return {
    numWorkshops: params.numWorkshops,
    baseTotal: total,
    discountPercent: `${Math.round(discount * 100)}%`,
    finalTotal: `$${finalTotal.toFixed(2)}`,
    a2uiSurface: {
      type: "Card",
      header: "Workshop Package Pricing Summary",
      fields: [
        { label: "Number of Workshops", value: String(params.numWorkshops) },
        { label: "Base Total", value: `$${total.toFixed(2)}` },
        { label: "Applied Discount", value: `${Math.round(discount * 100)}%` },
        { label: "Final Total", value: `$${finalTotal.toFixed(2)}` }
      ]
    }
  };
}

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || 'adc_placeholder';

// 3. Root Agent Definition
export const rootAgent = new Agent({
  name: "apha_learning_assistant",
  model: new Gemini({
    model: "gemini-2.5-flash",
    apiKey,
    project: PROJECT_ID,
    location: LOCATION,
    vertexai: true,
  }),
  instruction: `You are the official American Pranic Healing Association (APHA) Community & Learning Assistant (pranichealing.us).
Your mission is to welcome users, help them discover upcoming Pranic Healing events/workshops, track their learning pathway, connect with local study groups/Twin Hearts meditation sessions, and answer questions.

A2UI & Formatting Guidance:
- When recommending workshops, study groups, or package fees, present the details using A2UI structured cards or clear formatted layouts.
- Always use PreloadMemoryTool to recall the user's prior coursework, location, and preferences across sessions.
- Tailor course recommendations based on prerequisites.
- Be compassionate, warm, and professional.`,
  tools: [
    new PreloadMemoryTool(),
    new FunctionTool({
      name: "getUpcomingEvents",
      description: "Finds and filters upcoming APHA workshops and learning events by course level or location.",
      execute: async (params: any) => getUpcomingEvents(params || {})
    }),
    new FunctionTool({
      name: "findStudyGroups",
      description: "Finds local Pranic Healing practice groups and Twin Hearts meditation circles by city or zip code.",
      execute: async (params: any) => findStudyGroups(params || {})
    }),
    new FunctionTool({
      name: "getPranicFaq",
      description: "Provides official APHA answers on Pranic Healing principles, courses, prerequisites, certification, and membership.",
      execute: async (params: any) => getPranicFaq(params || {})
    }),
    new FunctionTool({
      name: "calculateBundleFee",
      description: "Calculates registration fees for multi-workshop packages and early-bird discounts.",
      execute: async (params: any) => calculateBundleFee(params || {})
    })
  ],
  afterAgentCallback: generateMemoriesCallback,
});
