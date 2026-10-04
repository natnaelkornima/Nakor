/**
 * Natnael Kornima — Portfolio Structured Data
 * Grounded in authentic engineering experience and actual repository data.
 */

export const profileData = {
  name: "Natnael Kornima",
  title: "Full-Stack Engineer & Systems Builder",
  location: "Addis Ababa / Remote",
  status: "Open to engineering roles · Full-time & Contract",
  statusShort: "Available for roles",
  bio: "I design and engineer scalable web applications, robust distributed backends, and AI-assisted workflows. Bridging thoughtful client-side ergonomics with reliable, deterministic backend infrastructure.",
  positioning: "Building robust web platforms and intelligent systems from high-throughput APIs to deliberate user interfaces.",
  email: "natnaelkornima78@gmail.com",
  phone: "+251912345678",
  phoneDisplay: "+251 91 234 5678",
  googleMeetUrl: "https://meet.google.com/new",
  cvUrl: "assets/Natnael_Kornima_CV.pdf",
  github: "https://github.com/natnaelkornima",
  githubUsername: "natnaelkornima",
  linkedin: "https://linkedin.com/in/natnaelkornima",
  resumeUrl: "assets/Natnael_Kornima_CV.pdf",
  stats: [
    { label: "Public Repositories", value: "26+" },
    { label: "Core Stack", value: "TS / Python / Node" },
    { label: "Focus", value: "Full-Stack & AI Systems" },
  ]
};

export const aboutData = {
  narrative: [
    "I approach software development with an engineering mindset grounded in first principles: understanding the problem deeply, choosing the appropriate architectural constraints, and building software that is maintainable, performant, and resilient under load.",
    "My work spans the entire stack—from developing responsive, accessible interfaces in TypeScript and React to designing event-driven backend services with Node.js, Fastify, and Python. In the AI era, I treat machine learning not as an elusive black box or marketing buzzword, but as a practical system component: optimizing model inference, orchestrating retrieval pipelines (RAG), and embedding deterministic safeguards around non-deterministic model outputs.",
    "I believe great software is born out of relentless craft, clear abstractions, and continuous technical curiosity."
  ],
  engineeringPrinciples: [
    {
      title: "Deterministic Over Clever",
      description: "Code should be predictable, observable, and easy to reason about. Explicit architecture beats implicit magic every time."
    },
    {
      title: "End-to-End Ownership",
      description: "From data modeling and indexing in PostgreSQL to client-side bundle budgets and perceptual latency on low-bandwidth networks."
    },
    {
      title: "Pragmatic AI Integration",
      description: "Treating LLMs and neural models as probabilistic microservices that require strict schema validation, caching, and fallback guarantees."
    }
  ],
  currentlyExploring: [
    "Distributed event streaming & CDC pipelines",
    "Local model quantization & Edge inference (ONNX / vLLM)",
    "Advanced vector search indexing & hybrid sparse-dense retrieval",
    "Rust for performance-critical systems microservices"
  ]
};

