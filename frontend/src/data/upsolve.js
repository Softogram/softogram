/**
 * Content for /upsolve and /upsolve/enrol, the pages behind the Upsolve by
 * Softogram flyers (QR code target). The flyer copy lives outside this repo in
 * softogram-upsolve/docs; keep dates, fees and claims here in step with it.
 *
 * Honesty rule applies: every claim below is true today. There are no past
 * students yet, so there are no results, testimonials or placement numbers.
 * Live numbers (seats, bookings, demo dates) come from GET /api/upsolve/stats
 * and are never hardcoded here, except the fallback demo dates for first paint.
 */

export const PHONE_DISPLAY = "+91 63601 58761";
export const PHONE_TEL = "tel:+916360158761";

const WHATSAPP = "https://wa.me/916360158761";
export const WHATSAPP_DEMO_HREF = `${WHATSAPP}?text=${encodeURIComponent("Hi Saurabh, I want to join the free DSA demo class.")}`;
export const WHATSAPP_SCHOOL_HREF = `${WHATSAPP}?text=${encodeURIComponent("Hi Saurabh, I want to know about the school coding classes.")}`;
export const WHATSAPP_PAYMENT_HREF = `${WHATSAPP}?text=${encodeURIComponent("Hi Saurabh, please send me a payment link for the Upsolve batch.")}`;
export const WHATSAPP_HELLO_HREF = `${WHATSAPP}?text=${encodeURIComponent("Hi Saurabh, I just enrolled in the Upsolve batch.")}`;

/** Only used until the stats call returns; the backend owns the real list. */
export const FALLBACK_DEMOS = [
  { date: "2026-11-22", label: "Sunday 22 November, 6 pm" },
  { date: "2026-11-28", label: "Saturday 28 November, 6 pm" },
];

export const BATCH = {
  seatsTotal: 10,
  earlyTotal: 5,
  fullRupees: 15000,
  earlyRupees: 12000,
  startDate: "Monday 30 November 2026",
};

export const REFUND_RULE =
  "Full refund if you leave before the 3rd class. After that, the only refund is the Upsolve guarantee.";
export const COLLECTED_BY =
  "Fees are collected by Saurabh Mishra as an individual tutor, and the receipt carries that name.";
export const GUARANTEE =
  "I cannot promise you a job. I promise the work: 150 problems checked, 12 contests, 2 recorded mock interviews, a job list every Friday. Attend and do the sheet, and if you do not get all of it, you get your money back.";

export const HERO_POINTS = [
  "12-week live batch for 2nd to 4th year B.Tech, Monday to Friday 7 to 9 pm, from 30 November",
  "Weekly contest, topic tests, your own progress sheet, doubts answered the same day",
  "Off-campus placement support: weekly job list, referrals, resume review, mock interviews",
];

export const HERO_CHIPS = [
  "Taught by a Codeforces Expert",
  "2000+ problems solved",
  "ex-Couchbase, ex-Orange Health",
];

export const DEMO_AGENDA = [
  { time: "0-10", title: "Who I am, in three lines", text: "Tier-3 college, competitive programming, Couchbase. Then straight to the problem." },
  { time: "10-40", title: "One real interview problem, solved live", text: "You see how to think aloud, trace edge cases and get from brute force to the right idea. Bring a laptop and code along." },
  { time: "40-50", title: "A free 12-week self-study plan", text: "Yours to keep whether you join or not. Honest: disciplined people can do it alone." },
  { time: "50-60", title: "Questions, then the batch in two minutes", text: "Dates, fee, how the placement support works. No pressure to decide on the call." },
];

export const WHY_CARDS = [
  { icon: "screen", title: "Ten seats, so I see every screen", text: "In a batch of ten, every student codes live every day and I read every solution. A mistake in your loop gets caught the day you make it, not in an interview three months later. That is the entire reason the batch is small, and the reason it costs what it costs." },
  { icon: "clock", title: "Pressure that mirrors the interview", text: "A weekly 90-minute contest and a topic test every second Friday. You learn to think with a clock running, in front of people, which is exactly the condition that makes candidates freeze. By week 12 it is normal." },
  { icon: "chart", title: "You upsolve, every week", text: "Upsolving means going back after a contest to solve what you could not. It is where competitive programmers actually improve, and where self-learners quit because nobody is checking. Here Sunday is for it, and Monday starts with it." },
  { icon: "people", title: "Ten people who know your name", text: "Camera on, attendance tracked, one student presents a solution every Friday. You cannot quietly disappear in week 3 the way you can from a playlist." },
];

