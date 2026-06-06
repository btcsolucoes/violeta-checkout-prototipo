const ASSETS = {
  qrstackMark: "assets/qrstack-mark.png",
  qrstackWordmark: "assets/qrstack-wordmark.png",
};

const DEFAULT_STATE = {
  restaurants: [
    {
      id: "rest-demo",
      name: "Restaurante Demo",
      slug: "restaurante-demo",
      logoUrl: ASSETS.qrstackWordmark,
      symbolUrl: ASSETS.qrstackMark,
      primaryColor: "#4a1f16",
      secondaryColor: "#d59b52",
      whatsappNumber: "81999999999",
      instagramUrl: "https://instagram.com/restaurantedemo",
      mapsUrl: "https://maps.google.com/?q=Restaurante%20Demo",
      address: "Rua Exemplo, 100",
      adminToken: "demo-restaurante",
      reminderTime: "09:00",
      reminderEnabled: false,
      messageTemplate:
        "Bom dia! Segue o link do painel QrStack para publicar o cardápio e gerar o Story de hoje: {link}",
    },
    {
      id: "rest-cafe-demo",
      name: "Café Modelo",
      slug: "cafe-modelo",
      logoUrl: ASSETS.qrstackWordmark,
      symbolUrl: ASSETS.qrstackMark,
      primaryColor: "#203b46",
      secondaryColor: "#d9843b",
      whatsappNumber: "81988888888",
      instagramUrl: "https://instagram.com/cafemodelo",
      mapsUrl: "https://maps.google.com/?q=Caf%C3%A9%20Modelo",
      address: "Av. Modelo, 250",
      adminToken: "demo-cafe",
      reminderTime: "08:30",
      reminderEnabled: true,
      messageTemplate: "Olá! Atualize o cardápio do dia pelo painel: {link}",
    },
  ],
  menuDays: [
    {
      id: "menu-demo-today",
      restaurantId: "rest-demo",
      date: todayIso(),
      title: "Buffet de hoje",
      price: "R$ 64,90/kg",
      serviceHours: "Almoço das 11h às 14h30",
      notes: "Cardápio sujeito a alterações conforme disponibilidade do dia.",
      isPublished: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  menuItems: [
    item("menu-demo-today", "Carne de panela", "Proteínas", true, 1),
    item("menu-demo-today", "Frango grelhado", "Proteínas", true, 2),
    item("menu-demo-today", "Peixe ao molho de ervas", "Proteínas", true, 3),
    item("menu-demo-today", "Arroz branco", "Bases", false, 4),
    item("menu-demo-today", "Feijão carioca", "Bases", true, 5),
    item("menu-demo-today", "Purê de batata", "Guarnições", false, 6),
    item("menu-demo-today", "Salada verde", "Saladas", false, 7),
    item("menu-demo-today", "Farofa da casa", "Acompanhamentos", false, 8),
  ],
  storyAssets: [],
  events: seedEvents(),
};

const STORE_KEY = "qrstack-system-prototype-v2";
const app = document.getElementById("app");
let state = loadState();
let lastStoryDataUrl = "";

function item(menuDayId, name, category, isHighlight, sortOrder, description = "") {
  return {
    id: `item-${menuDayId}-${sortOrder}`,
    menuDayId,
    name,
    category,
    description,
    isHighlight,
    sortOrder,
    createdAt: new Date().toISOString(),
  };
}

function seedEvents() {
  const now = Date.now();
  const source = ["qr", "instagram", "whatsapp", "bio", "direct"];
  const type = ["page_view", "page_view", "page_view", "whatsapp_click", "maps_click"];
  return Array.from({ length: 38 }, (_, index) => ({
    id: `event-${index}`,
    restaurantId: "rest-demo",
    menuDayId: "menu-demo-today",
    eventType: type[index % type.length],
    source: source[index % source.length],
    userAgent: "seed",
    referrer: "",
    ipHash: "",
    createdAt: new Date(now - index * 1000 * 60 * 60 * 5).toISOString(),
  }));
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (!stored) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(stored);
    return {
      ...structuredClone(DEFAULT_STATE),
      ...parsed,
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function router() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [path, hashQuery = ""] = hash.split("?");
  const parts = path.split("/").filter(Boolean);
  const params = new URLSearchParams(hashQuery || window.location.search);
  const source = params.get("src") || "direct";

  if (!hash || parts[0] === "home") return renderHome();
  if (parts[0] === "hq") return renderHq(parts[1] || "overview");
  if (parts[0] === "admin") return renderClientPortal(parts[1] || "restaurante-demo");
  if (parts[0] === "r") return renderPublicMenu(parts[1] || "restaurante-demo", source);
  renderHome();
}

function setTheme(restaurant) {
  document.documentElement.style.setProperty("--primary", restaurant.primaryColor);
  document.documentElement.style.setProperty("--secondary", restaurant.secondaryColor);
  document.documentElement.style.setProperty("--accent", "#f4b740");
  document.documentElement.style.setProperty("--hero-mark", `url("${restaurant.symbolUrl}")`);
  document.documentElement.style.setProperty("--brand-pattern", `url("${restaurant.symbolUrl}")`);
}

function setSystemTheme() {
  document.documentElement.style.setProperty("--primary", "#0b2239");
  document.documentElement.style.setProperty("--secondary", "#27d39f");
  document.documentElement.style.setProperty("--accent", "#f4b740");
  document.documentElement.style.setProperty("--hero-mark", `url("${ASSETS.qrstackMark}")`);
  document.documentElement.style.setProperty("--brand-pattern", `url("${ASSETS.qrstackMark}")`);
}

function getRestaurant(slug) {
  return state.restaurants.find((restaurant) => restaurant.slug === slug) || state.restaurants[0];
}

function getLatestMenu(restaurantId) {
  return state.menuDays
    .filter((menu) => menu.restaurantId === restaurantId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
}

function getMenuItems(menuDayId) {
  return state.menuItems
    .filter((menuItem) => menuItem.menuDayId === menuDayId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function trackEvent(restaurant, eventType, source = "direct", menuDayId = null) {
  state.events.push({
    id: crypto.randomUUID(),
    restaurantId: restaurant.id,
    menuDayId,
    eventType,
    source,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    ipHash: "",
    createdAt: new Date().toISOString(),
  });
  saveState();
}

function renderHome() {
  setSystemTheme();
  app.innerHTML = `
    <section class="hero">
      <div class="hero__inner">
        <img class="hero__logo" src="${ASSETS.qrstackWordmark}" alt="QrStack" />
        <p class="eyebrow">Protótipo de plataforma</p>
        <h1>Cardápio, Story e Insights em um fluxo só</h1>
        <div class="hero__meta">
          <span class="pill">Multi-restaurante</span>
          <span class="pill">Formulário próprio</span>
          <span class="pill">Story automático</span>
        </div>
        <div class="actions">
          <a class="button" href="#/hq">Central QrStack</a>
          <a class="button secondary" href="#/admin/restaurante-demo">Acesso do restaurante</a>
          <a class="button ghost" href="#/r/restaurante-demo?src=qr">Cardápio público</a>
        </div>
      </div>
    </section>
  `;
}

function renderHq(tab = "overview") {
  setSystemTheme();
  const restaurants = state.restaurants;
  app.innerHTML = `
    <div class="admin-layout">
      ${renderAdminHero("Central QrStack", "Sua visão interna dos clientes, formulários, respostas, Stories e insights.", ASSETS.qrstackMark)}
      ${renderTopbar([
        ["#/hq/overview", "Visão Geral", tab === "overview"],
        ["#/hq/clientes", "Clientes", tab === "clientes"],
        ["#/hq/respostas", "Respostas", tab === "respostas"],
        ["#/hq/stories", "Stories", tab === "stories"],
        ["#/hq/insights", "Insights", tab === "insights"],
      ])}
      <main class="page">
        ${tab === "clientes" ? renderHqClients(restaurants) : ""}
        ${tab === "respostas" ? renderHqResponses() : ""}
        ${tab === "stories" ? renderHqStories() : ""}
        ${tab === "insights" ? renderHqInsights() : ""}
        ${tab === "overview" ? renderHqOverview() : ""}
      </main>
    </div>
  `;
}

function renderAdminHero(title, subtitle, logoUrl) {
  return `
    <header class="admin-hero">
      <div class="admin-hero__inner">
        <div class="admin-title">
          <div>
            <p class="eyebrow">QrStack</p>
            <h2>${title}</h2>
            <p>${subtitle}</p>
          </div>
          <img src="${logoUrl}" alt="" />
        </div>
      </div>
    </header>
  `;
}

function renderTopbar(links, restaurant = null) {
  const chip = restaurant
    ? `<a class="brand-chip" href="#/r/${restaurant.slug}"><img src="${restaurant.symbolUrl}" alt="" /><span>${restaurant.name}</span></a>`
    : `<a class="brand-chip" href="#/home"><img src="${ASSETS.qrstackMark}" alt="" /><span>QrStack</span></a>`;
  return `
    <nav class="topbar">
      <div class="topbar__inner">
        ${chip}
        ${links
          .map(([href, label, active]) => `<a class="nav-link ${active ? "active" : ""}" href="${href}">${label}</a>`)
          .join("")}
      </div>
    </nav>
  `;
}

function renderHqOverview() {
  const totalRestaurants = state.restaurants.length;
  const todayEvents = state.events.filter((event) => isToday(event.createdAt)).length;
  const stories = state.storyAssets.length;
  const menus = state.menuDays.length;
  return `
    <section class="section">
      <div class="section__head">
        <p class="eyebrow">Operação</p>
        <h2>Painel central dos clientes</h2>
        <p>Aqui ficam seus restaurantes, links de formulário, respostas publicadas, Stories gerados e insights internos.</p>
      </div>
      <div class="grid grid--three">
        ${metric("Clientes", totalRestaurants)}
        ${metric("Acessos hoje", todayEvents)}
        ${metric("Stories gerados", stories)}
      </div>
      <div class="card">
        <h3>Próxima automação</h3>
        <p class="muted">A estrutura de lembretes já está modelada por cliente. No futuro, a API de WhatsApp usa horário, status ativo/inativo e mensagem padrão para enviar o link do painel.</p>
      </div>
      <div class="card">
        <h3>Como substitui o Google Forms</h3>
        <p class="muted">No Amaro, o cardápio público busca um endpoint do Google Apps Script, filtra as respostas da planilha pela data de hoje e renderiza o almoço automaticamente. Na QrStack, o restaurante preenche este painel, o sistema salva no Supabase e a página pública lê o cardápio publicado pelo slug do cliente. O GitHub fica só para código/deploy, não para atualizar cardápio.</p>
      </div>
      <div class="card">
        <h3>Cardápios publicados</h3>
        <p class="muted">${menus} publicação cadastrada no protótipo local.</p>
      </div>
    </section>
  `;
}

function renderHqClients(restaurants) {
  return `
    <section class="section">
      <div class="section__head">
        <p class="eyebrow">Clientes</p>
        <h2>Restaurantes cadastrados</h2>
        <p>Links internos para você copiar, conferir o formulário e abrir o cardápio público de cada cliente.</p>
      </div>
      <div class="grid">
        ${restaurants
          .map(
            (restaurant) => `
              <article class="card">
                <p class="eyebrow">${restaurant.slug}</p>
                <h3>${restaurant.name}</h3>
                <p class="muted">${restaurant.address || "Endereço não informado"}</p>
                <div class="actions">
                  <a class="button" href="#/admin/${restaurant.slug}">Formulário do cliente</a>
                  <a class="button secondary" href="#/r/${restaurant.slug}?src=qr">Cardápio público</a>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderHqResponses() {
  const rows = state.menuDays
    .map((menu) => {
      const restaurant = state.restaurants.find((rest) => rest.id === menu.restaurantId);
      const itemCount = getMenuItems(menu.id).length;
      return `
        <div class="table-row">
          <span><strong>${restaurant?.name || "Cliente"}</strong><br><span class="muted">${menu.title} - ${formatDate(menu.date)}</span></span>
          <span>${itemCount} itens</span>
        </div>
      `;
    })
    .join("");
  return `
    <section class="section">
      <div class="section__head">
        <p class="eyebrow">Formulários</p>
        <h2>Respostas recebidas</h2>
        <p>Este bloco substitui a planilha do Google Forms no produto final.</p>
      </div>
      <div class="card table">${rows || "<p class='muted'>Nenhuma resposta ainda.</p>"}</div>
    </section>
  `;
}

function renderHqStories() {
  const stories = state.storyAssets
    .slice()
    .reverse()
    .map((story) => {
      const restaurant = state.restaurants.find((rest) => rest.id === story.restaurantId);
      return `
        <div class="table-row">
          <span><strong>${restaurant?.name || "Cliente"}</strong><br><span class="muted">${formatDateTime(story.createdAt)}</span></span>
          <span>${story.templateName}</span>
        </div>
      `;
    })
    .join("");
  return `
    <section class="section">
      <div class="section__head">
        <p class="eyebrow">Stories</p>
        <h2>Artes geradas</h2>
        <p>Histórico interno das artes criadas pelos clientes.</p>
      </div>
      <div class="card table">${stories || "<p class='muted'>Nenhum Story gerado ainda.</p>"}</div>
    </section>
  `;
}

function renderHqInsights() {
  const grouped = groupBy(state.events, "source");
  const clicksWhats = state.events.filter((event) => event.eventType === "whatsapp_click").length;
  const clicksMaps = state.events.filter((event) => event.eventType === "maps_click").length;
  return `
    <section class="section">
      <div class="section__head">
        <p class="eyebrow">Insights internos</p>
        <h2>Acesso e conversão</h2>
        <p>Essa área fica só para você na QrStack, não aparece no acesso simplificado do restaurante.</p>
      </div>
      <div class="grid grid--three">
        ${metric("Últimos 7 dias", lastDaysEvents(7).length)}
        ${metric("WhatsApp", clicksWhats)}
        ${metric("Como chegar", clicksMaps)}
      </div>
      <div class="grid">
        <div class="card">
          <h3>Origem dos acessos</h3>
          <div class="table">
            ${Object.entries(grouped)
              .map(([source, events]) => `<div class="table-row"><span>${source}</span><strong>${events.length}</strong></div>`)
              .join("")}
          </div>
        </div>
        <div class="card">
          <h3>Horário de pico</h3>
          <p class="muted">${peakHour()}</p>
        </div>
      </div>
    </section>
  `;
}

function renderClientPortal(slug) {
  const restaurant = getRestaurant(slug);
  const menu = getLatestMenu(restaurant.id) || createBlankMenu(restaurant.id);
  const menuItems = getMenuItems(menu.id);
  setTheme(restaurant);
  app.innerHTML = `
    <div class="admin-layout">
      ${renderAdminHero("Painel do restaurante", "Preencha o cardápio do dia uma vez. A QrStack atualiza o cardápio e prepara o Story.", restaurant.symbolUrl)}
      ${renderTopbar([
        [`#/admin/${restaurant.slug}`, "Formulário", true],
        [`#/r/${restaurant.slug}?src=direct`, "Ver cardápio", false],
      ], restaurant)}
      <main class="page page--narrow">
        <section class="section">
          <div class="section__head">
            <p class="eyebrow">Acesso do cliente</p>
            <h2>${restaurant.name}</h2>
            <p>Por enquanto, o restaurante só vê o formulário e a geração de Story. Insights ficam na sua central QrStack.</p>
          </div>
          <form id="menu-form" class="card form-grid">
            <input type="hidden" name="menuId" value="${menu.id}" />
            ${field("Título", "title", menu.title, "Ex: Buffet de hoje")}
            ${field("Data", "date", menu.date, "", "date")}
            ${field("Preço", "price", menu.price, "Ex: R$ 59,90/kg")}
            ${field("Horário", "serviceHours", menu.serviceHours, "Ex: Almoço das 11h às 14h30")}
            <div class="field field--full">
              <label for="items">Itens do dia</label>
              <textarea id="items" name="items" placeholder="Um item por linha. Use Categoria: Item para organizar.">${menuItems
                .map((menuItem) => `${menuItem.category}: ${menuItem.name}${menuItem.isHighlight ? " *" : ""}`)
                .join("\n")}</textarea>
            </div>
            <div class="field field--full">
              <label for="notes">Observações</label>
              <textarea id="notes" name="notes" placeholder="Observações do dia">${menu.notes || ""}</textarea>
            </div>
            <div class="actions field--full">
              <button type="submit">Salvar e atualizar cardápio</button>
              <button type="button" class="secondary" id="generate-story">Gerar Story</button>
            </div>
          </form>
        </section>

        <section class="section" id="story-panel">
          <div class="section__head">
            <p class="eyebrow">Story automático</p>
            <h2>Arte pronta para publicar</h2>
            <p>O botão de postar tenta usar compartilhamento nativo no celular e depois abre o Instagram. No desktop, baixa a arte como fallback.</p>
          </div>
          <div class="story-workbench">
            <div class="card">
              <h3>Fluxo do cliente</h3>
              <p class="muted">Depois de salvar o formulário, o restaurante baixa/compartilha o Story sem acessar insights ou configurações internas.</p>
              <div class="actions">
                <button type="button" id="download-story">Baixar Story</button>
                <button type="button" class="secondary" id="share-story">Postar arte</button>
              </div>
            </div>
            <div class="story-frame">
              <canvas id="story-canvas" width="1080" height="1920"></canvas>
            </div>
          </div>
        </section>
      </main>
    </div>
  `;
  attachClientHandlers(restaurant, menu);
  drawStory(restaurant, menu, getMenuItems(menu.id));
}

function createBlankMenu(restaurantId) {
  const menu = {
    id: crypto.randomUUID(),
    restaurantId,
    date: todayIso(),
    title: "Buffet de hoje",
    price: "",
    serviceHours: "",
    notes: "",
    isPublished: false,
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.menuDays.push(menu);
  saveState();
  return menu;
}

function field(label, name, value, placeholder = "", type = "text") {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" value="${escapeAttr(value || "")}" placeholder="${placeholder}" />
    </div>
  `;
}

function attachClientHandlers(restaurant, menu) {
  document.getElementById("menu-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    saveMenuForm(restaurant, menu.id, formData);
    const updatedMenu = getLatestMenu(restaurant.id);
    drawStory(restaurant, updatedMenu, getMenuItems(updatedMenu.id));
    toast("Cardápio atualizado e publicado.");
  });

  document.getElementById("generate-story").addEventListener("click", () => {
    document.getElementById("menu-form").requestSubmit();
    const latestMenu = getLatestMenu(restaurant.id);
    state.storyAssets.push({
      id: crypto.randomUUID(),
      restaurantId: restaurant.id,
      menuDayId: latestMenu.id,
      imageUrl: "local-canvas-preview",
      templateName: "daily-menu-v1",
      createdAt: new Date().toISOString(),
    });
    trackEvent(restaurant, "story_generated", "admin", latestMenu.id);
    saveState();
    document.getElementById("story-panel").scrollIntoView({ behavior: "smooth" });
  });

  document.getElementById("download-story").addEventListener("click", () => {
    downloadStory(restaurant);
    const latestMenu = getLatestMenu(restaurant.id);
    trackEvent(restaurant, "story_downloaded", "admin", latestMenu.id);
  });

  document.getElementById("share-story").addEventListener("click", async () => {
    const latestMenu = getLatestMenu(restaurant.id);
    await shareStory(restaurant);
    trackEvent(restaurant, "story_shared", "admin", latestMenu.id);
  });
}

function saveMenuForm(restaurant, menuId, formData) {
  const menu = state.menuDays.find((entry) => entry.id === menuId);
  menu.title = formData.get("title").toString().trim();
  menu.date = formData.get("date").toString();
  menu.price = formData.get("price").toString().trim();
  menu.serviceHours = formData.get("serviceHours").toString().trim();
  menu.notes = formData.get("notes").toString().trim();
  menu.isPublished = true;
  menu.publishedAt = new Date().toISOString();
  menu.updatedAt = new Date().toISOString();

  state.menuItems = state.menuItems.filter((menuItem) => menuItem.menuDayId !== menuId);
  const rows = formData
    .get("items")
    .toString()
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean);
  rows.forEach((row, index) => {
    const isHighlight = row.endsWith("*");
    const clean = row.replace(/\*$/, "").trim();
    const [maybeCategory, ...rest] = clean.split(":");
    const hasCategory = rest.length > 0;
    state.menuItems.push(
      item(
        menuId,
        hasCategory ? rest.join(":").trim() : clean,
        hasCategory ? maybeCategory.trim() : "Destaques",
        isHighlight || index < 6,
        index + 1
      )
    );
  });
  trackEvent(restaurant, "menu_published", "admin", menuId);
  saveState();
}

function renderPublicMenu(slug, source = "direct") {
  const restaurant = getRestaurant(slug);
  const menu = getLatestMenu(restaurant.id);
  const menuItems = menu ? getMenuItems(menu.id) : [];
  const groups = groupBy(menuItems, "category");
  setTheme(restaurant);
  if (menu) trackEvent(restaurant, "page_view", source, menu.id);
  app.innerHTML = `
    <section class="hero">
      <div class="hero__inner">
        <img class="hero__logo" src="${restaurant.logoUrl}" alt="${restaurant.name}" />
        <p class="eyebrow">Cardápio digital</p>
        <h1>${restaurant.name}</h1>
        <div class="hero__meta">
          <span class="pill">${restaurant.address || ""}</span>
          <span class="pill">${menu?.serviceHours || "Horário do dia"}</span>
        </div>
      </div>
    </section>
    ${renderTopbar([
      ["#menu", "Cardápio", true],
      ["#contato", "Contato", false],
    ], restaurant)}
    <main class="page">
      <section id="menu" class="section">
        <div class="section__head">
          <p class="eyebrow">${menu ? formatDate(menu.date) : "Hoje"}</p>
          <h2>${menu?.title || "Cardápio do dia"}</h2>
          <p>${menu?.notes || "Itens publicados pelo restaurante."}</p>
        </div>
        <div class="grid grid--three">
          ${metric("Preço", menu?.price || "Consulte")}
          ${metric("Categorias", Object.keys(groups).length)}
          ${metric("Destaques", menuItems.filter((entry) => entry.isHighlight).length)}
        </div>
        ${Object.entries(groups)
          .map(
            ([category, items]) => `
              <div class="section">
                <div class="section__head">
                  <p class="eyebrow">Categoria</p>
                  <h3>${category}</h3>
                </div>
                <div class="rail">
                  ${items
                    .map(
                      (menuItem) => `
                        <article class="item-card">
                          <div class="item-card__top">
                            <h3>${menuItem.name}</h3>
                            ${menuItem.isHighlight ? '<span class="tag">Destaque</span>' : ""}
                          </div>
                          ${menuItem.description ? `<p class="muted">${menuItem.description}</p>` : ""}
                        </article>
                      `
                    )
                    .join("")}
                </div>
              </div>
            `
          )
          .join("")}
      </section>
      <section id="contato" class="section">
        <div class="section__head">
          <p class="eyebrow">Contato</p>
          <h2>Fale com o restaurante</h2>
        </div>
        <div class="actions">
          <a class="button" data-track="whatsapp_click" href="https://wa.me/55${restaurant.whatsappNumber}" target="_blank" rel="noreferrer">WhatsApp</a>
          <a class="button secondary" data-track="maps_click" href="${restaurant.mapsUrl}" target="_blank" rel="noreferrer">Como chegar</a>
          <a class="button ghost" data-track="instagram_click" href="${restaurant.instagramUrl}" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </section>
    </main>
  `;
  document.querySelectorAll("[data-track]").forEach((link) => {
    link.addEventListener("click", () => trackEvent(restaurant, link.dataset.track, source, menu?.id));
  });
}

function drawStory(restaurant, menu, menuItems) {
  const canvas = document.getElementById("story-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  const highlights = menuItems.filter((menuItem) => menuItem.isHighlight).slice(0, 6);
  const logo = new Image();
  logo.crossOrigin = "anonymous";
  logo.onload = () => {
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, restaurant.primaryColor);
    gradient.addColorStop(0.62, "#fbf0d7");
    gradient.addColorStop(1, "#f3d696");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.08;
    for (let y = -80; y < h; y += 310) {
      for (let x = -60; x < w; x += 330) {
        ctx.drawImage(logo, x, y, 170, 170);
      }
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255,255,255,0.88)";
    roundRect(ctx, 84, 110, w - 168, h - 220, 28);
    ctx.fill();

    ctx.drawImage(logo, w / 2 - 110, 180, 220, 220);
    ctx.textAlign = "center";
    ctx.fillStyle = restaurant.secondaryColor;
    ctx.font = "800 42px Manrope";
    ctx.fillText("CARDÁPIO DO DIA", w / 2, 495);

    ctx.fillStyle = restaurant.primaryColor;
    ctx.font = "800 94px Sora";
    wrapCanvasText(ctx, menu.title || "Buffet de hoje", w / 2, 630, w - 220, 104, 2);

    ctx.fillStyle = "#6f416c";
    ctx.font = "700 38px Manrope";
    ctx.fillText(formatDate(menu.date), w / 2, 820);

    ctx.textAlign = "left";
    let y = 940;
    highlights.forEach((entry) => {
      ctx.fillStyle = restaurant.primaryColor;
      ctx.font = "800 44px Manrope";
      ctx.fillText("•", 178, y);
      ctx.fillStyle = "#42213e";
      ctx.font = "800 44px Manrope";
      wrapCanvasText(ctx, entry.name, 222, y, w - 350, 52, 1);
      y += 92;
    });

    ctx.textAlign = "center";
    ctx.fillStyle = restaurant.primaryColor;
    roundRect(ctx, 210, 1430, w - 420, 118, 22);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "900 48px Manrope";
    ctx.fillText(menu.price || "Consulte o valor", w / 2, 1504);

    ctx.fillStyle = "#6f416c";
    ctx.font = "700 34px Manrope";
    ctx.fillText(menu.serviceHours || "Confira o horário no cardápio", w / 2, 1618);
    ctx.fillStyle = restaurant.primaryColor;
    ctx.font = "900 38px Manrope";
    ctx.fillText("ACESSE O CARDÁPIO COMPLETO", w / 2, 1718);
    ctx.fillStyle = "#42213e";
    ctx.font = "700 30px Manrope";
    ctx.fillText(`qrstack.com.br/${restaurant.slug}`, w / 2, 1772);
    lastStoryDataUrl = canvas.toDataURL("image/png");
  };
  logo.src = restaurant.symbolUrl;
}

function downloadStory(restaurant) {
  const link = document.createElement("a");
  link.href = lastStoryDataUrl || document.getElementById("story-canvas").toDataURL("image/png");
  link.download = `story-${restaurant.slug}-${todayIso()}.png`;
  link.click();
}

async function shareStory(restaurant) {
  const canvas = document.getElementById("story-canvas");
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const file = new File([blob], `story-${restaurant.slug}.png`, { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: `Story ${restaurant.name}`,
      text: "Story do cardápio do dia pronto para publicar.",
    });
    window.location.href = "instagram://story-camera";
    return;
  }
  downloadStory(restaurant);
  setTimeout(() => {
    window.location.href = "https://www.instagram.com/";
  }, 400);
}

function metric(label, value) {
  return `
    <article class="card metric">
      <span class="eyebrow">${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function groupBy(list, key) {
  return list.reduce((acc, item) => {
    const group = item[key] || "Geral";
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {});
}

function isToday(value) {
  return new Date(value).toDateString() === new Date().toDateString();
}

function lastDaysEvents(days) {
  const min = Date.now() - days * 24 * 60 * 60 * 1000;
  return state.events.filter((event) => new Date(event.createdAt).getTime() >= min);
}

function peakHour() {
  const hours = groupBy(
    state.events.map((event) => ({ hour: new Date(event.createdAt).getHours() })),
    "hour"
  );
  const [hour, events] = Object.entries(hours).sort((a, b) => b[1].length - a[1].length)[0] || ["--", []];
  return hour === "--" ? "Sem dados ainda." : `${hour.padStart(2, "0")}h, com ${events.length} eventos registrados.`;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function toast(message) {
  const old = document.querySelector(".toast");
  if (old) old.remove();
  const element = document.createElement("div");
  element.className = "toast";
  element.textContent = message;
  document.body.appendChild(element);
  setTimeout(() => element.remove(), 2800);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const words = String(text).split(" ");
  let line = "";
  let lineCount = 0;
  for (let index = 0; index < words.length; index += 1) {
    const testLine = `${line}${words[index]} `;
    if (ctx.measureText(testLine).width > maxWidth && index > 0) {
      ctx.fillText(line.trim(), x, y);
      line = `${words[index]} `;
      y += lineHeight;
      lineCount += 1;
      if (lineCount >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
}

window.addEventListener("hashchange", router);
router();