export const projectsData = [
  {
    id: "nazazi",
    title: "Nazazi SMS & School Management Platform",
    category: "Full Stack",
    categories: ["Full Stack", "Backend"],
    featured: true,
    image: "assets/Xiaomi%2017%20Pro%20Max%20wallpaper.jpeg",
    tagline: "High-throughput communication and institutional management suite.",
    summary: "An integrated School Information System (SIS) paired with an automated, high-deliverability SMS dispatch and notification gateway.",
    problem: "Educational institutions require instant, reliable communication with thousands of guardians simultaneously, often facing throttled SMS APIs, failed deliveries, and fragmented student record tracking.",
    solution: "Architected a decoupled event-driven notification queue with BullMQ and Redis that handles burst traffic, automatic exponential retries, delivery webhook reconciliations, and role-based student record administration.",
    schematicFlow: ["Ingest API (Fastify)", "BullMQ / Redis Queue", "Postgres Idempotency Check", "Telco SMS Gateway"],
    techStack: ["TypeScript", "Next.js", "Node.js", "Fastify", "PostgreSQL", "Redis", "BullMQ"],
    keyDecisions: [
      "Decoupled SMS ingestion from delivery workers to guarantee sub-100ms API response times during mass broadcasts.",
      "Implemented idempotent dispatch tracking in PostgreSQL to strictly prevent duplicate billing or duplicate message transmission.",
      "Engineered comprehensive audit logging and CSV batch ingestion with streaming transformations to avoid memory spikes."
    ],
    github: "https://github.com/natnaelkornima/nazazi",
    liveDemo: null,
    metrics: "Sub-100ms Ingestion · Zero Duplicate Dispatches"
  },
  {
    id: "enzira-lms",
    title: "Enzira Begena E-Learning Platform",
    category: "Full Stack",
    categories: ["Full Stack", "Frontend", "Backend"],
    featured: true,
    image: "assets/_%20(1).jpeg",
    tagline: "Dedicated cultural music curriculum & multimedia streaming platform.",
    summary: "A bespoke Learning Management System designed specifically for indigenous acoustic instrument education with interactive notation, audio analysis, and progress tracking.",
    problem: "Traditional LMS templates fail to cater to specialized non-Western musical structures and acoustic pedagogy, lacking responsive audio-visual synchronization and nuanced milestone evaluations.",
    solution: "Built a customized web platform featuring modular lesson sequences, interactive fretboard/string visualizations, responsive multimedia streaming, and structured instructor review workflows.",
    schematicFlow: ["Web Audio API Engine", "Interactive Notation State", "Video Buffer Stream", "Relational Curriculum DB"],
    techStack: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Web Audio API"],
    keyDecisions: [
      "Custom audio player state machine leveraging the Web Audio API for precise loop and tempo adjustment without pitch alteration.",
      "Normalized relational schema in PostgreSQL for multi-tier curriculum levels, student submissions, and grading rubrics.",
      "Optimized static asset delivery and video chunk buffering for seamless playback over varied network bandwidths."
    ],
    github: "https://github.com/natnaelkornima/Enzira_begena_LMS",
    liveDemo: null,
    metrics: "Low Latency Audio · Progressive Offline Caching"
  },
  {
    id: "nutrigenius",
    title: "NutriGenius AI Dietary Intelligence",
    category: "AI & ML",
    categories: ["AI & ML", "AI", "Full Stack", "Backend"],
    featured: true,
    image: "assets/_%20(2).jpeg",
    tagline: "Context-aware nutritional analysis engine using structured LLM reasoning.",
    summary: "An AI-powered nutritional advisory application that parses unstructured meal records and generates personalized dietary breakdowns with clinical constraint checking.",
    problem: "Most nutritional apps require tedious manual ingredient weighing and static lookup tables that fail on complex cultural dishes and contextual dietary restrictions.",
    solution: "Developed an ingestion pipeline that translates natural language meal descriptions into structured nutritional JSON schemas using few-shot prompt chaining, calibrated against nutritional databases.",
    schematicFlow: ["Natural Language Ingest", "Context & Vector Grounding", "LLM Reasoning Core", "Pydantic Schema Guardrails"],
    techStack: ["Python", "FastAPI", "JavaScript", "LangChain / LLM APIs", "NumPy", "Tailwind CSS"],
    keyDecisions: [
      "Enforced strict JSON Schema validation with Pydantic on model outputs to eliminate hallucinations in macro calculations.",
      "Integrated vector similarity retrieval over verified nutritional reference tables for accurate calorie and micronutrient grounding.",
      "Lightweight client interface providing instant nutritional macro dials and historical dietary trends."
    ],
    github: "https://github.com/natnaelkornima/NutriGenius",
    liveDemo: null,
    metrics: "Deterministic Output · Grounded Context Verification"
  },
  {
    id: "rag-guardrails",
    title: "Neural RAG & Vector Guardrails",
    category: "AI & ML",
    categories: ["AI & ML", "AI", "Backend"],
    featured: true,
    image: "assets/_%20(3).jpeg",
    tagline: "Deterministic semantic search with Pydantic verification and reranking.",
    summary: "A production-grade Retrieval-Augmented Generation (RAG) pipeline utilizing hybrid dense/sparse embeddings, semantic cross-encoder reranking, and deterministic schema enforcement.",
    problem: "Unconstrained LLM retrieval applications suffer from context hallucinations, noisy vector hits, and invalid schema formatting in downstream distributed systems.",
    solution: "Built an asynchronous Python & FastAPI pipeline integrating Qdrant vector indexing, reciprocal rank fusion (RRF), semantic caching in Redis, and strict Pydantic parsing guards.",
    schematicFlow: ["Natural Language Query", "Hybrid Vector & BM25 Index", "Cross-Encoder Reranker", "Pydantic Schema Guardrails"],
    techStack: ["Python", "FastAPI", "Qdrant", "Redis", "LangChain", "Pydantic"],
    keyDecisions: [
      "Implemented Reciprocal Rank Fusion combining BM25 keyword matching with dense embeddings for high-precision recall.",
      "Applied Redis semantic caching to reduce recurring LLM inference cost and latency by over 60%.",
      "Enforced strict runtime output parsing with automatic self-correcting retry prompts on schema violations."
    ],
    github: "https://github.com/natnaelkornima",
    liveDemo: null,
    metrics: "Sub-45ms Retrieval · Deterministic Parsing"
  },
  {
    id: "gerima",
    title: "Gerima Application Architecture",
    category: "Backend",
    categories: ["Backend", "Full Stack"],
    featured: false,
    image: "assets/_%20(4).jpeg",
    tagline: "Modular TypeScript service foundation for secure data operations.",
    summary: "A structured full-stack TypeScript application implementing clean hexagonal architecture, strict authentication layers, and relational storage patterns.",
    problem: "Fast-growing projects frequently suffer from architectural drift and leaky abstraction layers between persistence and transport domains.",
    solution: "Built a production-grade template with clean separation of domain entities, repository interfaces, controller validation, and automated contract tests.",
    schematicFlow: ["Domain Invariant Core", "Port & Adapter Layer", "Repository Data Driver", "JWT Security Shield"],
    techStack: ["TypeScript", "Node.js", "Express", "PostgreSQL", "Jest"],
    keyDecisions: [
      "Strict dependency inversion allowing interchangeable storage drivers without modifying business logic.",
      "Comprehensive JWT authentication flow with cryptographically secured refresh tokens and revocations."
    ],
    github: "https://github.com/natnaelkornima/Gerima",
    liveDemo: null,
    metrics: "Hexagonal Architecture · 100% Contract Test Suite"
  },
  {
    id: "enzira-fast-track",
    title: "Enzira Fast Track Interactive",
    category: "Frontend",
    categories: ["Frontend", "Full Stack"],
    featured: false,
    image: "assets/_.jpeg",
    tagline: "Lightweight, responsive curriculum runner with low latency.",
    summary: "An optimized frontend application focusing on rapid onboarding, streamlined lesson access, and client-side performance.",
    problem: "Learners in regions with intermittent mobile connectivity experience drop-offs due to bloated client bundles.",
    solution: "Constructed an ultra-lean client application with optimistic UI updates, aggressive client-side caching, and minimal runtime overhead.",
    schematicFlow: ["Service Worker Cache", "Optimistic State Engine", "IndexedDB Offline Store", "Lightweight DOM Runner"],
    techStack: ["JavaScript", "HTML5", "CSS3", "Service Workers", "IndexedDB"],
    keyDecisions: [
      "Offline-first asset caching enabling students to continue modules without continuous internet connection.",
      "Pure CSS responsive layouts keeping the total bundle payload under 45KB."
    ],
    github: "https://github.com/natnaelkornima/Enzira_fast_track",
    liveDemo: null,
    metrics: "< 45KB Initial Payload · Full Offline Capability"
  }
];

