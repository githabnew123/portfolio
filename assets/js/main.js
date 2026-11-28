/* =========================================================
   Interactions: theme, nav, reveals, filters, case dialogs
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const i18n = window.PortfolioI18n || null;
  function lang() { return i18n ? i18n.lang : "en"; }
  function t(key, fallback) {
    const value = i18n ? i18n.t(key) : "";
    return value || fallback;
  }

  /* ---------- Theme ---------- */
  const themeToggle = document.querySelector(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "light"));
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? t("aria.themeLight", "Switch to light mode") : t("aria.themeDark", "Switch to dark mode")
      );
    }
    if (themeMeta) {
      themeMeta.setAttribute("content", theme === "dark" ? "#0b0c0e" : "#f3f0e8");
    }
    try { localStorage.setItem("theme", theme); } catch (e) {}
  }

  if (themeToggle) {
    setTheme(root.getAttribute("data-theme") || "dark");
    themeToggle.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ---------- Header, progress, cursor ---------- */
  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress span");
  const glow = document.querySelector(".cursor-glow");

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const y = window.scrollY || 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (header) header.classList.toggle("is-scrolled", y > 12);
      if (progress) progress.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (glow && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    let x = targetX;
    let y = targetY;
    let raf = 0;

    window.addEventListener("mousemove", function (event) {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!raf) raf = requestAnimationFrame(animateGlow);
    }, { passive: true });

    function animateGlow() {
      x += (targetX - x) * 0.12;
      y += (targetY - y) * 0.12;
      glow.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)";
      if (Math.abs(targetX - x) > 0.4 || Math.abs(targetY - y) > 0.4) {
        raf = requestAnimationFrame(animateGlow);
      } else {
        raf = 0;
      }
    }
    animateGlow();
  }

  /* ---------- Mobile navigation ---------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  const navLinks = nav ? Array.from(nav.querySelectorAll("a")) : [];

  function setMenu(open) {
    document.body.classList.toggle("nav-open", open);
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? t("aria.menuClose", "Close menu") : t("aria.menuOpen", "Open menu"));
    }
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      const open = !document.body.classList.contains("nav-open");
      setMenu(open);
      if (open) {
        const first = nav.querySelector("a");
        if (first) window.setTimeout(function () { first.focus(); }, 120);
      } else {
        menuToggle.focus();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        setMenu(false);
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860 && document.body.classList.contains("nav-open")) setMenu(false);
    });
  }

  /* ---------- Scroll reveals ---------- */
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) { item.classList.add("is-in"); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  }

  /* ---------- Active nav ---------- */
  const watchedSections = ["work", "more", "about", "stack", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if (watchedSections.length && "IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-32% 0px -58% 0px", threshold: 0 });
    watchedSections.forEach(function (section) { navObserver.observe(section); });
  }

  /* ---------- Live Mandalay time ---------- */
  const timeNodes = [document.getElementById("local-time"), document.getElementById("local-time-2")].filter(Boolean);
  let timeFormatter = null;
  try {
    timeFormatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Yangon",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
  } catch (e) {
    timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  }
  function updateTime() {
    if (!timeFormatter) return;
    const value = timeFormatter.format(new Date());
    timeNodes.forEach(function (node) { node.textContent = value; });
  }
  updateTime();
  window.setInterval(updateTime, 30000);

  const yearNode = document.getElementById("year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  /* ---------- Toast ---------- */
  const toast = document.getElementById("toast");
  let toastTimer = 0;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("is-visible"); }, 2600);
  }

  /* ---------- Copy email ---------- */
  const copyButton = document.querySelector(".copy-email");
  if (copyButton) {
    copyButton.addEventListener("click", async function () {
      const email = copyButton.getAttribute("data-email") || "pyaep2863@gmail.com";
      try {
        await navigator.clipboard.writeText(email);
        showToast(t("toast.copied", "Email copied — {email}").replace("{email}", email));
      } catch (e) {
        const field = document.createElement("textarea");
        field.value = email;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        try {
          document.execCommand("copy");
          showToast(t("toast.copied", "Email copied — {email}").replace("{email}", email));
        } catch (err) {
          showToast(t("toast.copyFailed", "Copy failed — {email}").replace("{email}", email));
        }
        field.remove();
      }
    });
  }

  /* ---------- Project filters ---------- */
  const filterButtons = Array.from(document.querySelectorAll(".filter"));
  const miniCards = Array.from(document.querySelectorAll(".mini-card"));

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const filter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach(function (other) {
        const active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      let visible = 0;
      miniCards.forEach(function (card) {
        const show = filter === "all" || card.getAttribute("data-category") === filter;
        card.classList.toggle("is-filtered-out", !show);
        if (show) {
          card.classList.add("is-in");
          visible += 1;
        }
      });
      showToast(t("toast.shown", "{n} projects shown").replace("{n}", String(visible)));
    });
  });

  /* ---------- Case study dialog ---------- */
  const cases = {
    law: {
      kicker: "01 · AI / Legal tech · 2026",
      title: "Myanmar Law Guide",
      tagline: "A bilingual legal-information assistant that answers with citations, not guesses.",
      meta: [
        ["Year", "2026"],
        ["Status", "In development"],
        ["Role", "Full-stack & AI integration"],
        ["Access", "Private product"]
      ],
      sections: [
        {
          h: "The problem",
          p: "Myanmar's laws are spread across scanned PDFs, decades of amendments and mixed Burmese/English text. A generic chatbot will confidently invent a section number — and in a legal context, a confident wrong answer is worse than no answer."
        },
        {
          h: "What I built",
          list: [
            "An offline OCR pipeline using pdftoppm and Tesseract (mya+eng) to turn scanned law books into searchable text.",
            "Section-aware ingestion that splits by 'Section', 'ပုဒ်မ' and 'Article' markers, then embeds each chunk with Bedrock Titan V2 into PostgreSQL + pgvector.",
            "A citation-first RAG flow: retrieve relevant passages, refuse low-confidence matches, and return law title + section with every answer.",
            "A Flutter client with Burmese/English/mixed chat, a searchable law library, tap-through citations and a permanent 'not legal advice' banner.",
            "Signed S3 links for source PDFs, so a citation opens the original law rather than a paraphrase."
          ]
        },
        {
          h: "Engineering notes",
          p: "Laravel 12 runs the API; retrieval uses pgvector's cosine distance with an explicit confidence threshold. The system prompt and disclaimer are enforced server-side, so a user cannot prompt them away. The source PDF stays the authority — the model is only allowed to explain what retrieval found."
        },
        {
          h: "Outcome",
          p: "The product behaves like a careful research assistant: it shows its sources, admits when it does not know, and keeps the user one tap from the original law. It is currently in development with the OCR and ingestion pipeline built."
        }
      ],
      stack: ["Laravel 12", "Flutter", "PostgreSQL + pgvector", "AWS Bedrock", "Claude", "Titan V2", "Tesseract", "S3", "App Runner"],
      note: "Private product build — repository and additional screenshots are available on request."
    },
    blood: {
      kicker: "02 · Health tech / PWA · 2026",
      title: "BloodLink Myanmar",
      tagline: "A privacy-first donor network for a country that coordinates blood on Facebook.",
      meta: [
        ["Year", "2026"],
        ["Status", "Product build"],
        ["Role", "Full-stack — Flutter + Laravel"],
        ["Access", "Private product"]
      ],
      sections: [
        {
          h: "The problem",
          p: "Urgent blood requests spread through Facebook groups and chat apps. Donor phone numbers are posted publicly, eligibility is unknown, and receivers waste hours calling people who cannot donate. The coordination works, but it exposes the people helping."
        },
        {
          h: "What I built",
          list: [
            "Compatibility-aware donor search by blood type, township and live availability.",
            "Contact requests that keep phone numbers hidden until the donor accepts.",
            "A 90/120-day eligibility countdown plus weekly availability windows and daily check-ins, so 'available now' means eligible and inside a confirmed window.",
            "A verified directory of hospitals, blood banks, Red Cross branches and foundations.",
            "An admin dashboard for moderation, user activation, request status and donation verification.",
            "Bilingual English/Burmese UI, in-app privacy and terms pages, reporting, and account deletion that anonymizes personal data."
          ]
        },
        {
          h: "Engineering notes",
          p: "Flutter 3.50 PWA on top of Laravel 12 + Sanctum + MySQL 8.4. Availability windows are evaluated in Asia/Yangon regardless of server timezone, and the API keeps eligibility separate from availability so search results stay honest. Contact details are only serialized after an accepted request."
        },
        {
          h: "Outcome",
          p: "A donor network that treats a phone number as something you lend, not something you publish. The app works as an installable PWA and the same Flutter codebase targets Android and iOS."
        }
      ],
      stack: ["Flutter 3.50", "Dart 3.14", "Laravel 12", "Sanctum", "MySQL 8.4", "Docker", "Provider", "Material 3"],
      note: "Private product build — repository is not public."
    },
    terminal: {
      kicker: "03 · Logistics / Operations · 2026",
      title: "Mandalay Terminal & Delivery",
      tagline: "One control room for buses, taxis and parcels.",
      meta: [
        ["Year", "2026"],
        ["Status", "Shipped"],
        ["Role", "Full-stack & mobile"],
        ["Access", "Private product"]
      ],
      sections: [
        {
          h: "The problem",
          p: "A busy Mandalay terminal ran on spreadsheets, phone calls and paper slips. Trips, gates, taxi pickups, parcel deliveries and driver pay lived in different heads. There was no shared answer to 'where is this parcel?' or 'who is on this gate?'"
        },
        {
          h: "What I built",
          list: [
            "An admin console for terminals, gates and trip plans, with Excel import/export, validation and import progress.",
            "Taxi dispatch: assign drivers, update status and track service requests end to end.",
            "Parcel delivery workflow: customer lookup, create-on-behalf, delivery-man assignment, cancellation and status history.",
            "Driver and delivery-man management with performance detail, payslip generation and location history.",
            "A Flutter app with maps, push notifications and live location reporting for drivers on the road.",
            "A live operations map and KPI view for the control room."
          ]
        },
        {
          h: "Engineering notes",
          p: "Laravel 11 + Inertia/React for the admin, MySQL, and queue-backed imports for large spreadsheets. Bulk onboarding was designed for operators, not developers: download a sample, upload, then watch progress. The Flutter app uses Google Maps/Flutter Map and Firebase notifications, and reports location back to the same API."
        },
        {
          h: "Outcome",
          p: "Dispatchers get a single live picture, drivers get a phone app, and payroll stops being a monthly archaeology project. The platform covers trips, taxis, parcels, drivers, gates and money in one place."
        }
      ],
      stack: ["Laravel 11", "Inertia", "React", "Flutter", "MySQL", "Google Maps", "Flutter Map", "Firebase"],
      note: "Private product — organisation name and operational screenshots are withheld."
    },
    licence: {
      kicker: "04 · Enterprise · 2026",
      title: "Licence Service Platform",
      tagline: "A back office for a licence-service business — from intake to payroll.",
      meta: [
        ["Year", "2026"],
        ["Status", "Client delivery"],
        ["Role", "Full-stack"],
        ["Access", "Under NDA"]
      ],
      sections: [
        {
          h: "The problem",
          p: "Multi-branch licence services involve agents, appointments, vehicle checks, staged applications, commissions, cash advances and payroll. Spreadsheets could not enforce permissions, could not show where a case actually stood, and could not keep the money and the paperwork in sync."
        },
        {
          h: "What I built",
          list: [
            "A role hierarchy (owner / leader / subleader / member) with a granular permission matrix enforced server-side.",
            "A staged application pipeline with activity logs, comments and an audit trail for every stage change.",
            "Appointments, direct vehicle checks, driver presence and reapply flows.",
            "Agents, service fees, expenses, cash advances, salary history and financial reports.",
            "OTP-based password reset and short-lived signed backup downloads available only to the owner.",
            "A UI built with React 19, PrimeReact, Tailwind 4 and TanStack Query."
          ]
        },
        {
          h: "Engineering notes",
          p: "Laravel 11 API with Sanctum bearer tokens; React 19/Vite on the front. TanStack Query owns server state and React Router 7 handles navigation. Permissions are enforced in the API, not just hidden in the UI, and money/stage changes are logged for audit. Backups are generated, signed and expiring rather than left as public files."
        },
        {
          h: "Outcome",
          p: "One system a branch can run a case through without losing the thread — or the money. The permission model and audit trail replaced the spreadsheet guesswork that made multi-branch operations risky."
        }
      ],
      stack: ["Laravel 11", "React 19", "Vite", "Tailwind 4", "PrimeReact", "TanStack Query", "Sanctum", "MySQL"],
      note: "Client work — company name, brand, screenshots and repository are withheld."
    },
    micine: {
      kicker: "05 · Client · Insurance",
      title: "Micine / Minum platform",
      tagline: "Application, customer portal and policy admin for a Japanese insurance product.",
      meta: [
        ["Role", "Full-stack engineering"],
        ["Status", "Client delivery"],
        ["Access", "Under NDA"]
      ],
      sections: [
        {
          h: "The brief",
          p: "A Japanese insurer needed one product for applications, a customer portal and policy administration — with the paperwork, status and permissions that insurance work demands."
        },
        {
          h: "What I built",
          list: [
            "An application flow that captures what a policy needs before review, with clear states for the applicant and the back office.",
            "A customer portal where policyholders can see their cover and the status of a request.",
            "Policy administration screens built around the client's Japanese-language workflows.",
            "A React front end over a Laravel API, with supporting services on AWS."
          ]
        },
        {
          h: "What I learned",
          p: "Insurance is a domain where wording is a contract. The engineering lesson was to keep policy state explicit — one source of truth every screen reads — instead of inferring it differently on each page."
        }
      ],
      stack: ["Laravel", "React", "AWS", "Rust"],
      note: "Client work — brand, screenshots and repository are withheld."
    },
    car: {
      kicker: "06 · Product · Mobility",
      title: "Car rental platform",
      tagline: "An Expo customer app plus a Laravel/Inertia console for listings, bookings, drivers and chat.",
      meta: [
        ["Role", "Product engineering"],
        ["Status", "Shipped"],
        ["Access", "Under NDA"]
      ],
      sections: [
        {
          h: "The brief",
          p: "Renting a car involves three parties and a calendar: the customer, the car and the driver. The product had to keep all three in sync from listing to confirmed booking."
        },
        {
          h: "What I built",
          list: [
            "An Expo / React Native customer app for browsing cars, checking availability and booking.",
            "A Laravel + Inertia console for listings, bookings, drivers and chat.",
            "A shared API so the app and the console read the same availability."
          ]
        },
        {
          h: "What I learned",
          p: "A booking is a small state machine. Once I modelled it as states instead of scattered flags, the UI and the edge cases got simpler."
        }
      ],
      stack: ["Expo", "React Native", "Laravel", "Inertia"],
      note: "Under NDA — code walkthrough available on request."
    },
    chem: {
      kicker: "07 · Product · Education",
      title: "ChemTeacher",
      tagline: "A G10–G12 chemistry study app for Myanmar students, with pricing, referrals and resellers.",
      meta: [
        ["Role", "Product engineering"],
        ["Status", "Shipped"],
        ["Access", "Commercial product"]
      ],
      sections: [
        {
          h: "The brief",
          p: "Chemistry students in Myanmar study for high-stakes exams, often on shared phones. The app had to be affordable, easy to try, and simple for local partners to resell."
        },
        {
          h: "What I built",
          list: [
            "The Flutter study app for G10–G12 chemistry.",
            "Pricing and access plans built around local payment habits.",
            "Referral rewards and reseller tooling so teachers can distribute it.",
            "A Laravel / MySQL backend for accounts, plans and referrals."
          ]
        },
        {
          h: "What I learned",
          p: "Selling to students is a design constraint: shared devices, interrupted payments, and a need to prove value in the first session."
        }
      ],
      stack: ["Flutter", "Laravel", "MySQL"],
      note: "Commercial product — repository is private."
    },
    vibe: {
      kicker: "08 · Automation · Education",
      title: "Vibe Learning marketing HQ",
      tagline: "Agents draft the posts, but a teacher and a human decide what ships.",
      meta: [
        ["Role", "Automation & full-stack"],
        ["Status", "In use"],
        ["Access", "Private repo"]
      ],
      sections: [
        {
          h: "The brief",
          p: "A Grade 12 study app needs a steady presence on Telegram and TikTok, but posting by hand is slow. Study content is also unforgiving: a wrong formula or a guaranteed-pass claim does damage a deleted post cannot undo."
        },
        {
          h: "What I built",
          list: [
            "A four-stage agent pipeline — content writer, graphic designer, video editor and post admin — that turns a content calendar into drafts in a JSON approval queue.",
            "A brand-rules guard enforcing caption limits, hashtags, the app link, an AIGC label for TikTok, and a banned-phrase list in Burmese and English.",
            "An academic QA gate: lesson posts stay blocked until a teacher marks every fact, formula and unit as verified.",
            "Telegram publishing through the Bot API, TikTok caption and asset staging for manual upload, and a watch mode that posts approved items on an Asia/Yangon schedule.",
            "A local dashboard for the queue, the team view and the active brand rules, served by a small dependency-free Node server."
          ]
        },
        {
          h: "Engineering notes",
          p: "Node 18+ with ES modules and no framework: the queue is plain JSON, the dashboard is vanilla JS, and every action is a CLI command or a button. Drafts are idempotent, so re-running the calendar never duplicates posts. The default is safe — nothing publishes without approval, and nothing lesson-related publishes without QA."
        },
        {
          h: "What I learned",
          p: "Approval gates are a product feature, not friction. Writing the banned-phrase list and the QA gate forced me to define what correct means for the brand, and the system is more trustworthy because it can refuse to publish."
        }
      ],
      stack: ["Node.js 18+", "Telegram Bot API", "TikTok Content Posting API", "OpenAI-compatible APIs", "JSON queue", "Vanilla JS"],
      note: "Private repository — the dashboard and queue run locally. Walkthrough available on request."
    },
    aws: {
      kicker: "09 · Lab · Cloud",
      title: "AWS foundations lab",
      tagline: "Learn the cloud by building it, then write the guide that proves you understood it.",
      meta: [
        ["Role", "Self-directed lab"],
        ["Status", "Ongoing"],
        ["Access", "Learning lab"]
      ],
      sections: [
        {
          h: "The brief",
          p: "I learn infrastructure best by breaking it. The lab exists to make AWS concepts concrete, and the guide exists to test whether I can explain them to someone starting from zero."
        },
        {
          h: "What I built",
          list: [
            "EC2, IAM roles and policies, SSM Session Manager and S3 remote state, wired together with Terraform.",
            "An environment I can apply, inspect and tear down without console clicking.",
            "A beginner guide in Burmese and English that walks through each piece."
          ]
        },
        {
          h: "What I learned",
          p: "If I cannot explain why an IAM policy is shaped the way it is, I do not understand it yet. Writing the guide is the real review."
        }
      ],
      stack: ["Terraform", "AWS", "EC2", "IAM", "SSM", "S3"],
      note: "Learning lab — the write-up is shared with beginners."
    },
    petro: {
      kicker: "10 · Product · Retail",
      title: "Petro fuel station",
      tagline: "Purchases, sales, stock balances, suppliers, payments and financial records in one ledger.",
      meta: [
        ["Role", "Full-stack"],
        ["Status", "Shipped"],
        ["Access", "Private product"]
      ],
      sections: [
        {
          h: "The brief",
          p: "A fuel station runs on litres and cash. Purchases, sales, stock balances, suppliers and payments all have to reconcile, and a spreadsheet stops being an answer once the station gets busy."
        },
        {
          h: "What I built",
          list: [
            "Purchases, sales and stock balances in one ledger.",
            "Suppliers, payments and financial records tied to the same transactions.",
            "A Laravel + Inertia + TypeScript back office built for daily use."
          ]
        },
        {
          h: "What I learned",
          p: "Retail back offices live or die on reconciliation. The ledger has to explain every litre, not just the totals."
        }
      ],
      stack: ["Laravel", "Inertia", "TypeScript"],
      note: "Private product — repository and screenshots are not public."
    },
    bot: {
      kicker: "11 · Product · Automation",
      title: "Delivery bot",
      tagline: "Telegram and Viber bots that turn delivery requests into a trackable flow.",
      meta: [
        ["Role", "Bot development"],
        ["Status", "In production"],
        ["Access", "Private"]
      ],
      sections: [
        {
          h: "The brief",
          p: "Delivery requests arrive as chat messages on Telegram and Viber. Without structure, every request becomes a phone call and nothing is trackable."
        },
        {
          h: "What I built",
          list: [
            "Telegram and Viber bots that capture a delivery request as structured data.",
            "A trackable flow with status updates for the customer and the operator.",
            "Notifications that tell both sides what happens next."
          ]
        },
        {
          h: "What I learned",
          p: "A chat bot is a UI with no screen. Every state needs a message, and that message is the interface."
        }
      ],
      stack: ["Python", "Telegram", "Viber"],
      note: "Operational tool — conversation screenshots withheld."
    },
    guide: {
      kicker: "12 · Product · AI",
      title: "Guide4U study companion",
      tagline: "Grade 12 answers grounded in the official textbooks, explained in Burmese with the English terms kept.",
      meta: [
        ["Role", "Full-stack & AI"],
        ["Status", "Prototype"],
        ["Access", "Private"]
      ],
      sections: [
        {
          h: "The brief",
          p: "Grade 12 students need answers they can trust. A general chatbot invents textbook facts, which is the one thing an exam companion cannot do."
        },
        {
          h: "What I built",
          list: [
            "A PHP app that answers from the official textbooks rather than from model memory.",
            "A retrieval flow that keeps the English technical terms inside Burmese explanations.",
            "Google Gemini for generation, with grounding supplied by the source text."
          ]
        },
        {
          h: "What I learned",
          p: "Grounding is a content problem before it is a model problem. How I split and indexed the textbooks mattered more than the prompt."
        }
      ],
      stack: ["PHP", "RAG", "Gemini"],
      note: "Prototype — code walkthrough available on request."
    },
    travel: {
      kicker: "13 · Web · Travel",
      title: "Travel & tour site",
      tagline: "A tour-operator site with recommended itineraries, galleries and a responsive Bootstrap front end.",
      meta: [
        ["Role", "Front-end"],
        ["Status", "Shipped"],
        ["Access", "Live site"]
      ],
      sections: [
        {
          h: "The brief",
          p: "A tour operator needed a site that sells trips: clear itineraries, good photography and a layout that works on a phone."
        },
        {
          h: "What I built",
          list: [
            "Itinerary pages with day-by-day plans and galleries.",
            "A responsive Bootstrap front end."
          ]
        },
        {
          h: "What I learned",
          p: "Tour pages sell with photography, so image weight was the real performance budget."
        }
      ],
      stack: ["HTML", "CSS", "Bootstrap"],
      note: "Live site — the link is on the card."
    },
    event: {
      kicker: "14 · Web · Operations",
      title: "Event management system",
      tagline: "A Laravel back office for creating events and tracking attendees.",
      meta: [
        ["Role", "Back-office build"],
        ["Status", "Delivered"],
        ["Access", "Private"]
      ],
      sections: [
        {
          h: "The brief",
          p: "Running an event means creating it once and then chasing attendance. The back office had to make both parts boring."
        },
        {
          h: "What I built",
          list: [
            "A Laravel back office for creating events.",
            "Attendee tracking tied to each event.",
            "Laravel Breeze for authentication."
          ]
        },
        {
          h: "What I learned",
          p: "Event tools are check-in tools in disguise. The most useful screen is the one staff open at the door."
        }
      ],
      stack: ["Laravel", "MySQL", "Breeze"],
      note: "Private back office."
    },
    sayar: {
      kicker: "15 · Lab · Fintech",
      title: "Sayar bookkeeping assistant",
      tagline: "A Burmese-first ledger for home-based women micro-entrepreneurs — AI drafts each record, the owner confirms before it is saved.",
      meta: [
        ["Role", "Product prototype"],
        ["Status", "Prototype"],
        ["Access", "Concept"]
      ],
      sections: [
        {
          h: "The brief",
          p: "Home-based women micro-entrepreneurs keep accounts in their heads or on paper. An app has to speak Burmese first and never move money without the owner's confirmation."
        },
        {
          h: "What I built",
          list: [
            "A Burmese-first ledger for income and expenses.",
            "AI that drafts a record from a short description.",
            "A confirm step before anything is saved, so the owner stays the author of the books."
          ]
        },
        {
          h: "What I learned",
          p: "For money, AI should propose and a human should commit. The confirmation step is the product, not the model."
        }
      ],
      stack: ["Laravel", "AI", "Burmese UI"],
      note: "Prototype built for a social-impact brief."
    },
    plants: {
      kicker: "16 · Lab · IoT",
      title: "PlantsFriend",
      tagline: "ESP32 sensors feed a Laravel API and a React Native app for monitoring a plant's readings.",
      meta: [
        ["Role", "Full-stack & hardware"],
        ["Status", "Prototype"],
        ["Access", "Private"]
      ],
      sections: [
        {
          h: "The brief",
          p: "Houseplants die quietly. The idea was to make a plant's readings visible on the phone before the leaves explain it."
        },
        {
          h: "What I built",
          list: [
            "ESP32 sensors sending readings to a Laravel API.",
            "A React Native app that charts the readings.",
            "A small hardware-to-API path I could test end to end."
          ]
        },
        {
          h: "What I learned",
          p: "Hardware makes failure visible. When a packet drops, the chart has a gap — and the UI has to admit the gap rather than smooth it over."
        }
      ],
      stack: ["ESP32", "Laravel", "React Native"],
      note: "Personal prototype."
    },
    distribution: {
      kicker: "17 · Lab · Cloud",
      title: "Distribution reorder automation",
      tagline: "AWS Lambda and DynamoDB watch stock; Claude drafts purchase orders and Telegram handles approval.",
      meta: [
        ["Role", "Cloud & AI"],
        ["Status", "Prototype"],
        ["Access", "Private"]
      ],
      sections: [
        {
          h: "The brief",
          p: "Reorder decisions sat with one person and a stock sheet. The experiment: can serverless and an LLM remove the busywork without removing the judgement?"
        },
        {
          h: "What I built",
          list: [
            "AWS Lambda and DynamoDB watching stock levels.",
            "Claude drafting a purchase order when stock crosses a threshold.",
            "Telegram as the approval surface, so a human still signs off."
          ]
        },
        {
          h: "What I learned",
          p: "Automating a purchase order is easy; making the approval safe is the work. The bot has to show the numbers behind each draft."
        }
      ],
      stack: ["AWS SAM", "Bedrock", "DynamoDB", "Telegram"],
      note: "Internal experiment."
    },
    hub: {
      kicker: "18 · Lab · Tooling",
      title: "Local dev launcher",
      tagline: "A small Node hub that starts several local projects on free ports and opens them from one dashboard.",
      meta: [
        ["Role", "Tooling"],
        ["Status", "In use"],
        ["Access", "Private"]
      ],
      sections: [
        {
          h: "The brief",
          p: "Several local projects, the same ports, and a pile of terminal tabs. The fix did not need to be a platform."
        },
        {
          h: "What I built",
          list: [
            "A small Node / Express hub that starts each project on a free port.",
            "One dashboard to open them all."
          ]
        },
        {
          h: "What I learned",
          p: "The best internal tool is the one you stop noticing. Local, small, no login."
        }
      ],
      stack: ["Node.js", "Express", "Tooling"],
      note: "Personal tooling."
    }
  };

  const casesMy = {
    law: {
      kicker: "01 · AI / ဥပဒေနည်းပညာ · 2026",
      title: "မြန်မာဥပဒေ လမ်းညွှန်",
      tagline: "ကိုးကားချက်များဖြင့် ဖြေကြားပြီး ခန့်မှန်းချက်များဖြင့် မဖြေကြားသော နှစ်ဘာသာ ဥပဒေရေးရာ အကူအညီပေးစနစ်။",
      meta: [
        ["နှစ်", "2026"],
        ["အခြေအနေ", "တည်ဆောက်နေဆဲ"],
        ["အခန်းကဏ္ဍ", "ဖူးလ်စတက် နှင့် AI ပေါင်းစပ်မှု"],
        ["အသုံးပြုခွင့်", "သီးသန့်ထုတ်ကုန်"]
      ],
      sections: [
        {
          h: "ပြဿနာ",
          p: "မြန်မာဥပဒေများသည် စကင်ဖတ်ထားသော PDF များ၊ ဆယ်စုနှစ်ချီ ပြင်ဆင်ချက်များနှင့် မြန်မာ/အင်္ဂလိပ် ရောနှောစာသားများအကြား ကွဲလွင့်နေသည်။ ယေဘုယျ chatbot တစ်ခုက ပုဒ်မနံပါတ်ကို ယုံကြည်မှုအပြည့်ဖြင့် လုပ်ကြံနိုင်သည် — ဥပဒေအခြေအနေတွင် ယုံကြည်မှုရှိရှိ မှားယွင်းသောအဖြေသည် အဖြေမရှိခြင်းထက် ပိုဆိုးသည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "pdftoppm နှင့် Tesseract (mya+eng) ကို အသုံးပြုပြီး စကင်ဖတ်ထားသော ဥပဒေစာအုပ်များကို ရှာဖွေနိုင်သော စာသားအဖြစ် ပြောင်းသည့် offline OCR လုပ်ငန်းစဉ်။",
            "'Section'၊ 'ပုဒ်မ' နှင့် 'Article' အမှတ်အသားများဖြင့် ခွဲခြမ်းပြီး တစ်ပိုင်းစီကို Bedrock Titan V2 ဖြင့် PostgreSQL + pgvector ထဲ embed လုပ်သည့် ပုဒ်မသိစနစ်။",
            "ကိုးကားချက်ကို ဦးစားပေးသော RAG လုပ်ငန်းစဉ် — သက်ဆိုင်ရာ စာပိုဒ်များကို ရှာယူပြီး ယုံကြည်မှုနည်းသော ကိုက်ညီမှုများကို ငြင်းပယ်ကာ အဖြေတိုင်းနှင့်အတူ ဥပဒေအမည် + ပုဒ်မကို ပြန်ပေးသည်။",
            "မြန်မာ/အင်္ဂလိပ်/ရောနှော chat၊ ရှာဖွေနိုင်သော ဥပဒေစာကြည့်တိုက်၊ နှိပ်ကြည့်နိုင်သော ကိုးကားချက်များနှင့် အမြဲပြထားသော 'ဥပဒေအကြံဉာဏ် မဟုတ်ပါ' သတိပေးချက်ပါ Flutter client။",
            "မူရင်း PDF များအတွက် လက်မှတ်ရေးထိုးထားသော S3 link များ — ကိုးကားချက်ကို နှိပ်လိုက်လျှင် ပြန်ပြောထားချက်မဟုတ်ဘဲ မူရင်းဥပဒေကို ဖွင့်ပြသည်။"
          ]
        },
        {
          h: "အင်ဂျင်နီယာမှတ်စုများ",
          p: "API ကို Laravel 12 ဖြင့် လည်ပတ်သည်။ retrieval တွင် pgvector ၏ cosine distance ကို ထင်ရှားသော ယုံကြည်မှုသတ်မှတ်ချက်နှင့်အတူ အသုံးပြုသည်။ system prompt နှင့် disclaimer ကို server ဘက်တွင် အတင်းအကျပ် ထိန်းချုပ်ထားသဖြင့် အသုံးပြုသူက prompt ဖြင့် ဖယ်ရှား၍ မရပါ။ မူရင်း PDF သည် အခွင့်အာဏာရှိဆဲဖြစ်ပြီး မော်ဒယ်သည် retrieval ရှာတွေ့သည်ကို ရှင်းပြခွင့်သာ ရှိသည်။"
        },
        {
          h: "ရလဒ်",
          p: "ထုတ်ကုန်သည် ဂရုတစိုက် သုတေသနအကူအညီပေးသူတစ်ဦးလို ပြုမူသည် — ကိုးကားချက်များ ပြသည်၊ မသိလျှင် ဝန်ခံသည်၊ အသုံးပြုသူကို မူရင်းဥပဒေနှင့် တစ်နှိပ်အကွာအတွင်း ထားရှိသည်။ လက်ရှိ OCR နှင့် ထည့်သွင်းမှုလုပ်ငန်းစဉ် တည်ဆောက်ပြီးစီးထားပြီး ဖွံ့ဖြိုးဆဲဖြစ်သည်။"
        }
      ],
      note: "သီးသန့် ထုတ်ကုန်တည်ဆောက်မှု — repository နှင့် နောက်ထပ် screenshot များကို တောင်းဆိုပါက ရယူနိုင်သည်။"
    },
    blood: {
      kicker: "02 · ကျန်းမာရေးနည်းပညာ / PWA · 2026",
      title: "BloodLink မြန်မာ",
      tagline: "Facebook ပေါ်တွင် သွေးကို ညှိနှိုင်းနေရသော နိုင်ငံအတွက် ကိုယ်ရေးကိုယ်တာကို ဦးစားပေးသည့် အလှူရှင်ကွန်ရက်။",
      meta: [
        ["နှစ်", "2026"],
        ["အခြေအနေ", "ထုတ်ကုန်တည်ဆောက်မှု"],
        ["အခန်းကဏ္ဍ", "ဖူးလ်စတက် — Flutter + Laravel"],
        ["အသုံးပြုခွင့်", "သီးသန့်ထုတ်ကုန်"]
      ],
      sections: [
        {
          h: "ပြဿနာ",
          p: "အရေးပေါ် သွေးတောင်းဆိုမှုများသည် Facebook အဖွဲ့များနှင့် chat app များမှတစ်ဆင့် ပျံ့နှံ့သည်။ အလှူရှင် ဖုန်းနံပါတ်များကို လူသိရှင်ကြား တင်ထားပြီး လှူနိုင်မှုအခြေအနေကို မသိရသဖြင့် လက်ခံသူများသည် မလှူနိုင်သူများကို နာရီပေါင်းများစွာ ဖုန်းဆက်ရသည်။ ညှိနှိုင်းမှု အလုပ်ဖြစ်သော်လည်း ကူညီသူများကို ထုတ်ဖော်မိစေသည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "သွေးအုပ်စု၊ မြို့နယ်နှင့် လက်ရှိရနိုင်မှုအလိုက် ကိုက်ညီမှုကို သိရှိသော အလှူရှင်ရှာဖွေမှု။",
            "အလှူရှင် လက်ခံသည်အထိ ဖုန်းနံပါတ်များကို ဖုံးကွယ်ထားသော ဆက်သွယ်ရန်တောင်းဆိုမှုများ။",
            "90/120 ရက် လှူနိုင်မှု ရေတွက်ချက်အပြင် အပတ်စဉ် အချိန်ကွက်များနှင့် နေ့စဉ် အခြေအနေစစ်ဆေးမှုများ — ထို့ကြောင့် 'ယခု ရနိုင်သည်' ဆိုသည်မှာ လှူနိုင်ခွင့်ရှိပြီး အတည်ပြုထားသော အချိန်ကွက်အတွင်း ရှိနေခြင်းဖြစ်သည်။",
            "အတည်ပြုထားသော ဆေးရုံများ၊ သွေးဘဏ်များ၊ ကြက်ခြေနီဌာနခွဲများနှင့် ဖောင်ဒေးရှင်းများ၏ လမ်းညွှန်။",
            "စောင့်ကြည့်စစ်ဆေးမှု၊ အသုံးပြုသူ ဖွင့်ပေးမှု၊ တောင်းဆိုမှုအခြေအနေနှင့် လှူဒါန်းမှု အတည်ပြုချက်အတွက် admin dashboard။",
            "နှစ်ဘာသာ အင်္ဂလိပ်/မြန်မာ UI၊ app အတွင်း ကိုယ်ရေးကိုယ်တာနှင့် စည်းကမ်းစာမျက်နှာများ၊ အစီရင်ခံမှုနှင့် ကိုယ်ရေးအချက်အလက်များကို အမည်မသိဖြစ်စေသည့် အကောင့်ဖျက်ခြင်း။"
          ]
        },
        {
          h: "အင်ဂျင်နီယာမှတ်စုများ",
          p: "Laravel 12 + Sanctum + MySQL 8.4 အပေါ် Flutter 3.50 PWA။ ရနိုင်မှုအချိန်ကွက်များကို server timezone မည်သို့ပင်ဖြစ်စေ Asia/Yangon ဖြင့် တွက်ချက်ပြီး API က လှူနိုင်မှုနှင့် ရနိုင်မှုကို သီးခြားထားသဖြင့် ရှာဖွေမှုရလဒ်များ မှန်ကန်နေသည်။ ဆက်သွယ်ရန်အချက်အလက်များကို တောင်းဆိုမှု လက်ခံပြီးမှသာ ထုတ်ပေးသည်။"
        },
        {
          h: "ရလဒ်",
          p: "ဖုန်းနံပါတ်ကို ထုတ်ဖော်ရမည့်အရာမဟုတ်ဘဲ ချေးငှားရသည့်အရာအဖြစ် သဘောထားသော အလှူရှင်ကွန်ရက်။ app သည် install လုပ်နိုင်သော PWA အဖြစ် အလုပ်လုပ်ပြီး တူညီသော Flutter ကုဒ်ဘေ့စ်ဖြင့် Android နှင့် iOS ကို ပစ်မှတ်ထားသည်။"
        }
      ],
      note: "သီးသန့် ထုတ်ကုန်တည်ဆောက်မှု — repository ကို အများသို့ မဖွင့်ထားပါ။"
    },
    terminal: {
      kicker: "03 · ထောက်ပံ့ပို့ဆောင်ရေး / လုပ်ငန်းစဉ် · 2026",
      title: "မန္တလေး တာမီနယ်နှင့် ပို့ဆောင်ရေး",
      tagline: "ဘတ်စ်ကားများ၊ တက္ကစီများနှင့် ပါဆယ်များအတွက် ထိန်းချုပ်ခန်း တစ်ခုတည်း။",
      meta: [
        ["နှစ်", "2026"],
        ["အခြေအနေ", "ထုတ်လုပ်ပြီး"],
        ["အခန်းကဏ္ဍ", "ဖူးလ်စတက် နှင့် မိုဘိုင်း"],
        ["အသုံးပြုခွင့်", "သီးသန့်ထုတ်ကုန်"]
      ],
      sections: [
        {
          h: "ပြဿနာ",
          p: "အလုပ်များသော မန္တလေးတာမီနယ်တစ်ခုကို spreadsheet များ၊ ဖုန်းခေါ်ဆိုမှုများနှင့် စက္ကူမှတ်စုများဖြင့် လည်ပတ်ခဲ့သည်။ ခရီးစဉ်များ၊ ဂိတ်များ၊ တက္ကစီ လာယူမှုများ၊ ပါဆယ်ပို့ဆောင်မှုများနှင့် ယာဉ်မောင်းလုပ်ခများသည် လူတစ်ဦးစီ၏ ခေါင်းထဲတွင် ကွဲနေခဲ့သည်။ 'ဒီပါဆယ် ဘယ်ရောက်နေလဲ' သို့မဟုတ် 'ဒီဂိတ်မှာ ဘယ်သူရှိလဲ' ဟူသော မေးခွန်းအတွက် မျှဝေထားသော အဖြေ မရှိခဲ့ပါ။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "တာမီနယ်များ၊ ဂိတ်များနှင့် ခရီးစဉ်အစီအစဉ်များအတွက် Excel import/export၊ စစ်ဆေးမှုနှင့် import တိုးတက်မှုပါသော စီမံခန့်ခွဲရေးစနစ်။",
            "တက္ကစီ ခွဲဝေမှု — ယာဉ်မောင်းများ သတ်မှတ်ခြင်း၊ အခြေအနေ မွမ်းမံခြင်းနှင့် ဝန်ဆောင်မှုတောင်းဆိုမှုများကို အစမှအဆုံး ခြေရာခံခြင်း။",
            "ပါဆယ်ပို့ဆောင်မှု လုပ်ငန်းစဉ် — ဖောက်သည်ရှာဖွေမှု၊ ကိုယ်စား ဖန်တီးမှု၊ ပို့ဆောင်သူ သတ်မှတ်မှု၊ ပယ်ဖျက်မှုနှင့် အခြေအနေမှတ်တမ်း။",
            "စွမ်းဆောင်ရည် အသေးစိတ်၊ payslip ထုတ်ခြင်းနှင့် တည်နေရာမှတ်တမ်းပါသော ယာဉ်မောင်းနှင့် ပို့ဆောင်သူ စီမံခန့်ခွဲမှု။",
            "လမ်းပေါ်ရှိ ယာဉ်မောင်းများအတွက် မြေပုံများ၊ push အသိပေးချက်များနှင့် တိုက်ရိုက်တည်နေရာ ပေးပို့မှုပါသော Flutter app။",
            "ထိန်းချုပ်ခန်းအတွက် တိုက်ရိုက် လုပ်ငန်းစဉ်မြေပုံနှင့် KPI ကြည့်ရှုခန်း။"
          ]
        },
        {
          h: "အင်ဂျင်နီယာမှတ်စုများ",
          p: "admin အတွက် Laravel 11 + Inertia/React၊ MySQL နှင့် ကြီးမားသော spreadsheet များအတွက် queue အခြေခံ import များ။ အစုလိုက် ထည့်သွင်းမှုကို developer များမဟုတ်ဘဲ လုပ်ငန်းလည်ပတ်သူများအတွက် ဒီဇိုင်းဆွဲထားသည် — နမူနာ download လုပ်ပါ၊ upload တင်ပါ၊ ပြီးလျှင် တိုးတက်မှုကို ကြည့်ပါ။ Flutter app က Google Maps/Flutter Map နှင့် Firebase အသိပေးချက်များကို အသုံးပြုပြီး တည်နေရာကို တူညီသော API သို့ ပြန်ပို့သည်။"
        },
        {
          h: "ရလဒ်",
          p: "ခွဲဝေသူများ တိုက်ရိုက်အခြေအနေ တစ်ခုတည်းကို ရရှိပြီး ယာဉ်မောင်းများ ဖုန်း app ရကာ လုပ်ခငွေတွက်ချက်မှုသည် လစဉ် ရှာဖွေတူးဖော်ရသည့် အလုပ်မဖြစ်တော့ပါ။ ပလက်ဖောင်းက ခရီးစဉ်များ၊ တက္ကစီများ၊ ပါဆယ်များ၊ ယာဉ်မောင်းများ၊ ဂိတ်များနှင့် ငွေကြေးကို တစ်နေရာတည်းတွင် ဖုံးလွှမ်းသည်။"
        }
      ],
      note: "သီးသန့်ထုတ်ကုန် — အဖွဲ့အစည်းအမည်နှင့် လုပ်ငန်းလည်ပတ်မှု screenshot များကို ချန်လှပ်ထားသည်။"
    },
    licence: {
      kicker: "04 · လုပ်ငန်းကြီး · 2026",
      title: "လိုင်စင်ဝန်ဆောင်မှု ပလက်ဖောင်း",
      tagline: "လိုင်စင်ဝန်ဆောင်မှုလုပ်ငန်းအတွက် ရုံးခန်းနောက်ခံစနစ် — လျှောက်လွှာလက်ခံမှုမှ လုပ်ခငွေအထိ။",
      meta: [
        ["နှစ်", "2026"],
        ["အခြေအနေ", "ဖောက်သည်အတွက် ပေးအပ်ပြီး"],
        ["အခန်းကဏ္ဍ", "ဖူးလ်စတက်"],
        ["အသုံးပြုခွင့်", "NDA အောက်တွင်"]
      ],
      sections: [
        {
          h: "ပြဿနာ",
          p: "ခွဲခွဲထားသော လိုင်စင်ဝန်ဆောင်မှုများတွင် ကိုယ်စားလှယ်များ၊ ချိန်းဆိုမှုများ၊ ယာဉ်စစ်ဆေးမှုများ၊ အဆင့်လိုက် လျှောက်လွှာများ၊ ကော်မရှင်များ၊ ငွေကြိုထုတ်မှုများနှင့် လုပ်ခငွေများ ပါဝင်သည်။ Spreadsheet များက ခွင့်ပြုချက်များကို မထိန်းချုပ်နိုင်၊ အမှုတစ်ခု ဘယ်အဆင့်ရောက်နေသည်ကို မပြနိုင်၊ ငွေကြေးနှင့် စာရွက်စာတမ်းများကို ကိုက်ညီအောင် မထိန်းသိမ်းနိုင်ခဲ့ပါ။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "ပိုင်ရှင် / ခေါင်းဆောင် / ဒုခေါင်းဆောင် / အဖွဲ့ဝင် အဆင့်ဆင့်နှင့် server ဘက်တွင် အတင်းအကျပ် ထိန်းချုပ်ထားသော အသေးစိတ် ခွင့်ပြုချက်ဇယား။",
            "လုပ်ဆောင်မှုမှတ်တမ်းများ၊ မှတ်ချက်များနှင့် အဆင့်ပြောင်းတိုင်း စာရင်းစစ်မှတ်တမ်းပါသော အဆင့်လိုက် လျှောက်လွှာလုပ်ငန်းစဉ်။",
            "ချိန်းဆိုမှုများ၊ တိုက်ရိုက် ယာဉ်စစ်ဆေးမှုများ၊ ယာဉ်မောင်း တည်ရှိမှုနှင့် ပြန်လည်လျှောက်ထားမှု လုပ်ငန်းစဉ်များ။",
            "ကိုယ်စားလှယ်များ၊ ဝန်ဆောင်မှုကြေးများ၊ အသုံးစရိတ်များ၊ ငွေကြိုထုတ်မှုများ၊ လုပ်ခမှတ်တမ်းနှင့် ဘဏ္ဍာရေးအစီရင်ခံစာများ။",
            "OTP အခြေခံ စကားဝှက် ပြန်လည်သတ်မှတ်မှုနှင့် ပိုင်ရှင်သာ ရယူနိုင်သော သက်တမ်းတိုလက်မှတ်ရေးထိုး backup download များ။",
            "React 19၊ PrimeReact၊ Tailwind 4 နှင့် TanStack Query ဖြင့် တည်ဆောက်ထားသော UI။"
          ]
        },
        {
          h: "အင်ဂျင်နီယာမှတ်စုများ",
          p: "Sanctum bearer token ပါသော Laravel 11 API; ရှေ့ပိုင်းတွင် React 19/Vite။ server state ကို TanStack Query က ကိုင်တွယ်ပြီး navigation ကို React Router 7 က ကိုင်တွယ်သည်။ ခွင့်ပြုချက်များကို UI တွင်သာ ဖုံးကွယ်ထားခြင်းမဟုတ်ဘဲ API တွင် အတင်းအကျပ် ထိန်းချုပ်ပြီး ငွေကြေး/အဆင့် ပြောင်းလဲမှုများကို စာရင်းစစ်အတွက် မှတ်တမ်းတင်သည်။ Backup များကို အများသုံးဖိုင်အဖြစ် ထားခြင်းမဟုတ်ဘဲ ဖန်တီးပြီး လက်မှတ်ရေးထိုးကာ သက်တမ်းကုန်ဆုံးစေသည်။"
        },
        {
          h: "ရလဒ်",
          p: "ဌာနခွဲတစ်ခုက အမှုတစ်ခုကို လမ်းကြောင်းမပြတ်ဘဲ — ငွေကြေးပါ မလွဲချော်ဘဲ — လည်ပတ်နိုင်သည့် စနစ်တစ်ခုတည်း။ ခွင့်ပြုချက်မော်ဒယ်နှင့် စာရင်းစစ်မှတ်တမ်းက ဌာနခွဲများစွာ လည်ပတ်မှုကို အန္တရာယ်များစေခဲ့သည့် spreadsheet ခန့်မှန်းမှုများကို အစားထိုးလိုက်သည်။"
        }
      ],
      note: "ဖောက်သည်လုပ်ငန်း — ကုမ္ပဏီအမည်၊ ဘရန်၊ screenshot များနှင့် repository ကို ချန်လှပ်ထားသည်။"
    },
    micine: {
      kicker: "05 · ဖောက်သည်လုပ်ငန်း · အာမခံ",
      title: "Micine / Minum ပလက်ဖောင်း",
      tagline: "ဂျပန်အာမခံထုတ်ကုန်တစ်ခုအတွက် လျှောက်လွှာ၊ ဖောက်သည်ပေါ်တယ်နှင့် ပေါ်လစီစီမံခန့်ခွဲမှု။",
      meta: [
        ["အခန်းကဏ္ဍ", "ဖူးလ်စတက် အင်ဂျင်နီယာ"],
        ["အခြေအနေ", "ဖောက်သည်လုပ်ငန်း ပေးအပ်ပြီး"],
        ["အသုံးပြုခွင့်", "NDA အောက်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "ဂျပန်အာမခံကုမ္ပဏီတစ်ခုအတွက် လျှောက်လွှာ၊ ဖောက်သည်ပေါ်တယ်နှင့် ပေါ်လစီစီမံခန့်ခွဲမှုကို စနစ်တစ်ခုတည်းတွင် စုစည်းရန် လိုအပ်ခဲ့သည် — အာမခံလုပ်ငန်း၏ စာရွက်စာတမ်း၊ အခြေအနေနှင့် ခွင့်ပြုချက်လိုအပ်ချက်များနှင့်အတူ။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "ပေါ်လစီတစ်ခု စစ်ဆေးမှုမတိုင်မီ လိုအပ်သည့်အချက်များကို ဖမ်းယူပြီး လျှောက်ထားသူနှင့် နောက်ခံရုံး နှစ်ဖက်စလုံး မြင်နိုင်သော အခြေအနေများပါ လျှောက်လွှာလုပ်ငန်းစဉ်။",
            "ပေါ်လစီပိုင်ရှင်များ မိမိတို့၏ အာမခံအကျုံးဝင်မှုနှင့် တောင်းဆိုမှုအခြေအနေကို ကြည့်နိုင်သော ဖောက်သည်ပေါ်တယ်။",
            "ဖောက်သည်၏ ဂျပန်ဘာသာ လုပ်ငန်းစဉ်များကို အခြေခံသည့် ပေါ်လစီစီမံခန့်ခွဲမှု မျက်နှာပြင်များ။",
            "Laravel API ပေါ်တွင် React front end၊ AWS ပေါ်တွင် အထောက်အကူပြု service များ။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "အာမခံလုပ်ငန်းတွင် စကားလုံးတစ်လုံးသည် စာချုပ်ဖြစ်သည်။ အင်ဂျင်နီယာသင်ခန်းစာမှာ ပေါ်လစီအခြေအနေကို ရှင်းရှင်းလင်းလင်း ထိန်းထားရန်ဖြစ်သည် — မျက်နှာပြင်တစ်ခုစီတွင် ခန့်မှန်းမနေဘဲ တစ်ခုတည်းသော အရင်းအမြစ်ကို ဖတ်စေရန်။"
        }
      ],
      note: "ဖောက်သည်လုပ်ငန်း — ဘရန်၊ screenshot နှင့် repository ကို ချန်လှပ်ထားသည်။"
    },
    car: {
      kicker: "06 · ထုတ်ကုန် · မော်ဘီလီတီ",
      title: "ကားအငှား ပလက်ဖောင်း",
      tagline: "Expo ဖောက်သည် app နှင့် Laravel/Inertia စီမံခန့်ခွဲရေးစနစ် — ကြော်ငြာများ၊ ကြိုတင်မှာယူမှုများ၊ ယာဉ်မောင်းများနှင့် chat။",
      meta: [
        ["အခန်းကဏ္ဍ", "ထုတ်ကုန်အင်ဂျင်နီယာ"],
        ["အခြေအနေ", "ပို့ဆောင်ပြီး"],
        ["အသုံးပြုခွင့်", "NDA အောက်တွင်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "ကားငှားခြင်းတွင် ပါဝင်သူသုံးဦးနှင့် ပြက္ခဒိန်တစ်ခု ရှိသည် — ဖောက်သည်၊ ကားနှင့် ယာဉ်မောင်း။ ကြော်ငြာမှ အတည်ပြုထားသော ကြိုတင်မှာယူမှုအထိ သုံးဦးစလုံးကို တစ်ပြိုင်နက် ထိန်းညှိရမည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "ကားများ ရှာဖွေခြင်း၊ ရနိုင်မှုစစ်ဆေးခြင်းနှင့် ကြိုတင်မှာယူခြင်းအတွက် Expo / React Native ဖောက်သည် app။",
            "ကြော်ငြာများ၊ ကြိုတင်မှာယူမှုများ၊ ယာဉ်မောင်းများနှင့် chat အတွက် Laravel + Inertia စီမံခန့်ခွဲရေးစနစ်။",
            "app နှင့် စီမံခန့်ခွဲရေးစနစ် တူညီသော ရနိုင်မှုကို ဖတ်နိုင်ရန် မျှဝေ API။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "ကြိုတင်မှာယူမှုတစ်ခုသည် အခြေအနေအဆင့်ဆင့် စက်ငယ်တစ်ခုဖြစ်သည်။ အလံများ ဖြန့်ထားမည့်အစား အခြေအနေများအဖြစ် ပုံစံချလိုက်သည်နှင့် UI နှင့် ထောင့်ကွက်အခြေအနေများ ရိုးရှင်းလာသည်။"
        }
      ],
      note: "NDA အောက်တွင် — ကုဒ်လမ်းညွှန်ကို တောင်းဆိုပါက ရယူနိုင်သည်။"
    },
    chem: {
      kicker: "07 · ထုတ်ကုန် · ပညာရေး",
      title: "ChemTeacher",
      tagline: "မြန်မာကျောင်းသားများအတွက် G10–G12 ဓာတုဗေဒ လေ့လာရေး app — ဈေးနှုန်း၊ မိတ်ဆက်မှုနှင့် ပြန်လည်ရောင်းချသူများ အပါအဝင်။",
      meta: [
        ["အခန်းကဏ္ဍ", "ထုတ်ကုန်အင်ဂျင်နီယာ"],
        ["အခြေအနေ", "ပို့ဆောင်ပြီး"],
        ["အသုံးပြုခွင့်", "စီးပွားရေးထုတ်ကုန်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "မြန်မာကျောင်းသားများသည် ဖုန်းမျှဝေသုံးစွဲရသည့်အခြေအနေတွင် အရေးကြီးစာမေးပွဲများအတွက် ဓာတုဗေဒ လေ့လာကြသည်။ app သည် ဈေးနှုန်းတတ်နိုင်ရမည်၊ စမ်းသုံးလွယ်ရမည်၊ ဒေသခံလုပ်ဖော်ကိုင်ဖက်များ ပြန်လည်ရောင်းချရန် လွယ်ကူရမည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "G10–G12 ဓာတုဗေဒအတွက် Flutter လေ့လာရေး app။",
            "ဒေသခံငွေပေးချေမှုအလေ့အထနှင့် ကိုက်ညီသော ဈေးနှုန်းနှင့် အသုံးပြုခွင့်အစီအစဉ်များ။",
            "ဆရာများ ဖြန့်ဝေနိုင်ရန် မိတ်ဆက်မှုဆုလာဘ်များနှင့် ပြန်လည်ရောင်းချသူ ကိရိယာများ။",
            "အကောင့်၊ အစီအစဉ်နှင့် မိတ်ဆက်မှုများအတွက် Laravel / MySQL backend။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "ကျောင်းသားများထံ ရောင်းချခြင်းသည် ဒီဇိုင်းကန့်သတ်ချက်တစ်ခုဖြစ်သည် — မျှဝေသုံးဖုန်းများ၊ ပြတ်တောက်သော ငွေပေးချေမှုများနှင့် ပထမဆုံးအစည်းအဝေးတွင် တန်ဖိုးကို သက်သေပြရန် လိုအပ်ချက်။"
        }
      ],
      note: "စီးပွားရေးထုတ်ကုန် — repository သီးသန့်။"
    },
    vibe: {
      kicker: "08 · အလိုအလျောက်စနစ် · ပညာရေး",
      title: "Vibe Learning မားကတ်တင်း HQ",
      tagline: "Agent များက မူကြမ်းရေးသည်၊ သို့သော် ဘာကို ထုတ်ဝေမည်ကို ဆရာနှင့် လူသားက ဆုံးဖြတ်သည်။",
      meta: [
        ["အခန်းကဏ္ဍ", "အလိုအလျောက်စနစ်နှင့် ဖူးလ်စတက်"],
        ["အခြေအနေ", "အသုံးပြုနေဆဲ"],
        ["အသုံးပြုခွင့်", "သီးသန့် repository"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "Grade 12 လေ့လာရေး app တစ်ခုသည် Telegram နှင့် TikTok တွင် ပုံမှန်တင်ထားရန် လိုအပ်သည်၊ သို့သော် ကိုယ်တိုင်တင်ခြင်းသည် နှေးသည်။ လေ့လာရေးအကြောင်းအရာသည် အမှားမခံနိုင်သော နယ်ပယ်ဖြစ်သည် — မှားသော ဖော်မြူလာ သို့မဟုတ် အောင်မြင်မည်ဟု အာမခံသည့် စကားသည် ပို့စ်ဖျက်လိုက်ရုံနှင့် မပြန်လည်နိုင်သော ထိခိုက်မှု ဖြစ်စေသည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "အကြောင်းအရာ ပြက္ခဒိန်ကို JSON အတည်ပြုချက်တန်းထဲ မူကြမ်းအဖြစ် ပြောင်းပေးသည့် အဆင့်လေးဆင့် agent လုပ်ငန်းစဉ် — content writer၊ graphic designer၊ video editor နှင့် post admin။",
            "စာသားအရှည်ကန့်သတ်ချက်၊ hashtag၊ app link၊ TikTok အတွက် AIGC အမှတ်အသားနှင့် မြန်မာ/အင်္ဂလိပ် တားမြစ်စကားလုံးစာရင်းကို ထိန်းချုပ်သည့် ဘရန်စည်းမျဉ်းစောင့်။",
            "ပညာရေးဆိုင်ရာ QA တံခါး — ဆရာက အချက်၊ ဖော်မြူလာနှင့် ယူနစ်တိုင်းကို အတည်ပြုသည်အထိ သင်ခန်းစာပို့စ်များ ထုတ်ဝေခွင့်မရ။",
            "Bot API ဖြင့် Telegram ထုတ်ဝေခြင်း၊ ကိုယ်တိုင်တင်ရန် TikTok caption နှင့် asset ပြင်ဆင်ခြင်း၊ Asia/Yangon အချိန်ဇယားအတိုင်း အတည်ပြုပြီးပို့စ်များကို တင်သည့် watch mode။",
            "တန်း၊ အဖွဲ့နှင့် လက်ရှိဘရန်စည်းမျဉ်းများအတွက် ဒေသတွင်း dashboard — dependency မလိုသော Node server ငယ်တစ်ခုက ဝန်ဆောင်သည်။"
          ]
        },
        {
          h: "အင်ဂျင်နီယာမှတ်စုများ",
          p: "Node 18+ နှင့် ES modules၊ framework မပါ။ တန်းသည် JSON ရိုးရိုး၊ dashboard သည် vanilla JS၊ လုပ်ဆောင်ချက်တိုင်းသည် CLI command သို့မဟုတ် ခလုတ်တစ်ခု။ မူကြမ်းများသည် idempotent ဖြစ်သဖြင့် ပြက္ခဒိန်ကို ပြန်လည် run လုပ်လျှင် ပို့စ်များ ထပ်မဖြစ်ပါ။ ပုံသေမှာ ဘေးကင်းသည် — အတည်ပြုချက်မပါဘဲ ဘာမှ မထုတ်ဝေပါ၊ သင်ခန်းစာနှင့်ဆိုင်လျှင် QA မပါဘဲ ဘာမှ မထုတ်ဝေပါ။"
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "အတည်ပြုချက်တံခါးများသည် ပွတ်တိုက်မှုမဟုတ်ဘဲ ထုတ်ကုန်အင်္ဂါရပ်ဖြစ်သည်။ တားမြစ်စကားလုံးစာရင်းနှင့် QA တံခါးကို ရေးဆွဲရင်း ဘရန်အတွက် မှန်ကန်ခြင်းဆိုသည်မှာ ဘာကို ဆိုလိုသည်ကို သတ်မှတ်ရသည်။ ထုတ်ဝေရန် ငြင်းဆန်နိုင်သောကြောင့် စနစ်က ပိုယုံကြည်ရသည်။"
        }
      ],
      note: "သီးသန့် repository — dashboard နှင့် တန်းကို ဒေသတွင်း run သည်။ လမ်းညွှန်ကို တောင်းဆိုပါက ရယူနိုင်သည်။"
    },
    aws: {
      kicker: "09 · စမ်းသပ်ခန်း · ကလောက်",
      title: "AWS အခြေခံ စမ်းသပ်ခန်း",
      tagline: "တည်ဆောက်ပြီး ကလောက်ကို သင်ယူ၊ နားလည်ကြောင်း သက်သေပြသည့် လမ်းညွှန်ကို ရေးသည်။",
      meta: [
        ["အခန်းကဏ္ဍ", "ကိုယ်တိုင် သင်ယူသည့် စမ်းသပ်ခန်း"],
        ["အခြေအနေ", "ဆက်လက်လုပ်ဆောင်နေဆဲ"],
        ["အသုံးပြုခွင့်", "သင်ယူရေးစမ်းသပ်ခန်း"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "အခြေခံအဆောက်အအုံကို ချိုးဖျက်ကြည့်ခြင်းဖြင့် အကောင်းဆုံး သင်ယူသည်။ စမ်းသပ်ခန်းက AWS အယူအဆများကို တိကျစေရန်၊ လမ်းညွှန်က သုညမှစသူတစ်ဦးကို ရှင်းပြနိုင်ခြင်း ရှိ/မရှိ စမ်းသပ်ရန် ဖြစ်သည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "EC2၊ IAM role နှင့် policy၊ SSM Session Manager နှင့် S3 remote state ကို Terraform ဖြင့် ချိတ်ဆက်ထားသည်။",
            "console နှိပ်စရာမလိုဘဲ apply၊ စစ်ဆေး၊ ဖျက်ဆီးနိုင်သော ပတ်ဝန်းကျင်။",
            "အစိတ်အပိုင်းတစ်ခုစီကို ဖြတ်သန်းရှင်းပြသည့် မြန်မာနှင့် အင်္ဂလိပ် အစပြုသူလမ်းညွှန်။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "IAM policy တစ်ခု ဘာကြောင့် ဒီပုံစံရှိသည်ကို မရှင်းပြနိုင်လျှင် နားမလည်သေးပါ။ လမ်းညွှန်ရေးခြင်းသည် အမှန်တကယ် ပြန်လည်စစ်ဆေးမှုဖြစ်သည်။"
        }
      ],
      note: "သင်ယူရေးစမ်းသပ်ခန်း — လမ်းညွှန်ကို အစပြုသူများနှင့် မျှဝေသည်။"
    },
    petro: {
      kicker: "10 · ထုတ်ကုန် · လက်လီ",
      title: "Petro လောင်စာဆီဆိုင်",
      tagline: "အဝယ်၊ အရောင်း၊ လက်ကျန်များ၊ ပေးသွင်းသူများ၊ ငွေပေးချေမှုများနှင့် ဘဏ္ဍာရေးမှတ်တမ်းများ။",
      meta: [
        ["အခန်းကဏ္ဍ", "ဖူးလ်စတက်"],
        ["အခြေအနေ", "ပို့ဆောင်ပြီး"],
        ["အသုံးပြုခွင့်", "သီးသန့်ထုတ်ကုန်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "လောင်စာဆီဆိုင်သည် လီတာနှင့် ငွေပေါ်တွင် လည်ပတ်သည်။ အဝယ်၊ အရောင်း၊ လက်ကျန်၊ ပေးသွင်းသူနှင့် ငွေပေးချေမှုအားလုံး ကိုက်ညီရမည်။ ဆိုင်များလာလျှင် spreadsheet က အဖြေမဟုတ်တော့ပါ။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "အဝယ်၊ အရောင်းနှင့် လက်ကျန်များကို စာရင်းတစ်ခုတည်းတွင်။",
            "ပေးသွင်းသူများ၊ ငွေပေးချေမှုများနှင့် ဘဏ္ဍာရေးမှတ်တမ်းများကို တူညီသော အရောင်းအဝယ်များနှင့် ချိတ်ဆက်ထားသည်။",
            "နေ့စဉ်အသုံးပြုရန် Laravel + Inertia + TypeScript နောက်ခံစနစ်။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "လက်လီနောက်ခံစနစ်များသည် စာရင်းကိုက်ညီမှုပေါ်တွင် ရှင်သန်သည် သို့မဟုတ် ကျဆင်းသည်။ စာရင်းက လီတာတိုင်းကို ရှင်းပြနိုင်ရမည်၊ စုစုပေါင်းကိုသာ မဟုတ်ပါ။"
        }
      ],
      note: "သီးသန့်ထုတ်ကုန် — repository နှင့် screenshot များကို အများပြည်သူ မမြင်နိုင်ပါ။"
    },
    bot: {
      kicker: "11 · ထုတ်ကုန် · အလိုအလျောက်စနစ်",
      title: "ပို့ဆောင်ရေး bot",
      tagline: "Telegram နှင့် Viber မှ ပို့ဆောင်ရေးတောင်းဆိုမှုများကို ခြေရာခံနိုင်သော လုပ်ငန်းစဉ်အဖြစ် ပြောင်းပေးသော bot များ။",
      meta: [
        ["အခန်းကဏ္ဍ", "Bot ဖွံ့ဖြိုးတည်ဆောက်မှု"],
        ["အခြေအနေ", "လုပ်ငန်းသုံး လည်ပတ်နေဆဲ"],
        ["အသုံးပြုခွင့်", "သီးသန့်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "ပို့ဆောင်ရေးတောင်းဆိုမှုများသည် Telegram နှင့် Viber chat မက်ဆေ့ချ်အဖြစ် ရောက်လာသည်။ ဖွဲ့စည်းမှုမရှိလျှင် တောင်းဆိုမှုတိုင်း ဖုန်းခေါ်ဆိုမှုဖြစ်လာပြီး ခြေရာခံနိုင်ခြင်း မရှိတော့ပါ။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "ပို့ဆောင်ရေးတောင်းဆိုမှုကို ဖွဲ့စည်းထားသော data အဖြစ် ဖမ်းယူသည့် Telegram နှင့် Viber bot များ။",
            "ဖောက်သည်နှင့် လုပ်ငန်းရှင် နှစ်ဦးစလုံးအတွက် အခြေအနေအပ်ဒိတ်ပါ ခြေရာခံနိုင်သော လုပ်ငန်းစဉ်။",
            "နှစ်ဖက်စလုံး နောက်တစ်ဆင့် ဘာဖြစ်မည်ကို ပြောသည့် အသိပေးချက်များ။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "Chat bot သည် မျက်နှာပြင်မရှိသော UI ဖြစ်သည်။ အခြေအနေတိုင်းအတွက် မက်ဆေ့ချ်တစ်ခု လိုအပ်ပြီး ထိုမက်ဆေ့ချ်သည် မျက်နှာပြင်ဖြစ်သည်။"
        }
      ],
      note: "လုပ်ငန်းသုံးကိရိယာ — စကားပြောမှု screenshot များကို ချန်လှပ်ထားသည်။"
    },
    guide: {
      kicker: "12 · ထုတ်ကုန် · AI",
      title: "Guide4U လေ့လာရေးအဖော်",
      tagline: "တရားဝင်ဖတ်စာအုပ်များကို အခြေခံပြီး မြန်မာလို ရှင်းပြသည် — အင်္ဂလိပ်ဝေါဟာရများ မပျက်ဘဲ။",
      meta: [
        ["အခန်းကဏ္ဍ", "ဖူးလ်စတက်နှင့် AI"],
        ["အခြေအနေ", "ရှေ့ပြေးပုံစံ"],
        ["အသုံးပြုခွင့်", "သီးသန့်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "Grade 12 ကျောင်းသားများသည် ယုံကြည်နိုင်သော အဖြေများ လိုအပ်သည်။ ယေဘုယျ chatbot သည် ဖတ်စာအုပ်အချက်အလက်များကို လုပ်ကြံတတ်သည် — စာမေးပွဲအဖော်တစ်ခု မလုပ်နိုင်သည့် အရာမှာ ထိုအရာဖြစ်သည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "မော်ဒယ်၏ မှတ်ဉာဏ်ထဲမှ မဟုတ်ဘဲ တရားဝင်ဖတ်စာအုပ်များမှ ဖြေကြားသည့် PHP app။",
            "မြန်မာရှင်းလင်းချက်များအတွင်း အင်္ဂလိပ်နည်းပညာဝေါဟာရများကို ထိန်းထားသည့် retrieval လုပ်ငန်းစဉ်။",
            "မူရင်းစာသားဖြင့် အခြေခံပေးထားသော Google Gemini ဖြင့် ဖန်တီးခြင်း။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "Grounding သည် မော်ဒယ်ပြဿနာမတိုင်မီ အကြောင်းအရာပြဿနာဖြစ်သည်။ ဖတ်စာအုပ်များကို မည်သို့ခွဲပြီး index လုပ်သည်က prompt ထက် ပိုအရေးကြီးခဲ့သည်။"
        }
      ],
      note: "ရှေ့ပြေးပုံစံ — ကုဒ်လမ်းညွှန်ကို တောင်းဆိုပါက ရယူနိုင်သည်။"
    },
    travel: {
      kicker: "13 · ဝဘ် · ခရီးသွား",
      title: "Travel & Tour ဝဘ်ဆိုက်",
      tagline: "အကြံပြုခရီးစဉ်များ၊ gallery များနှင့် responsive Bootstrap front end ပါ tour လုပ်ငန်းဆိုက်။",
      meta: [
        ["အခန်းကဏ္ဍ", "Front-end"],
        ["အခြေအနေ", "ပို့ဆောင်ပြီး"],
        ["အသုံးပြုခွင့်", "တိုက်ရိုက်ဆိုက်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "ခရီးစဉ်လုပ်ငန်းရှင်တစ်ဦးသည် ခရီးစဉ်များ ရောင်းချနိုင်သော ဆိုက်တစ်ခု လိုခဲ့သည် — ရှင်းလင်းသော အစီအစဉ်များ၊ ကောင်းမွန်သော ဓာတ်ပုံများနှင့် ဖုန်းပေါ်တွင် အဆင်ပြေသော layout။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "နေ့စဉ်အစီအစဉ်များနှင့် gallery များပါ ခရီးစဉ်စာမျက်နှာများ။",
            "Responsive Bootstrap front end။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "Tour စာမျက်နှာများသည် ဓာတ်ပုံဖြင့် ရောင်းချသည်၊ ထို့ကြောင့် ပုံအလေးချိန်သည် အမှန်တကယ် performance ဘတ်ဂျက် ဖြစ်ခဲ့သည်။"
        }
      ],
      note: "တိုက်ရိုက်ဆိုက် — link ကို ကတ်ပေါ်တွင် ကြည့်ပါ။"
    },
    event: {
      kicker: "14 · ဝဘ် · လုပ်ငန်းစဉ်",
      title: "Event management စနစ်",
      tagline: "ပွဲများ ဖန်တီးရန်နှင့် တက်ရောက်သူများကို ခြေရာခံရန် Laravel နောက်ခံစနစ်။",
      meta: [
        ["အခန်းကဏ္ဍ", "နောက်ခံစနစ် တည်ဆောက်မှု"],
        ["အခြေအနေ", "ပေးအပ်ပြီး"],
        ["အသုံးပြုခွင့်", "သီးသန့်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "ပွဲတစ်ပွဲ လည်ပတ်ရာတွင် တစ်ကြိမ်ဖန်တီးပြီး တက်ရောက်မှုကို လိုက်ကြည့်ရသည်။ နောက်ခံစနစ်က နှစ်ပိုင်းစလုံးကို ပျင်းစရာဖြစ်စေရမည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "ပွဲများ ဖန်တီးရန် Laravel နောက်ခံစနစ်။",
            "ပွဲတစ်ခုစီနှင့် ချိတ်ဆက်ထားသော တက်ရောက်သူ ခြေရာခံမှု။",
            "အထောက်အထားစိစစ်ရန် Laravel Breeze။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "ပွဲကိရိယာများသည် အဝတ်အစားဝတ်ထားသော check-in ကိရိယာများဖြစ်သည်။ အသုံးအဝင်ဆုံး မျက်နှာပြင်မှာ ဝန်ထမ်းများ တံခါးဝတွင် ဖွင့်သည့် မျက်နှာပြင်ဖြစ်သည်။"
        }
      ],
      note: "သီးသန့် နောက်ခံစနစ်။"
    },
    sayar: {
      kicker: "15 · စမ်းသပ်ခန်း · ငွေရေးကြေးရေး",
      title: "Sayar ငွေစာရင်းအကူ",
      tagline: "အိမ်တွင်းစီးပွားရေး အမျိုးသမီးငယ်များအတွက် မြန်မာဘာသာဦးစားပေး စာရင်း — AI က မှတ်တမ်းတစ်ခုစီကို မူကြမ်းရေးပြီး ပိုင်ရှင်က မသိမ်းမီ အတည်ပြုသည်။",
      meta: [
        ["အခန်းကဏ္ဍ", "ထုတ်ကုန် ရှေ့ပြေးပုံစံ"],
        ["အခြေအနေ", "ရှေ့ပြေးပုံစံ"],
        ["အသုံးပြုခွင့်", "အယူအဆ"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "အိမ်တွင်းစီးပွားရေး အမျိုးသမီးငယ်များသည် စာရင်းများကို ခေါင်းထဲ သို့မဟုတ် စာရွက်ပေါ်တွင် ထားသည်။ app သည် မြန်မာဘာသာကို ဦးစားပေးရမည်၊ ပိုင်ရှင် အတည်မပြုဘဲ ငွေကို ဘယ်တော့မှ မရွှေ့ရ။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "ဝင်ငွေ/အသုံးစရိတ်အတွက် မြန်မာဘာသာဦးစားပေး စာရင်း။",
            "ဖော်ပြချက်တိုတစ်ခုမှ မှတ်တမ်းကို မူကြမ်းရေးပေးသည့် AI။",
            "မသိမ်းမီ အတည်ပြုအဆင့် — စာရင်း၏ စာရေးသူအဖြစ် ပိုင်ရှင် ဆက်ရှိနေစေရန်။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "ငွေအတွက် AI က အဆိုပြုရမည်၊ လူသားက အတည်ပြုရမည်။ အတည်ပြုအဆင့်သည် မော်ဒယ်မဟုတ်ဘဲ ထုတ်ကုန်ဖြစ်သည်။"
        }
      ],
      note: "လူမှုအကျိုးပြုအလုပ်အတွက် တည်ဆောက်ထားသော ရှေ့ပြေးပုံစံ။"
    },
    plants: {
      kicker: "16 · စမ်းသပ်ခန်း · IoT",
      title: "PlantsFriend",
      tagline: "ESP32 sensor များက Laravel API သို့ အချက်အလက်ပို့ပြီး React Native app က အပင်၏ တိုင်းတာမှုများကို စောင့်ကြည့်သည်။",
      meta: [
        ["အခန်းကဏ္ဍ", "ဖူးလ်စတက်နှင့် hardware"],
        ["အခြေအနေ", "ရှေ့ပြေးပုံစံ"],
        ["အသုံးပြုခွင့်", "သီးသန့်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "အိမ်အပင်များသည် တိတ်တဆိတ် သေသည်။ အကြံက အရွက်များ မပြောမီ အပင်၏ တိုင်းတာမှုများကို ဖုန်းပေါ်တွင် မြင်ရစေရန် ဖြစ်သည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "တိုင်းတာမှုများကို Laravel API သို့ ပို့သည့် ESP32 sensor များ။",
            "တိုင်းတာမှုများကို ဂရပ်ဆွဲပြသည့် React Native app။",
            "အစမှအဆုံး စမ်းသပ်နိုင်သော hardware-မှ-API လမ်းကြောင်းငယ်။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "Hardware က ကျရှုံးမှုကို မြင်သာစေသည်။ packet ကျသွားလျှင် ဂရပ်တွင် ကွက်လပ်ရှိသည် — UI က ထိုကွက်လပ်ကို ဖျောက်မနေဘဲ ဝန်ခံရမည်။"
        }
      ],
      note: "ကိုယ်ပိုင် ရှေ့ပြေးပုံစံ။"
    },
    distribution: {
      kicker: "17 · စမ်းသပ်ခန်း · ကလောက်",
      title: "Distribution အမှာစာ အလိုအလျောက်စနစ်",
      tagline: "AWS Lambda နှင့် DynamoDB က လက်ကျန်ကို စောင့်ကြည့်သည်၊ Claude က အဝယ်အမိန့် မူကြမ်းရေးပြီး Telegram က အတည်ပြုမှုကို ကိုင်တွယ်သည်။",
      meta: [
        ["အခန်းကဏ္ဍ", "ကလောက်နှင့် AI"],
        ["အခြေအနေ", "ရှေ့ပြေးပုံစံ"],
        ["အသုံးပြုခွင့်", "သီးသန့်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "ပြန်မှာယူရေး ဆုံးဖြတ်ချက်များသည် လူတစ်ဦးနှင့် လက်ကျန်စာရွက်ပေါ်တွင် မူတည်နေသည်။ စမ်းသပ်မှု — serverless နှင့် LLM က အလုပ်ပင်ပန်းမှုကို ဖယ်ရှားနိုင်ပြီး ဆုံးဖြတ်ချက်ကို မဖယ်ရှားနိုင်သလား။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "လက်ကျန်အဆင့်များကို စောင့်ကြည့်သည့် AWS Lambda နှင့် DynamoDB။",
            "လက်ကျန် သတ်မှတ်အဆင့်ကို ကျော်လျှင် Claude က အဝယ်အမိန့် မူကြမ်းရေးသည်။",
            "လူသား အတည်ပြုဆဲရှိရန် အတည်ပြုမျက်နှာပြင်အဖြစ် Telegram။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "အဝယ်အမိန့်ကို အလိုအလျောက်လုပ်ခြင်း လွယ်သည်၊ အတည်ပြုမှုကို ဘေးကင်းစေခြင်းက အလုပ်ဖြစ်သည်။ bot က မူကြမ်းတစ်ခုစီ၏ နောက်က နံပါတ်များကို ပြရမည်။"
        }
      ],
      note: "အတွင်းပိုင်း စမ်းသပ်မှု။"
    },
    hub: {
      kicker: "18 · စမ်းသပ်ခန်း · ကိရိယာ",
      title: "Local dev စတင်ကိရိယာ",
      tagline: "ဒေသတွင်းပရောဂျက်များကို လွတ်နေသော port များတွင် စတင်ပေးပြီး dashboard တစ်ခုမှ ဖွင့်ပေးသည့် Node hub ငယ်။",
      meta: [
        ["အခန်းကဏ္ဍ", "ကိရိယာ တည်ဆောက်မှု"],
        ["အခြေအနေ", "အသုံးပြုနေဆဲ"],
        ["အသုံးပြုခွင့်", "သီးသန့်"]
      ],
      sections: [
        {
          h: "အလုပ်အကျဉ်း",
          p: "ဒေသတွင်းပရောဂျက်များစွာ၊ တူညီသော port များနှင့် terminal tab အမြောက်အမြား။ ဖြေရှင်းချက်သည် platform တစ်ခု မဖြစ်ဖို့ လိုအပ်သည်။"
        },
        {
          h: "တည်ဆောက်ခဲ့သည်များ",
          list: [
            "ပရောဂျက်တစ်ခုစီကို လွတ်နေသော port တွင် စတင်ပေးသည့် Node / Express hub ငယ်။",
            "အားလုံးကို ဖွင့်ရန် dashboard တစ်ခု။"
          ]
        },
        {
          h: "သင်ယူခဲ့သည်များ",
          p: "အကောင်းဆုံး အတွင်းပိုင်းကိရိယာသည် သတိမထားမိတော့သည့် ကိရိယာဖြစ်သည်။ ဒေသတွင်း၊ ငယ်၊ login မလို။"
        }
      ],
      note: "ကိုယ်ပိုင် ကိရိယာ။"
    }
  };

  const dialog = document.getElementById("case-dialog");
  const dialogKicker = document.getElementById("dialog-kicker");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogTagline = document.getElementById("dialog-tagline");
  const dialogMeta = document.getElementById("dialog-meta");
  const dialogSections = document.getElementById("dialog-sections");
  const dialogClose = document.querySelector(".dialog-close");
  let lastCaseTrigger = null;

  function renderMeta(meta) {
    return meta.map(function (row) {
      return "<div><dt>" + row[0] + "</dt><dd>" + row[1] + "</dd></div>";
    }).join("");
  }

  function localizedCase(id) {
    const base = cases[id];
    if (!base) return null;
    return lang() === "my" && casesMy[id] ? Object.assign({}, base, casesMy[id]) : base;
  }

  function renderSections(data) {
    const groups = data.sections.map(function (section) {
      let body = "";
      if (section.p) body += "<p>" + section.p + "</p>";
      if (section.list) {
        body += "<ul>" + section.list.map(function (item) { return "<li>" + item + "</li>"; }).join("") + "</ul>";
      }
      return '<section class="dialog-section"><h3>' + section.h + "</h3>" + body + "</section>";
    }).join("");
    const stack = '<section class="dialog-section"><h3>' + t("dialog.stack", "Stack") + '</h3><div class="dialog-stack">' +
      data.stack.map(function (item) { return "<span>" + item + "</span>"; }).join("") +
      "</div>" + (data.note ? '<p class="dialog-note">' + data.note + "</p>" : "") + "</section>";
    return groups + stack;
  }

  let activeCaseId = null;

  function renderCase(id) {
    const data = localizedCase(id);
    if (!data) return;
    activeCaseId = id;
    if (dialogKicker) dialogKicker.textContent = data.kicker;
    if (dialogTitle) dialogTitle.textContent = data.title;
    if (dialogTagline) dialogTagline.textContent = data.tagline;
    if (dialogMeta) dialogMeta.innerHTML = renderMeta(data.meta);
    if (dialogSections) dialogSections.innerHTML = renderSections(data);
  }

  function openCase(id, trigger) {
    if (!cases[id] || !dialog) return;
    lastCaseTrigger = trigger || null;
    renderCase(id);
    const body = dialog.querySelector(".dialog-body");
    if (body) body.scrollTop = 0;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("modal-open");
    if (dialogClose) window.setTimeout(function () { dialogClose.focus(); }, 60);
  }

  function closeCase() {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("modal-open");
    if (lastCaseTrigger) lastCaseTrigger.focus();
  }

  document.querySelectorAll("[data-open-case]").forEach(function (button) {
    button.addEventListener("click", function () {
      openCase(button.getAttribute("data-open-case"), button);
    });
  });

  if (dialog) {
    if (dialogClose) dialogClose.addEventListener("click", closeCase);
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) closeCase();
    });
    dialog.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
    });
    dialog.addEventListener("cancel", function () {
      document.body.classList.remove("modal-open");
    });
  }

  /* ---------- Language ---------- */
  if (menuToggle) setMenu(document.body.classList.contains("nav-open"));

  document.addEventListener("portfolio:langchange", function () {
    if (themeToggle) setTheme(root.getAttribute("data-theme") || "dark");
    if (menuToggle) setMenu(document.body.classList.contains("nav-open"));
    if (dialog && dialog.open && activeCaseId) renderCase(activeCaseId);
  });
})();
