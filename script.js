
const $ = (selector) => document.querySelector(selector);

const elements = {
  sidebar: $("#sidebar"),
  messages: $("#messages"),
  welcome: $("#welcome"),
  history: $("#historyList"),
  input: $("#messageInput"),
  send: $("#sendButton"),
  toast: $("#toast"),
  modelMenu: $("#modelMenu"),
  modelName: $("#modelName"),
  settings: $("#settingsModal")
};

const translations = {
  en: {
    newChat: "New chat", recent: "RECENT",
    noChats: "Your conversations will appear here.",
    language: "Language", settings: "Settings",
    personalWorkspace: "Personal workspace", demoMode: "Demo mode",
    eyebrow: "YOUR INTELLIGENT WORKSPACE",
    headline: "Ideas start here.<br><span>Possibilities go further.</span>",
    subheadline: "Ask questions, explore ideas, and get help with your next big thing.",
    ideaTitle: "Explore an idea", ideaDesc: "Brainstorm something new",
    learnTitle: "Learn something", learnDesc: "Make complex topics simple",
    planTitle: "Plan a project", planDesc: "Turn thoughts into a plan",
    writeTitle: "Create something", writeDesc: "Get help with your writing",
    messagePlaceholder: "Message NEXA AI...", attach: "Attach",
    disclaimer: "NEXA AI v1 is a frontend demo. Replies are examples, not live AI responses.",
    languageDesc: "Choose your interface language.",
    clearHistory: "Clear conversation history",
    clearDesc: "Remove saved chats from this browser.",
    clearButton: "Clear",
    settingsNote: "Your demo conversations are stored locally in this browser. No account is required.",
    user: "You", assistant: "NEXA AI",
    demoReply: "This is a sample response from the NEXA AI v1 demo.\n\nI can show how the chat interface works, but I am not connected to a real AI model yet. In a future version, this message area will display responses from a securely connected AI service.\n\nFor now, you can test the interface by sending more messages or switching languages.",
    cleared: "Conversation history cleared.",
    empty: "Write a message first.",
    attachSoon: "File attachments are planned for a future version.",
    languageChanged: "Language changed."
  },
  ar: {
    newChat: "محادثة جديدة", recent: "الأخيرة",
    noChats: "ستظهر محادثاتك هنا.",
    language: "اللغة", settings: "الإعدادات",
    personalWorkspace: "مساحة العمل الشخصية", demoMode: "وضع تجريبي",
    eyebrow: "مساحة عملك الذكية",
    headline: "الأفكار تبدأ هنا.<br><span>والاحتمالات تتجاوز الحدود.</span>",
    subheadline: "اطرح الأسئلة، واكتشف الأفكار، واحصل على المساعدة في مشروعك القادم.",
    ideaTitle: "اكتشف فكرة", ideaDesc: "ابتكر شيئاً جديداً",
    learnTitle: "تعلّم شيئاً", learnDesc: "بسّط المواضيع المعقدة",
    planTitle: "خطط لمشروع", planDesc: "حوّل أفكارك إلى خطة",
    writeTitle: "أنشئ شيئاً", writeDesc: "احصل على مساعدة في الكتابة",
    messagePlaceholder: "اكتب إلى NEXA AI...", attach: "إرفاق",
    disclaimer: "NEXA AI الإصدار الأول هو نموذج واجهة. الردود تجريبية وليست ردود ذكاء اصطناعي حقيقية.",
    languageDesc: "اختر لغة الواجهة.",
    clearHistory: "مسح سجل المحادثات",
    clearDesc: "احذف المحادثات المحفوظة من هذا المتصفح.",
    clearButton: "مسح",
    settingsNote: "يتم حفظ المحادثات التجريبية محلياً في هذا المتصفح. لا تحتاج إلى حساب.",
    user: "أنت", assistant: "NEXA AI",
    demoReply: "هذا رد تجريبي من واجهة NEXA AI الإصدار الأول.\n\nيمكنني عرض طريقة عمل واجهة المحادثة، لكنني لست متصلاً بنموذج ذكاء اصطناعي حقيقي حتى الآن. في إصدار مستقبلي، ستعرض هذه المنطقة ردوداً من خدمة ذكاء اصطناعي متصلة بشكل آمن.\n\nيمكنك الآن تجربة الواجهة بإرسال المزيد من الرسائل أو تغيير اللغة.",
    cleared: "تم مسح سجل المحادثات.",
    empty: "اكتب رسالة أولاً.",
    attachSoon: "ميزة إرفاق الملفات مخططة لإصدار مستقبلي.",
    languageChanged: "تم تغيير اللغة."
  }
};

let language = localStorage.getItem("nexa-language") || "en";
let chats = loadChats();
let activeChatId = null;
let toastTimer;