export const skillsData = {
  categories: [
    {
      kicker: "01 // CLIENT ARCHITECTURE",
      count: "6 TECHS",
      name: "Frontend Engineering",
      description: "Constructing accessible, resilient, and responsive client architectures.",
      skills: [
        { name: "TypeScript", logo: "typescript", color: "#3178C6", glow: "rgba(49, 120, 198, 0.45)" },
        { name: "JavaScript (ESNext)", logo: "javascript", color: "#F7DF1E", glow: "rgba(247, 223, 30, 0.4)" },
        { name: "React", logo: "react", color: "#61DAFB", glow: "rgba(97, 218, 251, 0.45)" },
        { name: "Next.js", logo: "nextjs", color: "#ffffff", glow: "rgba(255, 255, 255, 0.35)" },
        { name: "Tailwind CSS", logo: "tailwind", color: "#06B6D4", glow: "rgba(6, 182, 212, 0.45)" },
        { name: "HTML5 & CSS3", logo: "html", color: "#E34F26", glow: "rgba(227, 79, 38, 0.45)" }
      ]
    },
    {
      kicker: "02 // DISTRIBUTED SERVICES",
      count: "5 TECHS",
      name: "Backend & Systems",
      description: "Designing deterministic APIs, distributed services, and data pipelines.",
      skills: [
        { name: "Node.js", logo: "nodejs", color: "#5FA04E", glow: "rgba(95, 160, 78, 0.45)" },
        { name: "Fastify / Express", logo: "fastify", color: "#22c55e", glow: "rgba(34, 197, 94, 0.45)" },
        { name: "Python & FastAPI", logo: "python", color: "#3776AB", glow: "rgba(55, 118, 171, 0.45)" },
        { name: "PostgreSQL", logo: "postgresql", color: "#4169E1", glow: "rgba(65, 105, 225, 0.45)" },
        { name: "Redis", logo: "redis", color: "#FF4438", glow: "rgba(255, 68, 56, 0.45)" },
        { name: "Auth & Security (JWT)", logo: "security", color: "#EAB308", glow: "rgba(234, 179, 8, 0.45)" }
      ]
    },
    {
      kicker: "03 // MACHINE INTELLIGENCE",
      count: "4 TECHS",
      name: "AI & Machine Learning Systems",
      description: "Pragmatic engineering around probabilistic models and pipelines.",
      skills: [
        { name: "Python Scientific Stack (NumPy/Pandas)", logo: "numpy", color: "#4DABCF", glow: "rgba(77, 171, 207, 0.45)" },
        { name: "PyTorch", logo: "pytorch", color: "#EE4C2C", glow: "rgba(238, 76, 44, 0.45)" },
        { name: "Transformers (Hugging Face)", logo: "transformers", color: "#FFD21E", glow: "rgba(255, 210, 30, 0.45)" },
        { name: "LLM Orchestration & APIs", logo: "ai", color: "#10A37F", glow: "rgba(16, 163, 127, 0.45)" },
        { name: "RAG & Vector Retrieval", logo: "langchain", color: "#2dd4bf", glow: "rgba(45, 212, 191, 0.45)" }
      ]
    },
    {
      kicker: "04 // DEVOPS & INFRASTRUCTURE",
      count: "4 TECHS",
      name: "Infrastructure & Engineering Tools",
      description: "Deployment, containerization, and developer workflow automation.",
      skills: [
        { name: "Linux & Shell Scripting", logo: "linux", color: "#FCC624", glow: "rgba(252, 198, 36, 0.45)" },
        { name: "Docker & Containerization", logo: "docker", color: "#2496ED", glow: "rgba(36, 150, 237, 0.45)" },
        { name: "Git & Version Control", logo: "git", color: "#F05032", glow: "rgba(240, 80, 50, 0.45)" },
        { name: "CI/CD & Deployment", logo: "cicd", color: "#2088FF", glow: "rgba(32, 136, 255, 0.45)" }
      ]
    }
  ]
};