export const CLASS_TIMELINE = [
  { time: "7:00", title: "Recap and upsolve review", text: "One student explains yesterday's hardest problem." },
  { time: "7:20", title: "The idea, by solving", text: "I solve 2 to 3 problems live, thinking aloud, taking questions." },
  { time: "8:05", title: "You solve, I watch", text: "Everyone codes one problem. I check each screen and ask why." },
  { time: "8:50", title: "Homework and tomorrow", text: "6 to 8 problems on the sheet. Doubts on WhatsApp." },
];

export const PHASES = [
  {
    label: "PHASE 1 . WEEKS 1-4", tag: "topic tests wk 2, 4", title: "Foundations you will use every day",
    weeks: [
      { n: 1, topic: "Complexity, arrays, two pointers, prefix sums", problems: "Two Sum . Container With Most Water . Subarray Sum Equals K" },
      { n: 2, topic: "Sorting, binary search, bit manipulation", problems: "Koko Eating Bananas . Search in Rotated Array . Aggressive Cows" },
      { n: 3, topic: "Strings, hashing, sliding window", problems: "Longest Substring Without Repeats . Minimum Window Substring" },
      { n: 4, topic: "Linked lists, stacks, queues, monotonic stack", problems: "Reverse Linked List . Daily Temperatures . Largest Rectangle" },
    ],
  },
  {
    label: "PHASE 2 . WEEKS 5-8", tag: "topic tests wk 6, 8", title: "The structures interviews are built on",
    weeks: [
      { n: 5, topic: "Recursion and backtracking", problems: "Subsets . Permutations . N-Queens . Word Search" },
      { n: 6, topic: "Trees and binary search trees", problems: "Diameter . Lowest Common Ancestor . Validate BST . Kth Smallest" },
      { n: 7, topic: "Heaps and greedy", problems: "Top K Frequent . Merge K Lists . Task Scheduler . Merge Intervals" },
      { n: 8, topic: "Graphs: BFS, DFS, shortest paths, union-find", problems: "Number of Islands . Course Schedule . Dijkstra . Word Ladder" },
    ],
  },
  {
    label: "PHASE 3 . WEEKS 9-12", tag: "topic test wk 10, mocks", title: "The hard parts, then the interview itself", accent: true,
    weeks: [
      { n: 9, topic: "Dynamic programming, part 1", problems: "Climbing Stairs . Coin Change . LIS . Unique Paths . Word Break" },
      { n: 10, topic: "Dynamic programming, part 2", problems: "LCS . Edit Distance . Partition Equal Subset . Burst Balloons" },
      { n: 11, topic: "Tries, intervals, mixed problem sets", problems: "Implement Trie . Word Search II . LRU Cache . Insert Interval" },
      { n: 12, topic: "Mock interviews and company-pattern revision", problems: "Two recorded 45-minute mocks each, written feedback, final contest" },
    ],
  },
];

export const SYLLABUS_TILES = [
  { value: "150+", text: "named interview problems, solved in class or on the sheet" },
  { value: "12", text: "Saturday contests on a private Codeforces group" },
  { value: "5", text: "graded topic tests, on alternate Fridays" },
  { value: "2", text: "recorded mock interviews per student, with written feedback" },
];

export const INCLUDED = [
  "60 live classes, 120 hours, recordings same night",
  "12 contests, 5 topic tests, progress sheet",
  "Same-day doubt replies on WhatsApp",
  "Weekly off-campus job list until you are placed",
  "Two resume and profile reviews, one to one",
  "Two recorded mock interviews with feedback",
];

export const SCHOOL = {
  points: [
    "Python from zero, then C++ for those who go further.",
    "Basic data structures and algorithms, the foundation of every computer science course.",
    "Introduction to competitive programming and the Indian Computing Olympiad (ZCO and INOI) path.",
    "10 to 12 students per batch. The first batch opens when 6 students register.",
  ],
  schedule: "2 to 3 online sessions a week, 1 hour each. Classes and fees pause in exam months. Pay monthly or in 3-month blocks.",
  refund: "Full refund if you leave within the first 2 classes of a month.",
};

