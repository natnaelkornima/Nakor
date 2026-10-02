export interface Project {
  id: string;
  title: string;
  category: string;
  featured: boolean;
  tagline: string;
  summary: string;
  problem: string;
  solution: string;
  techStack: string[];
  keyDecisions: string[];
  github: string | null;
  liveDemo: string | null;
  metrics?: string;
}

export interface SkillCategory {
  name: string;
  description: string;
  skills: { name: string; level: string; note: string }[];
}

export interface ArchitectureLayer {
  step?: string;
  layer?: string;
  tech: string;
  detail: string;
}

export const profile = {
  name: "Natnael Kornima",
  title: "Full-Stack Engineer & Systems Builder",
  location: "Addis Ababa / Remote",
  status: "Available for engineering roles & technical collaborations",
  bio: "I design and engineer scalable web applications, robust distributed backends, and AI-assisted workflows. Bridging thoughtful client-side ergonomics with reliable, deterministic backend infrastructure.",
  positioning: "Building robust web platforms and intelligent systems from high-throughput APIs to deliberate user interfaces.",
  email: "natnaelkornima78@gmail.com",
  github: "https://github.com/natnaelkornima",
  githubUsername: "natnaelkornima",
  linkedin: "https://linkedin.com/in/natnaelkornima",
  resumeUrl: "#resume"
};