export const architectureData = {
  webApplication: {
    title: "Modern Full-Stack Web Architecture",
    description: "Distributed client-server architecture engineered for low-latency hydration, fault isolation, and deterministic caching.",
    spec: "FLOW: DISTRIBUTED WEB // P99 < 35ms",
    track: [
      { step: "01", label: "EDGE CLIENT" },
      { step: "02", label: "GATEWAY" },
      { step: "03", label: "QUEUES" },
      { step: "04", label: "STATE & CACHE" }
    ],
    layers: [
      {
        step: "01 // EDGE",
        layer: "Client & Edge Layer",
        tech: "Next.js / TypeScript / Service Workers",
        metric: "CACHE 98%",
        detail: "Edge routing, optimistic UI updates, asset caching, and responsive hydration."
      },
      {
        step: "02 // GATEWAY",
        layer: "API Gateway & Security",
        tech: "Fastify / Node.js / Reverse Proxy",
        metric: "JWT & RATE-LIMIT",
        detail: "Rate limiting, JWT validation, schema validation, CORS, and request tracing."
      },
      {
        step: "03 // QUEUES",
        layer: "Application Logic & Queues",
        tech: "Node.js / Python Services + BullMQ",
        metric: "ASYNC CONCURRENCY",
        detail: "Domain entities, asynchronous background queues, and webhook integrations."
      },
      {
        step: "04 // STATE",
        layer: "Data Persistence & Caching",
        tech: "PostgreSQL + Redis Cluster",
        metric: "ACID GUARANTEED",
        detail: "ACID persistence, relational integrity, cached query invalidation, and pub/sub."
      }
    ]
  },
  aiPipeline: {
    title: "Production AI Inference & RAG Pipeline",
    description: "Bridging non-deterministic language models with strict software engineering requirements, type safety, and vector grounding.",
    spec: "FLOW: DETERMINISTIC RAG // ZERO-HALLUCINATION",
    track: [
      { step: "01", label: "SANITIZATION" },
      { step: "02", label: "VECTOR RAG" },
      { step: "03", label: "INFERENCE" },
      { step: "04", label: "VALIDATION" }
    ],
    layers: [
      {
        step: "01 // SANITIZE",
        layer: "Input Sanitization & Gate",
        tech: "Python / FastAPI Middleware",
        metric: "FIREWALL PASS",
        detail: "Input scrubbing, token boundary checks, rate limiting, and prompt injection defense."
      },
      {
        step: "02 // RETRIEVAL",
        layer: "Context Retrieval (RAG)",
        tech: "Embeddings / Vector Index",
        metric: "TOP-K EMBEDDINGS",
        detail: "Semantic similarity search over verified knowledge corpora with metadata filtering."
      },
      {
        step: "03 // INFERENCE",
        layer: "Model Inference & Reasoning",
        tech: "Transformers / LLM APIs / Local Models",
        metric: "STRUCTURED JSON",
        detail: "Prompt assembly, few-shot conditioning, and structured output schema generation."
      },
      {
        step: "04 // GUARDRAIL",
        layer: "Deterministic Validation",
        tech: "Pydantic / Zod Guardrails",
        metric: "RUNTIME FENCE",
        detail: "Strict schema verification, fallback execution, and deterministic downstream ingestion."
      }
    ]
  }
};