function loadChats() {
  try {
    const saved = JSON.parse(localStorage.getItem("nexa-chats") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveChats() {
  try {
    localStorage.setItem("nexa-chats", JSON.stringify(chats));
  } catch {
    showToast("Could not save chats in this browser.");
  }
}

function t(key) {
  return translations[language][key] || translations.en[key] || key;
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.body.dir = language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (translations[language][key]) {
      node.innerHTML = translations[language][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });

  $("#languageValue").textContent = language.toUpperCase();
  $("#topLanguage").textContent = language === "en" ? "ع" : "EN";
  renderHistory();
  renderMessages();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

function createChat() {
  const chat = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: language === "ar" ? "محادثة جديدة" : "New conversation",
    messages: [],
    updatedAt: Date.now()
  };
  chats.unshift(chat);
  activeChatId = chat.id;
  saveChats();
  renderHistory();
  renderMessages();
  elements.input.focus();
}

function getActiveChat() {
  return chats.find(chat => chat.id === activeChatId);
}

function renderHistory() {
  elements.history.replaceChildren();

  if (!chats.length) {
    const empty = document.createElement("p");
    empty.className = "history-empty";
    empty.textContent = t("noChats");
    elements.history.append(empty);
    return;
  }

  chats.forEach(chat => {
    const button = document.createElement("button");
    button.className = "history-item" + (chat.id === activeChatId ? " active" : "");
    button.type = "button";

    const icon = document.createElement("span");
    icon.textContent = "◷";
    const title = document.createElement("span");
    title.textContent = chat.title;

    button.append(icon, title);
    button.addEventListener("click", () => {
      activeChatId = chat.id;
      renderHistory();
      renderMessages();
      closeSidebar();
    });
    elements.history.append(button);
  });
}

function addMessage(role, content, isDemo = false) {
  const chat = getActiveChat();
  if (!chat) return;

  chat.messages.push({ role, content, isDemo });
  chat.updatedAt = Date.now();

  if (role === "user" && chat.messages.filter(m => m.role === "user").length === 1) {
    chat.title = content.length > 30 ? content.slice(0, 30) + "…" : content;
  }

  chats.sort((a, b) => b.updatedAt - a.updatedAt);
  saveChats();
  renderHistory();
  renderMessages();
}

function renderMessages() {
  elements.messages.replaceChildren();
  const chat = getActiveChat();
  const hasMessages = chat && chat.messages.length > 0;

  elements.welcome.classList.toggle("hidden", Boolean(hasMessages));

  if (!hasMessages) return;

  chat.messages.forEach(message => {
    const article = document.createElement("article");
    article.className = `message ${message.role}`;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = message.role === "user" ? "U" : "N";

    const content = document.createElement("div");
    content.className = "message-content";

    const label = document.createElement("div");
    label.className = "message-label";
    label.textContent = message.role === "user" ? t("user") : t("assistant");

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = message.content;

    content.append(label, bubble);

    if (message.isDemo) {
      const demo = document.createElement("div");
      demo.className = "demo-label";
      demo.textContent = language === "ar" ? "رد تجريبي • ليس ذكاءً اصطناعياً مباشراً" : "Demo reply • Not a live AI response";
      content.append(demo);
    }

    article.append(avatar, content);
    elements.messages.append(article);
  });

  elements.messages.scrollTop = elements.messages.scrollHeight;
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function sendMessage(text) {
  const content = text.trim();
  if (!content) {
    showToast(t("empty"));
    return;
  }

  if (!getActiveChat()) createChat();

  elements.input.value = "";
  resizeInput();
  addMessage("user", content);

  elements.send.disabled = true;

  // This is intentionally a demo response, not a real AI request.
  window.setTimeout(() => {
    addMessage("assistant", t("demoReply"), true);
    elements.send.disabled = false;
    elements.input.focus();
  }, 500);
}

function resizeInput() {
  elements.input.style.height = "auto";
  elements.input.style.height = Math.min(elements.input.scrollHeight, 150) + "px";
}

function switchLanguage() {
  language = language === "en" ? "ar" : "en";
  localStorage.setItem("nexa-language", language);
  applyLanguage();
  showToast(t("languageChanged"));
}

function openSidebar() {
  elements.sidebar.classList.add("open");
}

function closeSidebar() {
  elements.sidebar.classList.remove("open");
}

function clearHistory() {
  chats = [];
  activeChatId = null;
  saveChats();
  renderHistory();
  renderMessages();
  elements.settings.classList.add("hidden");
  showToast(t("cleared"));
}

$("#newChat").addEventListener("click", () => {
  createChat();
  closeSidebar();
});

$("#sendButton").addEventListener("click", () => sendMessage(elements.input.value));

elements.input.addEventListener("input", resizeInput);

elements.input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage(elements.input.value);
  }
});

document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt));
});

$("#languageButton").addEventListener("click", switchLanguage);
$("#topLanguage").addEventListener("click", switchLanguage);
$("#settingsLanguage").addEventListener("click", switchLanguage);

$("#settingsButton").addEventListener("click", () => {
  elements.settings.classList.remove("hidden");
  closeSidebar();
});

$("#closeSettings").addEventListener("click", () => {
  elements.settings.classList.add("hidden");
});

elements.settings.addEventListener("click", event => {
  if (event.target === elements.settings) {
    elements.settings.classList.add("hidden");
  }
});

$("#clearHistory").addEventListener("click", clearHistory);
$("#openSidebar").addEventListener("click", openSidebar);
$("#closeSidebar").addEventListener("click", closeSidebar);

$("#attachButton").addEventListener("click", () => showToast(t("attachSoon")));

$("#modelButton").addEventListener("click", () => {
  elements.modelMenu.classList.toggle("hidden");
});

elements.modelMenu.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", () => {
    elements.modelName.textContent = button.dataset.model;
    elements.modelMenu.classList.add("hidden");
    showToast(language === "ar" ? "تم تغيير وضع العرض." : "Demo mode changed.");
  });
});

document.addEventListener("click", event => {
  if (!event.target.closest(".model-wrap")) {
    elements.modelMenu.classList.add("hidden");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    elements.settings.classList.add("hidden");
    closeSidebar();
    elements.modelMenu.classList.add("hidden");
  }
});

applyLanguage();
renderMessages();
