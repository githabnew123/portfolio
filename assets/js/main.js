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
        ["Access", "Client delivery"]
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
      note: "Client delivery — organisation name and operational screenshots are withheld."
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
        ["အသုံးပြုခွင့်", "ဖောက်သည်အတွက် ပေးအပ်ပြီး"]
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
      note: "ဖောက်သည်အတွက် ပေးအပ်မှု — အဖွဲ့အစည်းအမည်နှင့် လုပ်ငန်းလည်ပတ်မှု screenshot များကို ချန်လှပ်ထားသည်။"
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