export const TEACHER = {
  name: "Saurabh Mishra",
  tagline: "backend engineer . competitive programmer . from Prayagraj",
  // A cartoon portrait on purpose. Do not swap in a direct photograph.
  avatar: "/upsolve-coach.webp",
  // The titles in the competitive programming line below were checked against these sites on 8 Nov 2026.
  codingProfiles: [
    { id: "codeforces", site: "Codeforces", handle: "saurabhmishra16", url: "https://codeforces.com/profile/saurabhmishra16" },
    { id: "leetcode", site: "LeetCode", handle: "doodlemaster", url: "https://leetcode.com/doodlemaster/" },
    { id: "codechef", site: "CodeChef", handle: "doodlemaster", url: "https://www.codechef.com/users/doodlemaster" },
  ],
  github: "https://github.com/CosmicSaaurabh",
  linkedin: "https://www.linkedin.com/in/2bsaurabh/",
  career: [
    { label: "School and college", text: "MPVM, Teliyarganj, Prayagraj. Then B.Tech at ABES Engineering College, Ghaziabad, a tier-3 college like most of yours." },
    { label: "Couchbase, 2022 to 2026", text: "Backend engineer on the Java and Go database SDKs used by companies worldwide. Promoted to Software Engineer II." },
    { label: "Orange Health", text: "Built the backend behind India's fastest diagnostics labs: routing that cut field medics' travel by half." },
    { label: "Competitive programming", text: "Codeforces Expert. LeetCode Knight. CodeChef 5 star. 2000+ problems. Rank 75 of 18,900+ in a Codeforces Div. 3 round. Code Gladiators 2021 finalist.", accent: true },
  ],
  local: [
    { label: "From Prayagraj", text: "Schooled here. I know your colleges, and I know what off-campus hiring looks like from here." },
    { label: "We meet in person", text: "Batch meetups in Prayagraj during the course: solve together, talk careers, meet the others face to face." },
    { label: "I help you get the job, personally", text: "Referrals from my own network where a role fits, your resume reviewed by me, your mock interviews taken by me. Not a helpdesk." },
  ],
  quote: "I cracked interviews from a tier-3 college with exactly this preparation. I teach the way I wish someone had taught me.",
};

export const PLACEMENT_STEPS = [
  { when: "Every Friday", text: "A list of off-campus fresher openings and referral posts found that week, filtered for 0 to 2 years. Posted in the batch group." },
  { when: "Week 2", text: "Resume, LinkedIn and LeetCode or Codeforces profile reviewed one to one, 20 minutes each. Again in week 10, with a target-company list." },
  { when: "Week 4", text: "How to ask for a referral without being ignored: message templates, who to ask, when to follow up." },
  { when: "Any week", text: "Where my own network has a matching role, I refer you myself." },
  { when: "Weeks 9-12", text: "Two recorded 45-minute mock interviews each, in the real format: communication, edge cases, complexity, then code. Written feedback after each.", accent: true },
  { when: "After", text: "You stay in the alumni group and keep getting the Friday list until you are placed." },
];

export const FAQ = [
  { q: "Why is it called Upsolve?", a: "In competitive programming, upsolving means going back after a contest to solve the problems you could not solve during it. That habit, finishing what you got stuck on with someone to guide you, is the whole course." },
  { q: "Is the demo really free, and do I need to decide on the call?", a: "Yes, and no. Nothing is collected before or during the demo. You get the self-study plan either way. Join afterwards if you want to." },
  { q: "Which language do I need to know?", a: "Any one of C++, Java or Python, enough to write loops, functions and arrays. C++ is the default in class. Java and Python students code in their own language. Nothing beyond arrays is assumed." },
  { q: "I am in 2nd year. Is this too early?", a: "No. 2nd or 3rd year is the best time, because you finish the batch with months left to practise before internship and placement drives. Final-year students are welcome too and get the off-campus list from week 1." },
  { q: "What if I miss a class, or my exams clash?", a: "The recording is shared the same night, so you catch up after the exam. The homework sheet tells you what to do before the next class." },
  { q: "Is there a placement guarantee?", a: "No, and nobody honest can give one. What is guaranteed is more interview problems solved under time pressure than most people you compete with, two mock interviews, and a weekly list of real openings." },
  { q: "How do I pay, and what if I want to leave?", a: `On this site through Razorpay by UPI, card, net banking or wallet, or ask on WhatsApp for a payment link. Two instalments allowed. ${REFUND_RULE} ${COLLECTED_BY}` },
  { q: "What do I need at home?", a: "A laptop, internet good enough for Google Meet, and a compiler for your language or a free online one. Camera on during class. A phone alone is not enough to code along." },
];
