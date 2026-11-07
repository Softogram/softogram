/**
 * Content for /upsolve, the landing page printed on the Upsolve by Softogram
 * flyers (QR code target). The flyer copy lives outside this repo in
 * softogram-classes/docs; keep dates, fees and claims here in step with it.
 *
 * Honesty rule applies: every claim below is true today. There are no past
 * students yet, so there are no results, testimonials or placement numbers.
 */

export const UPSOLVE_PHONE_DISPLAY = "+91 63601 58761";
export const UPSOLVE_PHONE_TEL = "tel:+916360158761";
export const UPSOLVE_WHATSAPP_HREF =
  "https://wa.me/916360158761?text=Hi%20Saurabh%2C%20I%20want%20to%20join%20the%20free%20DSA%20demo%20class.";
export const UPSOLVE_WHATSAPP_SCHOOL_HREF =
  "https://wa.me/916360158761?text=Hi%20Saurabh%2C%20I%20want%20to%20know%20about%20the%20school%20coding%20classes.";

export const BATCH = {
  startDate: "Monday 30 November 2026",
  endDate: "20 February 2027",
  schedule: "Monday to Friday, 7 to 9 pm",
  weeks: 12,
  seats: 10,
  fee: "Rs 15,000",
  feeNote: "for the full 3 months",
  earlyBird: "Rs 12,000",
  earlyBirdNote: "for the first 5 students. Two instalments allowed.",
  demos: [
    { label: "Demo 1", when: "Sunday 22 November, 6 pm" },
    { label: "Demo 2", when: "Saturday 28 November, 6 pm" },
  ],
  refund: "Full refund if you leave before the 3rd class. No refund after that.",
};

export const WHAT_YOU_GET = [
  "2 hours live every weekday evening for 12 weeks. Not a recorded course.",
  "150+ interview problems, from arrays to graphs and dynamic programming, solved together.",
  "A weekly contest every Saturday and a topic test every second Friday.",
  "Your own progress sheet: problems solved, contest rank, test scores, attendance.",
  "Off-campus placement support: a weekly list of fresher openings, referral help, resume review, mock interviews.",
  "Doubts answered on WhatsApp the same day. Missed a class? The recording is shared the same night.",
];

export const SYLLABUS = [
  { week: 1, topic: "Complexity, arrays, two pointers, prefix sums" },
  { week: 2, topic: "Sorting, binary search, bit manipulation" },
  { week: 3, topic: "Strings, hashing, sliding window" },
  { week: 4, topic: "Linked lists, stacks, queues, monotonic stack" },
  { week: 5, topic: "Recursion and backtracking" },
  { week: 6, topic: "Trees and binary search trees" },
  { week: 7, topic: "Heaps and greedy" },
  { week: 8, topic: "Graphs: BFS, DFS, shortest paths, union-find" },
  { week: 9, topic: "Dynamic programming, part 1" },
  { week: 10, topic: "Dynamic programming, part 2" },
  { week: 11, topic: "Tries, intervals, mixed problem sets" },
  { week: 12, topic: "Mock interviews and company-pattern revision" },
];

export const PLACEMENT_SUPPORT = [
  "Every Friday: a list of off-campus fresher openings and referral posts found that week.",
  "Week 2 and week 10: your resume, LinkedIn and LeetCode or Codeforces profile reviewed one to one.",
  "Where my own network has a matching role, I refer you myself.",
  "How to ask for referrals the right way, and where to find them.",
  "Weeks 9 to 12: mock interviews in the real format, with written feedback.",
];

export const TEACHER = {
  name: "Saurabh Mishra",
  lines: [
    "Schooled in Prayagraj at MPVM, Teliyarganj. B.Tech from ABES Engineering College, Ghaziabad, a tier-3 college. Then 4 years as a backend engineer.",
    "At Couchbase, on the Java and Go database SDKs used by companies worldwide. Before that at Orange Health, building the backend for India's fastest diagnostics labs.",
    "I cracked interviews from a tier-3 college with exactly this preparation. I teach the way I wish someone had taught me.",
  ],
  badges: [
    "Codeforces Expert",
    "2000+ problems solved",
    "Rank 663 / 25,000 in a Codeforces round",
    "Code Gladiators 2021 finalist",
  ],
  links: {
    github: "https://github.com/CosmicSaaurabh",
    linkedin: "https://www.linkedin.com/in/2bsaurabh/",
  },
};

export const SCHOOL = {
  classes: "Classes 8 to 12",
  fee: "Rs 3,000",
  feeNote: "per month. Pay monthly or in 3-month blocks.",
  schedule: "2 to 3 online sessions a week, 1 hour each, evenings or weekends. Classes pause in school exam months.",
  points: [
    "Programming from zero in Python, then C++ for those who go further.",
    "Basic data structures and algorithms, the foundation of every computer science course.",
    "Introduction to competitive programming and the Indian Computing Olympiad (ZCO and INOI) path.",
    "10 to 12 students per batch. The first batch opens when 6 students register.",
  ],
};

export const FAQ = [
  {
    q: "Why is it called Upsolve?",
    a: "In competitive programming, upsolving means going back after a contest to solve the problems you could not solve during it. That habit, finishing what you got stuck on with someone to guide you, is the whole course.",
  },
  {
    q: "Which language do I need to know?",
    a: "Any one of C++, Java or Python, enough to write loops, functions and arrays. C++ is the default in class, and Java and Python students code in their own language.",
  },
  {
    q: "I am in 2nd year. Is this too early?",
    a: "No. Starting in 2nd or 3rd year is the best time, because you finish the batch with months left to practise before internship and placement drives.",
  },
  {
    q: "Is there a placement guarantee?",
    a: "No, and nobody honest can give one. What is guaranteed is that you will have solved more interview problems under time pressure than most people you compete with, and you will get a weekly list of real openings.",
  },
  {
    q: "What if I miss a class?",
    a: "The recording is shared the same night, and the homework sheet tells you what to do before the next class.",
  },
  {
    q: "How do I pay?",
    a: "UPI, after the demo class, once you decide to join. You get a receipt on WhatsApp. " + BATCH.refund,
  },
];