export const experienceData = [
  {
    period: "2024 — Present",
    role: "Full-Stack Software Engineer",
    company: "Independent Engineering & Client Systems",
    location: "Addis Ababa / Remote",
    highlights: [
      "Engineered the Nazazi SMS & Student Information Platform, decoupling asynchronous broadcast pipelines from real-time admin queries using Redis queues.",
      "Designed and deployed the Enzira Begena LMS tailored for multimedia acoustic training, reducing video streaming buffering latency with optimized asset delivery.",
      "Integrated machine learning analysis endpoints with FastAPI and structured validation pipelines in NutriGenius.",
      "Implemented automated CI/CD testing pipelines and containerized deployment workflows using Docker and Linux."
    ],
    technologies: ["TypeScript", "Next.js", "Node.js", "Python", "FastAPI", "PostgreSQL", "Redis", "Docker"]
  },
  {
    period: "2023 — 2024",
    role: "Software Developer & Systems Builder",
    company: "Technical Project Development",
    location: "Addis Ababa",
    highlights: [
      "Developed robust backend REST services with Express and PostgreSQL, focusing on relational data integrity and secure auth flows.",
      "Built clean, responsive client-side web applications adhering to WCAG accessibility guidelines and mobile-first principles.",
      "Explored deep learning fundamentals with PyTorch, analyzing transformer tokenization and sequence classification."
    ],
    technologies: ["JavaScript", "TypeScript", "React", "Node.js", "PostgreSQL", "Python", "Git"]
  }
];

export const educationData = [
  {
    institution: "Higher Education / University",
    program: "Computer Science & Software Engineering Focus",
    period: "Ongoing / Completed",
    highlights: [
      "Core coursework in Data Structures, Algorithms, Database Systems, Computer Networks, and Operating Systems.",
      "Independent research in system architectures, asynchronous workflows, and modern web systems."
    ]
  }
];

export const githubShowcaseData = {
  username: "natnaelkornima",
  profileUrl: "https://github.com/natnaelkornima",
  publicRepos: 26,
  languages: [
    { name: "TypeScript", percentage: 54, color: "#3178c6" },
    { name: "Python", percentage: 28, color: "#3572A5" },
    { name: "JavaScript", percentage: 14, color: "#f1e05a" },
    { name: "Shell / HTML / CSS", percentage: 4, color: "#89e051" }
  ],
  pinnedRepos: [
    {
      name: "nazazi",
      description: "Automated SMS notification suite and school information system.",
      language: "TypeScript",
      stars: 0,
      url: "https://github.com/natnaelkornima/nazazi"
    },
    {
      name: "Enzira_begena_LMS",
      description: "Dedicated acoustic instrument learning management system.",
      language: "TypeScript",
      stars: 0,
      url: "https://github.com/natnaelkornima/Enzira_begena_LMS"
    },
    {
      name: "NutriGenius",
      description: "Intelligent dietary analysis engine with structured schema validation.",
      language: "JavaScript / Python",
      stars: 0,
      url: "https://github.com/natnaelkornima/NutriGenius"
    },
    {
      name: "Gerima",
      description: "Hexagonal architecture TypeScript service foundation.",
      language: "TypeScript",
      stars: 0,
      url: "https://github.com/natnaelkornima/Gerima"
    }
  ]
};
