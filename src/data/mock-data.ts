export type Mentor = {
  id: string;
  name: string;
  role: string;
  tagline: string;
  online: boolean;
  tags: string[];
};

export type MessageBlock =
  | { type: "text"; content: string }
  | { type: "code"; language: string; content: string };

export type Message = {
  id: string;
  sender: "mentor" | "user";
  time: string;
  blocks: MessageBlock[];
};

export type Conversation = {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  unread?: number;
  messages: Message[];
};

export const mentors: Mentor[] = [
  {
    id: "hitesh",
    name: "Hitesh Choudhary",
    role: "Founder · iNeuron / LCO",
    tagline: "Hanji! Chai lo aur code seekho.",
    online: true,
    tags: ["JavaScript", "Python", "DSA", "Node.js", "Career"],
  },
  {
    id: "piyush",
    name: "Piyush Garg",
    role: "Full Stack Educator",
    tagline: "System design ek chai break mein.",
    online: false,
    tags: ["React", "System Design", "Docker"],
  },
  {
    id: "akshay",
    name: "Akshay Saini",
    role: "Namaste JS",
    tagline: "JS ke deep concepts, asaan bhasha mein.",
    online: true,
    tags: ["JavaScript", "Interviews"],
  },
];

export const conversations: Conversation[] = [
  {
    id: "closures",
    title: "Explain JavaScript closures",
    preview: "Hanji! Closures are like...",
    timestamp: "Today",
    messages: [
      {
        id: "m1",
        sender: "mentor",
        time: "10:32 AM",
        blocks: [
          {
            type: "text",
            content:
              "Hanji! Closures are one of the most powerful concepts in JavaScript. Let me explain with a chai analogy ☕",
          },
        ],
      },
      {
        id: "m2",
        sender: "user",
        time: "10:33 AM",
        blocks: [
          { type: "text", content: "That makes sense! Can you show me a code example?" },
        ],
      },
      {
        id: "m3",
        sender: "mentor",
        time: "10:34 AM",
        blocks: [
          { type: "text", content: "Bilkul! Here's a clean example:" },
          {
            type: "code",
            language: "javascript",
            content: `function makeChai(type) {\n  return () => \`Making ${"${type}"} chai\`;\n}\n\nconst masalaChai = makeChai("masala");\nconsole.log(masalaChai());`,
          },
          {
            type: "text",
            content:
              "The inner function 'remembers' the type variable even after makeChai has finished running — that's the closure.",
          },
        ],
      },
    ],
    unread: 0,
  },
  {
    id: "python-scratch",
    title: "Python from scratch",
    preview: "You: Where do I start?",
    timestamp: "Today",
    messages: [
      {
        id: "m1",
        sender: "user",
        time: "9:10 AM",
        blocks: [{ type: "text", content: "Where do I start with Python as a complete beginner?" }],
      },
      {
        id: "m2",
        sender: "mentor",
        time: "9:12 AM",
        blocks: [
          {
            type: "text",
            content:
              "Start with variables, data types, and loops. Don't jump to frameworks — pehle basics pakke karo.",
          },
        ],
      },
    ],
  },
  {
    id: "async-await",
    title: "Async/await explained",
    preview: "Chai analogy for promises...",
    timestamp: "Yesterday",
    messages: [
      {
        id: "m1",
        sender: "mentor",
        time: "Yesterday",
        blocks: [
          {
            type: "text",
            content:
              "Soch lo Promise ek chai order jaisa hai — order diya, ab wait karo, ya to chai mil jayegi (resolve) ya dukaan band mil jayegi (reject).",
          },
        ],
      },
    ],
  },
];