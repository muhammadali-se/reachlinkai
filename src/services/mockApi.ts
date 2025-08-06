import { FormData } from '../types';

// Mock data for post generation by tone
const mockPostIdeas = {
  neutral: [
    "5 lessons I learned after 3 years in tech leadership",
    "The skills that matter most for career growth in 2025",
    "Why I changed my approach to team management",
    "What I wish I knew before starting my first startup",
    "The biggest misconception about remote work productivity"
  ],
  viral: [
    "🚨 The #1 mistake I see new developers make (and how to avoid it)",
    "Plot twist: The 'soft skills' everyone ignores are actually the most valuable",
    "I was doing LinkedIn completely wrong for 3 years. Here's what I learned:",
    "This one change increased my productivity by 300% (no joke)",
    "🔥 Hot take: Your degree doesn't matter as much as you think"
  ],
  professional: [
    "Strategic insights from scaling a team from 5 to 50 engineers",
    "Data-driven approaches to improving software delivery performance",
    "Leadership principles that drive sustainable growth in tech organizations",
    "How to build resilient systems: Lessons from production incidents",
    "The evolution of engineering culture in high-growth startups"
  ],
  concise: [
    "3 rules for better code reviews",
    "Remote work: 5 tools that changed everything",
    "Why I quit my 6-figure job",
    "The best career advice in 10 words",
    "1 habit that doubled my productivity"
  ]
};

// Mock data for optimization by tone
const mockOptimizedPosts = {
  neutral: [
    "After 5 years in tech, I've learned that success isn't just about coding skills",
    "Here's what I discovered about building effective remote teams",
    "The career pivot that changed my perspective on leadership"
  ],
  viral: [
    "🚨 This career mistake cost me $50K (and how you can avoid it)",
    "Plot twist: Quitting my 6-figure job was the best decision I ever made",
    "I was doing LinkedIn completely wrong for 3 years. Here's what I learned:"
  ],
  professional: [
    "Strategic lessons from transitioning to senior leadership in technology",
    "How data-driven decision making transformed our engineering organization",
    "Building sustainable growth: Insights from scaling technical teams"
  ],
  concise: [
    "Left my job. Started a company. Here's why:",
    "5 years in tech. 3 key lessons:",
    "Remote work changed everything. Here's how:"
  ]
};

// Legacy arrays for backward compatibility
const legacyPostIdeas = [
  "🚨 The #1 mistake I see new developers make (and how to avoid it)",
  "Why I stopped applying to 100+ jobs and started getting interviews instead",
  "The brutal truth about 'following your passion' in tech careers",
  "5 LinkedIn habits that got me 10x more profile views in 30 days",
  "Plot twist: The 'soft skills' everyone ignores are actually the most valuable"
];

const legacyOptimizedPosts = [
  "🚨 This career mistake cost me $50K (and how you can avoid it)",
  "Stop scrolling - this LinkedIn strategy just changed everything for me",
  "I was doing LinkedIn completely wrong for 3 years. Here's what I learned:",
  "The brutal truth about leaving tech that no one talks about",
  "Plot twist: Quitting my 6-figure job was the best decision I ever made"
];

const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const fetchMockResults = async (data: FormData): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  const toneData = data.mode === 'generate' ? mockPostIdeas : mockOptimizedPosts;
  const selectedToneData = toneData[data.tone] || (data.mode === 'generate' ? legacyPostIdeas : legacyOptimizedPosts);

  if (data.mode === 'generate') {
    return getRandomItems(selectedToneData, 5);
  } else {
    return getRandomItems(selectedToneData, 3);
  }
};