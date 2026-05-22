// Shared mock data for the bodyscan prototype variations.
// Mirrors realistic InBody / Tanita-style outputs without copying any vendor UI.

window.BODYSCAN_DATA = (function () {
  const today = new Date("2026-05-18");
  const daysAgo = (d) => {
    const x = new Date(today);
    x.setDate(x.getDate() - d);
    return x.toISOString().slice(0, 10);
  };

  // Client profile (Emma)
  const client = {
    id: "c-emma",
    name: "Emma Larsen",
    firstName: "Emma",
    avatar: "EL",
    age: 32,
    gender: "Female",
    heightCm: 168,
    joined: "2025-11-04",
    email: "emma@hey.com",
    headCoach: "co-marcus",
    coaches: ["co-marcus", "co-sofia", "co-tom"],
    goals: {
      weightKg: 64,
      bodyFatPct: 22,
      muscleMassKg: 27,
      waterPct: 55,
    },
  };

  // Coach profiles
  const coaches = {
    "co-marcus": {
      id: "co-marcus",
      name: "Marcus Bell",
      firstName: "Marcus",
      avatar: "MB",
      role: "Head coach · Strength",
      email: "marcus@studio.fit",
      isHead: true,
      since: "2025-11-04",
    },
    "co-sofia": {
      id: "co-sofia",
      name: "Sofia Ruiz",
      firstName: "Sofia",
      avatar: "SR",
      role: "Nutrition",
      email: "sofia@studio.fit",
      isHead: false,
      since: "2026-01-12",
    },
    "co-tom": {
      id: "co-tom",
      name: "Tom Achterberg",
      firstName: "Tom",
      avatar: "TA",
      role: "Mobility",
      email: "tom@studio.fit",
      isHead: false,
      since: "2026-02-28",
    },
  };

  // Emma's scan history (oldest → newest)
  const scans = [
    {
      id: "s1",
      date: daysAgo(168),
      weightKg: 71.4,
      bodyFatPct: 31.2,
      muscleMassKg: 24.1,
      visceralFat: 7,
      waterPct: 49.8,
      metabolicAge: 36,
      coachId: "co-marcus",
      notes:
        "Baseline scan after intake. Strong frame, good resting HR. We'll start with 3× lifts + 2× mobility per week.",
    },
    {
      id: "s2",
      date: daysAgo(140),
      weightKg: 70.6,
      bodyFatPct: 30.1,
      muscleMassKg: 24.4,
      visceralFat: 6,
      waterPct: 50.3,
      metabolicAge: 35,
      coachId: "co-marcus",
      notes:
        "Two weeks in and sleeping better. Bumped protein target to 110g — Sofia will follow up on this.",
    },
    {
      id: "s3",
      date: daysAgo(98),
      weightKg: 69.2,
      bodyFatPct: 28.4,
      muscleMassKg: 25.0,
      visceralFat: 6,
      waterPct: 51.4,
      metabolicAge: 33,
      coachId: "co-sofia",
      notes:
        "Body fat trending the right way without losing muscle. Great consistency. Hold the current calorie target for another block.",
    },
    {
      id: "s4",
      date: daysAgo(56),
      weightKg: 67.8,
      bodyFatPct: 26.1,
      muscleMassKg: 25.7,
      visceralFat: 5,
      waterPct: 52.6,
      metabolicAge: 31,
      coachId: "co-marcus",
      notes:
        "Visceral fat dropped a full point. Squat 1RM up ~8kg from baseline. Mobility is the limiter — Tom to take the wheel next block.",
    },
    {
      id: "s5",
      date: daysAgo(14),
      weightKg: 66.5,
      bodyFatPct: 24.8,
      muscleMassKg: 26.3,
      visceralFat: 5,
      waterPct: 53.4,
      metabolicAge: 30,
      coachId: "co-tom",
      notes:
        "Hip internal rotation finally past 30°. We can deload one strength session and add a Pilates-style core circuit.",
    },
  ];

  // Roster shown to the coach (Marcus). Includes Emma plus a few others.
  const roster = [
    {
      id: "c-emma",
      name: "Emma Larsen",
      avatar: "EL",
      lastScan: daysAgo(14),
      trend: "down", // body-fat going down = good
      nextSession: "Tue 10:30",
      streak: 24,
      tags: ["fat loss", "strength"],
    },
    {
      id: "c-jonah",
      name: "Jonah Park",
      avatar: "JP",
      lastScan: daysAgo(3),
      trend: "up",
      nextSession: "Wed 07:00",
      streak: 12,
      tags: ["recomp"],
    },
    {
      id: "c-priya",
      name: "Priya Anand",
      avatar: "PA",
      lastScan: daysAgo(31),
      trend: "flat",
      nextSession: "Overdue",
      streak: 4,
      tags: ["postnatal"],
    },
    {
      id: "c-lukas",
      name: "Lukas Vogel",
      avatar: "LV",
      lastScan: daysAgo(7),
      trend: "up",
      nextSession: "Thu 18:15",
      streak: 41,
      tags: ["hypertrophy"],
    },
    {
      id: "c-amira",
      name: "Amira Haddad",
      avatar: "AH",
      lastScan: daysAgo(21),
      trend: "down",
      nextSession: "Mon 09:00",
      streak: 9,
      tags: ["fat loss"],
    },
    {
      id: "c-noor",
      name: "Noor Jansen",
      avatar: "NJ",
      lastScan: daysAgo(2),
      trend: "flat",
      nextSession: "Fri 16:30",
      streak: 18,
      tags: ["maintenance"],
    },
  ];

  // Quick helpers for formatting
  function fmtDate(iso, opts = {}) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: opts.long ? "long" : "short",
      year: opts.year ? "numeric" : undefined,
    });
  }
  function deltaStr(curr, prev, unit = "") {
    const d = curr - prev;
    const s = d > 0 ? "+" : d < 0 ? "−" : "";
    return s + Math.abs(d).toFixed(1) + unit;
  }

  return {
    today,
    client,
    coaches,
    coachList: Object.values(coaches),
    scans,
    roster,
    fmtDate,
    deltaStr,
    metrics: [
      { key: "weightKg", label: "Weight", unit: "kg", goalKey: "weightKg", direction: "down" },
      { key: "bodyFatPct", label: "Body fat", unit: "%", goalKey: "bodyFatPct", direction: "down" },
      { key: "muscleMassKg", label: "Muscle mass", unit: "kg", goalKey: "muscleMassKg", direction: "up" },
      { key: "visceralFat", label: "Visceral fat", unit: "", direction: "down" },
      { key: "waterPct", label: "Water", unit: "%", goalKey: "waterPct", direction: "up" },
      { key: "metabolicAge", label: "Metabolic age", unit: "yr", direction: "down" },
    ],
  };
})();
