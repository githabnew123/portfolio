/* =========================================================
   Bilingual layer: English (source) <-> Burmese (dictionary)
   English markup stays in index.html; Burmese lives here.
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "lang";

  var dict = {
    /* ---------- Chrome and shared ---------- */
    "skip": "အကြောင်းအရာသို့ ကျော်သွားရန်",
    "aria.brand": "Pyae Phyo Aung — ပင်မစာမျက်နှာ",
    "aria.nav": "ပင်မ",
    "aria.profile": "ကိုယ်ရေးအကျဉ်း",
    "aria.marquee": "နည်းပညာများ",
    "aria.tags": "အသုံးပြုထားသော နည်းပညာများ",
    "aria.filter": "ပရောဂျက်များ စစ်ထုတ်ရန်",
    "aria.closeCase": "ဖြစ်ရပ်လေ့လာချက် ပိတ်ရန်",
    "aria.copyEmail": "အီးမေးလ်လိပ်စာကို clipboard သို့ ကူးယူရန်",
    "aria.themeLight": "အလင်းအရောင် ပြောင်းရန်",
    "aria.themeDark": "အမှောင်အရောင် ပြောင်းရန်",
    "aria.menuOpen": "မီနူး ဖွင့်ရန်",
    "aria.menuClose": "မီနူး ပိတ်ရန်",

    /* ---------- Navigation ---------- */
    "nav.work": "လက်ရာများ",
    "nav.more": "နောက်ထပ်",
    "nav.about": "အကြောင်း",
    "nav.stack": "ကိရိယာများ",
    "nav.cta": "စကားပြောရအောင်",

    /* ---------- Hero ---------- */
    "hero.eyebrow": "ဆော့ဖ်ဝဲအင်ဂျင်နီယာ · မန္တလေး၊ မြန်မာ",
    "hero.title": "တိတ်ဆိတ်စွာ <em>ရည်မှန်းချက်ကြီးသော</em> ဆော့ဖ်ဝဲများကို တည်ဆောက်နေသော ဖူးလ်စတက် အင်ဂျင်နီယာ။",
    "hero.lede": "<strong>Laravel</strong>၊ <strong>Flutter</strong>၊ <strong>React</strong> နှင့် <strong>AWS</strong> တို့ဖြင့် လုပ်ကိုင်ပြီး ရှုပ်ထွေးသော လက်တွေ့လုပ်ငန်းစဉ်များကို ယုံကြည်စိတ်ချရသော ထုတ်ကုန်များအဖြစ် ပြောင်းလဲပေးပါသည်။ လက်ရှိ <strong>GIC</strong> တွင် မြန်မာနှင့် ဂျပန်အတွက် ထုတ်ကုန်များ တည်ဆောက်နေပါသည်။",
    "hero.viewWork": "ရွေးချယ်ထားသော လက်ရာများ ကြည့်ရန်",
    "hero.about": "ကျွန်ုပ်အကြောင်း ပိုမိုဖတ်ရန်",
    "hero.footnote": "လက်ရှိတည်ဆောက်နေသည် — ကိုးကားချက်ပါ ဥပဒေရေးရာ AI · အလှူရှင်ကွန်ရက် · တာမီနယ်သယ်ယူပို့ဆောင်ရေး",
    "hero.status": "တည်ဆောက်နေဆဲ",
    "hero.core": "အင်ဂျင်နီယာ",
    "hero.basedIn": "နေထိုင်ရာ",
    "hero.basedValue": "မန္တလေး၊ မြန်မာ",
    "hero.workingAt": "လုပ်ကိုင်ရာ",
    "hero.localTime": "ဒေသစံတော်ချိန်",
    "hero.scroll": "ဆက်လက်ကြည့်ရန် ဆွဲချပါ",

    /* ---------- Work ---------- */
    "work.label": "<span>01</span> ရွေးချယ်ထားသော လက်ရာများ",
    "work.title": "ထုတ်ကုန်များ၊ ပလက်ဖောင်းများနှင့် <em>ခက်ခဲသော လုပ်ငန်းစဉ်ပြဿနာများ။</em>",
    "work.lede": "မကြာသေးမီက တည်ဆောက်ခဲ့သည့် လေးခု။ လုပ်ငန်းကိစ္စ သီးသန့်ဖြစ်သည့်နေရာတွင် ဖောက်သည်အမည်၊ ဘရန်နှင့် ဓာတ်ပုံများကို ချန်လှပ်ထားသည် — အင်ဂျင်နီယာလုပ်ငန်းစဉ်နှင့် ပြဿနာကိုမူ ဖော်ပြထားသည်။",
    "case.read": "ဖြစ်ရပ်လေ့လာချက် ဖတ်ရန်",
    "case.visualPreview": "<span>01</span> မျက်နှာပြင် နမူနာ",
    "case.blood.visual": "<span>02</span> မျက်နှာပြင် လေ့လာမှု",
    "case.terminal.visual": "<span>03</span> မျက်နှာပြင် လေ့လာမှု",
    "case.licence.visual": "<span>04</span> မျက်နှာပြင် လေ့လာမှု",

    "case.law.chip": "ပုဒ်မ 26 · ကိုးကားပြီး",
    "case.law.kicker": "<span>01</span> AI · ဥပဒေနည်းပညာ <span>2026</span>",
    "case.law.title": "မြန်မာဥပဒေ လမ်းညွှန်",
    "case.law.tagline": "ကိုးကားချက်များဖြင့် ဖြေကြားပြီး ခန့်မှန်းချက်များဖြင့် မဖြေကြားသော နှစ်ဘာသာ ဥပဒေရေးရာ အကူအညီပေးစနစ်။",
    "case.law.problem": "မြန်မာဥပဒေများသည် စကင်ဖတ်ထားသော PDF များ၊ ဆယ်စုနှစ်ချီ ပြင်ဆင်ချက်များနှင့် မြန်မာ/အင်္ဂလိပ် ရောနှောစာသားများအကြား ကွဲလွင့်နေသည်။ ယေဘုယျ chatbot တစ်ခုက ပုဒ်မနံပါတ်ကို ယုံကြည်မှုအပြည့်ဖြင့် လုပ်ကြံဖြေဆိုနိုင်သည် — ၎င်းသည် အဖြေမရှိခြင်းထက် ပိုဆိုးသည်။",
    "case.law.h1": "OCR လုပ်ငန်းစဉ်က စကင်ဖတ်ထားသော ဥပဒေစာအုပ်များကို Tesseract <span class=\"mono\">mya+eng</span> ဖြင့် ရှာဖွေနိုင်သော စာသားအဖြစ် ပြောင်းပေးသည်။",
    "case.law.h2": "ပုဒ်မကို သိရှိသော ထည့်သွင်းမှုစနစ်က ဥပဒေအပိုင်းအစများကို PostgreSQL + <span class=\"mono\">pgvector</span> ထဲ ထည့်သွင်းသည်။",
    "case.law.h3": "ကိုးကားချက်ကို ဦးစားပေးသော RAG က ယုံကြည်မှုနည်းသော ကိုက်ညီမှုများကို ငြင်းပယ်ပြီး မူရင်းပုဒ်မကို အမြဲပြသည်။",

    "case.blood.chip": "ကိုယ်ရေးဦးစားပေး ဆက်သွယ်မှု",
    "case.blood.kicker": "<span>02</span> ကျန်းမာရေးနည်းပညာ · PWA <span>2026</span>",
    "case.blood.title": "BloodLink မြန်မာ",
    "case.blood.tagline": "Facebook ပေါ်တွင် သွေးကို ညှိနှိုင်းနေရသော နိုင်ငံအတွက် ကိုယ်ရေးကိုယ်တာကို ဦးစားပေးသည့် အလှူရှင်ကွန်ရက်။",
    "case.blood.problem": "အရေးပေါ် တောင်းဆိုမှုများသည် လူမှုကွန်ရက်အဖွဲ့များတွင် ပျံ့နှံ့သည်။ အလှူရှင်ဖုန်းနံပါတ်များကို လူသိရှင်ကြား တင်ထားပြီး လှူနိုင်မှုအခြေအနေကို မသိရသဖြင့် လက်ခံသူများသည် မလှူနိုင်သူများကို နာရီပေါင်းများစွာ ဖုန်းဆက်ရသည်။",
    "case.blood.h1": "သွေးအုပ်စု၊ မြို့နယ်နှင့် လက်ရှိရနိုင်မှုအလိုက် ကိုက်ညီမှုကို သိရှိသော ရှာဖွေမှု။",
    "case.blood.h2": "ဆက်သွယ်ရန်တောင်းဆိုမှုများတွင် အလှူရှင် လက်ခံသည်အထိ ဖုန်းနံပါတ်များကို ဖုံးကွယ်ထားသည်။",
    "case.blood.h3": "90/120 ရက် လှူနိုင်မှုစစ်ဆေးသည့်စနစ်၊ အပတ်စဉ် အချိန်ကွက်များနှင့် နေ့စဉ် အခြေအနေစစ်ဆေးမှုများ။",

    "case.terminal.chip": "ခရီးစဉ် · တက္ကစီ · ပါဆယ်",
    "case.terminal.kicker": "<span>03</span> ထောက်ပံ့ပို့ဆောင်ရေး · လုပ်ငန်းစဉ် <span>2026</span>",
    "case.terminal.title": "မန္တလေး တာမီနယ်နှင့် ပို့ဆောင်ရေး",
    "case.terminal.tagline": "ဘတ်စ်ကားများ၊ တက္ကစီများနှင့် ပါဆယ်များအတွက် ထိန်းချုပ်ခန်း တစ်ခုတည်း။",
    "case.terminal.problem": "အလုပ်များသော တာမီနယ်တစ်ခုကို spreadsheet များ၊ ဖုန်းခေါ်ဆိုမှုများနှင့် စက္ကူမှတ်စုများဖြင့် လည်ပတ်ခဲ့သည်။ ခရီးစဉ်များ၊ ဂိတ်များ၊ တက္ကစီ လာယူမှုများ၊ ပါဆယ်ပို့ဆောင်မှုများနှင့် ယာဉ်မောင်းလုပ်ခများသည် လူတစ်ဦးစီ၏ ခေါင်းထဲတွင် ကွဲနေခဲ့သည်။",
    "case.terminal.h1": "တာမီနယ်များ၊ ဂိတ်များ၊ ခရီးစဉ်အစီအစဉ်များနှင့် Excel အစုလိုက် ထည့်သွင်းမှုအတွက် စီမံခန့်ခွဲရေးစနစ်။",
    "case.terminal.h2": "တက္ကစီ ခွဲဝေမှုနှင့် ပါဆယ်ပို့ဆောင်မှု လုပ်ငန်းစဉ်များကို တောင်းဆိုမှုမှ အခြေအနေမှတ်တမ်းအထိ။",
    "case.terminal.h3": "မြေပုံများ၊ အသိပေးချက်များနှင့် တိုက်ရိုက်တည်နေရာ ပေးပို့မှုပါသော Flutter ယာဉ်မောင်း app။",

    "case.licence.chip": "အခန်းကဏ္ဍအလိုက် · စာရင်းစစ်ပြီး",
    "case.licence.kicker": "<span>04</span> လုပ်ငန်းကြီး <span>2026</span>",
    "case.licence.title": "လိုင်စင်ဝန်ဆောင်မှု ပလက်ဖောင်း",
    "case.licence.tagline": "လိုင်စင်ဝန်ဆောင်မှုလုပ်ငန်းအတွက် ရုံးခန်းနောက်ခံစနစ် — လျှောက်လွှာလက်ခံမှုမှ လုပ်ခငွေအထိ။",
    "case.licence.problem": "ခွဲခွဲထားသော လိုင်စင်ဝန်ဆောင်မှုများတွင် ကိုယ်စားလှယ်များ၊ ချိန်းဆိုမှုများ၊ ယာဉ်စစ်ဆေးမှုများ၊ အဆင့်လိုက် လျှောက်လွှာများ၊ ကော်မရှင်များ၊ ငွေကြိုထုတ်မှုများနှင့် လုပ်ခငွေများ ပါဝင်သည်။ Spreadsheet များက ခွင့်ပြုချက်များကို မထိန်းချုပ်နိုင်သလို အမှုတစ်ခု ဘယ်အဆင့်ရောက်နေသည်ကိုလည်း မပြနိုင်ခဲ့ပါ။",
    "case.licence.h1": "ပိုင်ရှင် / ခေါင်းဆောင် / ဒုခေါင်းဆောင် / အဖွဲ့ဝင် အဆင့်ဆင့်နှင့် အသေးစိတ် ခွင့်ပြုချက်ဇယား။",
    "case.licence.h2": "လုပ်ဆောင်မှုမှတ်တမ်းများ၊ မှတ်ချက်များနှင့် စာရင်းစစ်မှတ်တမ်းများပါသော အဆင့်လိုက် လျှောက်လွှာလုပ်ငန်းစဉ်။",
    "case.licence.h3": "ဘဏ္ဍာရေး၊ လုပ်ခငွေ၊ အသုံးစရိတ်များနှင့် ပိုင်ရှင်သာ ရယူနိုင်သော လက်မှတ်ရေးထိုးထားသည့် backup များကို စနစ်တစ်ခုတည်းတွင်။",

    /* ---------- More ---------- */
    "more.label": "<span>02</span> နောက်ထပ်လက်ရာများ",
    "more.title": "ကျွန်ုပ် <em>ထုတ်လုပ်ခဲ့ပြီး သင်ခန်းစာယူခဲ့ရသည့်</em> အခြားအရာများ။",
    "more.all": "အားလုံး",
    "more.product": "ထုတ်ကုန်",
    "more.client": "ဖောက်သည်",
    "more.lab": "စမ်းသပ်ခန်း",
    "mini.private": "သီးသန့်",
    "mini.github": "GitHub တွင် ကြည့်ရန်",

    "mini.micine.kicker": "အာမခံ · ဂျပန်",
    "mini.micine.title": "Micine / Minum ပလက်ဖောင်း",
    "mini.micine.desc": "ဂျပန်အာမခံထုတ်ကုန်တစ်ခုအတွက် လျှောက်လွှာ၊ ဖောက်သည်ပေါ်တယ်နှင့် ပေါ်လစီစီမံခန့်ခွဲမှု။",
    "mini.car.kicker": "မော်ဘီလီတီ · စျေးကွက်",
    "mini.car.title": "ကားအငှား ပလက်ဖောင်း",
    "mini.car.desc": "Expo ဖောက်သည် app နှင့် Laravel/Inertia စီမံခန့်ခွဲရေးစနစ် — ကြော်ငြာများ၊ ကြိုတင်မှာယူမှုများ၊ ယာဉ်မောင်းများနှင့် chat။",
    "mini.chem.kicker": "ပညာရေး · မြန်မာ",
    "mini.chem.title": "ChemTeacher",
    "mini.chem.desc": "မြန်မာကျောင်းသားများအတွက် G10–G12 ဓာတုဗေဒ လေ့လာရေး app — ဈေးနှုန်း၊ မိတ်ဆက်မှုနှင့် ပြန်လည်ရောင်းချသူများ အပါအဝင်။",
    "mini.aws.kicker": "ကလောက် · သင်ယူရေး",
    "mini.aws.title": "AWS အခြေခံ စမ်းသပ်ခန်း",
    "mini.aws.desc": "EC2၊ IAM၊ SSM နှင့် S3 remote state — မြန်မာနှင့် အင်္ဂလိပ်ဘာသာဖြင့် အစပြုသူလမ်းညွှန်လည်း ပါဝင်သည်။",
    "mini.petro.kicker": "လက်လီ · လုပ်ငန်းစဉ်",
    "mini.petro.title": "Petro လောင်စာဆီဆိုင်",
    "mini.petro.desc": "အဝယ်၊ အရောင်း၊ လက်ကျန်များ၊ ပေးသွင်းသူများ၊ ငွေပေးချေမှုများနှင့် ဘဏ္ဍာရေးမှတ်တမ်းများ။",
    "mini.bot.kicker": "အလိုအလျောက်စနစ် · Telegram",
    "mini.bot.title": "ပို့ဆောင်ရေး bot",
    "mini.bot.desc": "ပို့ဆောင်ရေးတောင်းဆိုမှုများကို chat ထဲမှ ခွဲထုတ်ပြီး ခြေရာခံနိုင်သော လုပ်ငန်းစဉ်အဖြစ် ပြောင်းပေးသော bot။",
    "more.archive": "မှတ်တမ်းထဲတွင် ထပ်မံပါဝင်သည် — event management၊ CRM၊ loyalty နှင့် ရပ်ရွာသတင်း ပလက်ဖောင်းများ။ အချို့ဖောက်သည်လုပ်ငန်းများသည် NDA အောက်တွင်ရှိပြီး အင်ဂျင်နီယာလုပ်ငန်းစဉ်ကို သီးသန့် ဆွေးနွေးနိုင်ပါသည်။",

    /* ---------- About ---------- */
    "about.label": "<span>03</span> ကျွန်ုပ်အကြောင်း",
    "about.title": "<em>လက်တွေ့လုပ်ငန်းစဉ်များ</em> schema နှင့် ဆုံတွေ့သည့်အပိုင်းကို နှစ်သက်သည်။",
    "about.signature": "ဆော့ဖ်ဝဲအင်ဂျင်နီယာ · မန္တလေး",
    "about.now": "လက်ရှိ",
    "about.nowBuilding": "တည်ဆောက်နေ",
    "about.nowLearning": "သင်ယူနေ",
    "about.nowWriting": "ရေးသားနေ",
    "about.nowBuildingText": "ကိုးကားချက်ပါ ဥပဒေရေးရာ AI၊ BloodLink နှင့် တာမီနယ်လုပ်ငန်းစဉ်များ။",
    "about.nowLearningText": "AWS၊ Terraform module များနှင့် OIDC အခြေခံ CI/CD။",
    "about.nowWritingText": "မြန်မာနှင့် အင်္ဂလိပ်ဘာသာဖြင့် အစပြုသူအတွက် AWS လမ်းညွှန်။",
    "about.p1": "ကျွန်ုပ်သည် <strong>Global Innovation Consulting (GIC)</strong> တွင် ဆော့ဖ်ဝဲအင်ဂျင်နီယာအဖြစ် လုပ်ကိုင်ပြီး ဥပဒေနည်းပညာ၊ ကျန်းမာရေး၊ ထောက်ပံ့ပို့ဆောင်ရေး၊ ပညာရေးနှင့် အာမခံနယ်ပယ်များတွင် မြန်မာနှင့် ဂျပန်အတွက် ထုတ်ကုန်များ တည်ဆောက်သည်။",
    "about.p2": "ကျွန်ုပ် အကြိုက်ဆုံးအလုပ်မှာ ဆော့ဖ်ဝဲက ရှုပ်ထွေးသော လက်တွေ့လုပ်ငန်းစဉ်များနှင့် ဆုံတွေ့သည့်နေရာဖြစ်သည် — ခရီးစဉ်များကို ညှိနှိုင်းပေးနေသော dispatcher၊ ကိုက်ညီသော အလှူရှင်ကို ရှာတွေ့နေသော အလှူရှင်၊ ရှင်းလင်းသောအဖြေ ရနေသော ကျောင်းသား၊ လိုင်စင်အမှုတစ်ခုကို ပိတ်နေသော ဌာနခွဲအဖွဲ့။ သာမန်မထင်ရှားသည့် အစိတ်အပိုင်းများကို ဂရုစိုက်သည် — ခွင့်ပြုချက်များ၊ စာရင်းစစ်မှတ်တမ်းများ၊ ဒေတာကိုယ်ရေးကိုယ်တာ၊ မအောင်မြင်သည့်အခြေအနေများနှင့် နောက်တစ်ဆင့် ဘာလုပ်ရမည်ကို ပြောပြသည့် စာသားများ။",
    "about.p3": "ကျွန်ုပ် PHP နှင့် Laravel ဖြင့် စတင်ခဲ့သည်။ ယနေ့ Laravel API များ၊ Flutter နှင့် React client များနှင့် AWS အခြေခံအဆောက်အအုံများအကြား လုပ်ကိုင်နေသည်။ လက်ရှိ Terraform၊ IAM နှင့် SSM တို့ဖြင့် DevOps ကို ပိုမိုနက်ရှိုင်းစွာ လေ့လာနေပြီး သင်ယူရင်းနှင့်အမျှ မြန်မာနှင့် အင်္ဂလိပ်ဘာသာဖြင့် အစပြုသူအတွက် AWS လမ်းညွှန်ကို ရေးသားနေသည်။",
    "about.tr1.when": "လက်ရှိ",
    "about.tr1.title": "GIC တွင် ထုတ်ကုန်အင်ဂျင်နီယာ",
    "about.tr1.desc": "AI ဥပဒေလမ်းညွှန်၊ BloodLink၊ တာမီနယ်ထောက်ပံ့ပို့ဆောင်ရေးနှင့် လိုင်စင်ဝန်ဆောင်မှုပလက်ဖောင်း — schema နှင့် API မှ empty state နှင့် deploy အထိ။",
    "about.tr2.when": "ယခင်က",
    "about.tr2.title": "လုပ်ငန်းကြီးနှင့် ဖောက်သည်ပလက်ဖောင်းများ",
    "about.tr2.desc": "ဂျပန်အာမခံစနစ်များ၊ ကားအငှားစျေးကွက်နှင့် ChemTeacher ၏ သင်ယူရေးနှင့် ပြန်လည်ရောင်းချသူ ကိရိယာများ။",
    "about.tr3.when": "နောက်လာမည်",
    "about.tr3.title": "ပလက်ဖောင်းအင်ဂျင်နီယာ",
    "about.tr3.desc": "ပိုမိုနက်ရှိုင်းသော AWS၊ Terraform module များ၊ OIDC အခြေခံ CI/CD နှင့် စနစ်များကို လည်ပတ်ရလွယ်ကူစေသည့် အလေ့အထများ။",
    "about.pr1.title": "ရှင်းလင်းမှုက ပါးနပ်မှုကို အနိုင်ယူသည်။",
    "about.pr1.desc": "လူများ နားလည်နိုင်၊ ထိန်းသိမ်းနိုင်၊ လွှဲပြောင်းနိုင်သည့် ဗားရှင်းကို ထုတ်လုပ်ပါ။ ပါးနပ်သောဗားရှင်းက စောင့်နိုင်ပါသည်။",
    "about.pr2.title": "ကိုယ်ရေးကိုယ်တာသည် အင်္ဂါရပ်တစ်ခုဖြစ်သည်။",
    "about.pr2.desc": "ဖုန်းနံပါတ်များကို ဖုံးကွယ်ပါ၊ ဒေတာကို အနည်းဆုံးထားပါ၊ ထုတ်ဖော်မီ မေးပါ၊ ဖျက်ပစ်မှုကို အမှန်တကယ်ဖြစ်စေပါ — checkbox တစ်ခုမဟုတ်ဘဲ။",
    "about.pr3.title": "လမ်းကြောင်းတစ်ခုလုံးကို ပိုင်ဆိုင်ပါ။",
    "about.pr3.desc": "ဒေတာဘေ့စ်ကန့်သတ်ချက်မှ ခလုတ်စာသား၊ ၎င်းကို ရှင်သန်စေသည့် deploy အထိ။ လွှဲပြောင်းမှုများသည် ယုံကြည်မှု ယိုစိမ့်သည့်နေရာဖြစ်သည်။",
    "about.pr4.title": "လူသိရှင်ကြား သင်ယူပါ။",
    "about.pr4.desc": "စမ်းသပ်ခန်းကို မှတ်တမ်းတင်ပါ၊ လမ်းညွှန်ကို မျှဝေပါ၊ မှတ်စုများ ထားပါ။ သင်ကြားခြင်းဖြင့် ကိုယ့်နားလည်မှု၏ အပေါက်များကို ရှာတွေ့သည်။",

    /* ---------- Toolbox ---------- */
    "stack.label": "<span>04</span> ကိရိယာများ",
    "stack.title": "ကျွန်ုပ် အသုံးပြုသည့် ကိရိယာများနှင့် <em>အကြောင်းရင်း။</em>",
    "stack.note": "Laravel နှင့် Flutter တွင် နက်ရှိုင်းစွာ လုပ်ကိုင်သည်။ stack တစ်ခုလုံးတွင် အဆင်ပြေသည်။ cloud အခြေခံအဆောက်အအုံကို တမင်တကာ ပိုမိုနက်ရှိုင်းစွာ လေ့လာနေသည်။",
    "stack.backend.title": "ဘက်ခ်အင်",
    "stack.backend.desc": "လက်တွေ့လုပ်ငန်းစဉ်များအောက် ခံနိုင်ရည်ရှိသော API များနှင့် ဒေတာမော်ဒယ်များ။",
    "stack.frontend.title": "ဖရန့်အင်",
    "stack.frontend.desc": "ဒေတာများ ရှုပ်ထွေးလာချိန်တွင်လည်း မြန်ဆန်ပြီး ဖတ်ရှုလွယ်နေသော မျက်နှာပြင်များ။",
    "stack.mobile.title": "မိုဘိုင်း",
    "stack.mobile.desc": "ကုဒ်ဘေ့စ်တစ်ခုတည်း၊ native ခံစားမှုရှိသော လုပ်ငန်းစဉ်များ၊ offline ကို ထည့်သွင်းစဉ်းစားမှု။",
    "stack.cloud.title": "ကလောက်နှင့် DevOps",
    "stack.cloud.desc": "ရှင်းပြနိုင်၊ ပြန်လည်တည်ဆောက်နိုင်၊ လွှဲပြောင်းနိုင်သော အခြေခံအဆောက်အအုံ။",
    "stack.ai.title": "AI နှင့် ဒေတာ",
    "stack.ai.desc": "ကိုးကားချက်များ ပြသည့် သို့မဟုတ် မသိကြောင်း ဝန်ခံသည့် retrieval။",
    "stack.craft.title": "ထုတ်ကုန်ကျွမ်းကျင်မှု",
    "stack.craft.desc": "ဆော့ဖ်ဝဲကို ယုံကြည်စိတ်ချရသလို ခံစားရစေသည့် အသေးစိတ်များ။",

    /* ---------- Contact and footer ---------- */
    "contact.label": "<span>05</span> ဆက်သွယ်ရန်",
    "contact.title": "တည်ဆောက်ထိုက်သော <em>ပြဿနာတစ်ခု</em> ရှိနေသလား။",
    "contact.lede": "ထုတ်ကုန်အင်ဂျင်နီယာ၊ ပလက်ဖောင်းလုပ်ငန်း သို့မဟုတ် ခက်ခဲသော လုပ်ငန်းစဉ်ပြဿနာများအကြောင်း ဆွေးနွေးလိုပါက ကြိုဆိုပါသည်။ အမြန်ဆုံး ဆက်သွယ်နည်းမှာ အီးမေးလ်ဖြစ်သည်။",
    "contact.start": "စကားစတင်ရန်",
    "contact.copy": "အီးမေးလ် ကူးယူရန်",
    "contact.where": "မန္တလေး၊ မြန်မာ",
    "contact.local": "မြန်မာစံတော်ချိန်",
    "contact.reply": "တစ်ရက် သို့မဟုတ် နှစ်ရက်အတွင်း ပြန်ကြားပါသည်",
    "footer.built": "HTML၊ CSS နှင့် JavaScript ဖြင့် အစမှ တည်ဆောက်ထားသည်။",
    "footer.top": "အပေါ်သို့ ပြန်သွားရန်",

    /* ---------- Dynamic ---------- */
    "toast.copied": "အီးမေးလ် ကူးယူပြီးပါပြီ — {email}",
    "toast.copyFailed": "ကူးယူ၍ မရပါ — {email}",
    "toast.shown": "{n} ပရောဂျက် ပြသထားသည်",
    "dialog.stack": "နည်းပညာများ"
  };

  var meta = {
    en: {
      title: "Pyae Phyo Aung — Software Engineer",
      description: "Software engineer in Mandalay, Myanmar. I build full-stack products with Laravel, Flutter, React and AWS — from legal-tech AI and health platforms to logistics and enterprise operations."
    },
    my: {
      title: "Pyae Phyo Aung — ဆော့ဖ်ဝဲအင်ဂျင်နီယာ",
      description: "မန္တလေးအခြေစိုက် ဆော့ဖ်ဝဲအင်ဂျင်နီယာ။ Laravel၊ Flutter၊ React နှင့် AWS ဖြင့် ဥပဒေနည်းပညာ AI၊ ကျန်းမာရေး၊ ထောက်ပံ့ပို့ဆောင်ရေးနှင့် လုပ်ငန်းသုံးစနစ်များကို တည်ဆောက်သည်။"
    }
  };

  var textNodes = Array.prototype.map.call(
    document.querySelectorAll("[data-i18n]"),
    function (el) {
      return { el: el, key: el.getAttribute("data-i18n"), en: el.innerHTML };
    }
  );

  var ariaNodes = Array.prototype.map.call(
    document.querySelectorAll("[data-i18n-aria-label]"),
    function (el) {
      return { el: el, key: el.getAttribute("data-i18n-aria-label"), en: el.getAttribute("aria-label") || "" };
    }
  );

  var toggle = document.querySelector(".lang-toggle");
  var descriptionMeta = document.querySelector('meta[name="description"]');
  var current = "en";

  function t(key) {
    return dict[key] || "";
  }

  function apply(lang, options) {
    var opts = options || {};
    current = lang === "my" ? "my" : "en";

    root.setAttribute("lang", current);

    textNodes.forEach(function (node) {
      if (current === "my" && dict[node.key] != null) node.el.innerHTML = dict[node.key];
      else node.el.innerHTML = node.en;
    });

    ariaNodes.forEach(function (node) {
      var value = current === "my" && dict[node.key] != null ? dict[node.key] : node.en;
      node.el.setAttribute("aria-label", value);
    });

    var copyButton = document.querySelector(".copy-email");
    if (copyButton) {
      copyButton.setAttribute(
        "aria-label",
        current === "my" ? t("aria.copyEmail") : "Copy email address to clipboard"
      );
    }

    document.title = meta[current].title;
    if (descriptionMeta) descriptionMeta.setAttribute("content", meta[current].description);

    if (toggle) {
      toggle.setAttribute("aria-pressed", String(current === "my"));
      toggle.setAttribute(
        "aria-label",
        current === "my" ? "အင်္ဂလိပ်ဘာသာသို့ ပြောင်းရန်" : "Switch to Burmese"
      );
    }

    if (opts.persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, current); } catch (e) {}
    }

    try {
      window.dispatchEvent(new CustomEvent("portfolio:langchange", { detail: { lang: current } }));
    } catch (e) {}
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      apply(current === "my" ? "en" : "my");
    });
  }

  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  apply(saved === "my" ? "my" : "en", { persist: false });

  window.PortfolioI18n = {
    get lang() { return current; },
    t: t,
    apply: apply
  };
})();
