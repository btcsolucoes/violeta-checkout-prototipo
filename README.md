# QrStack System Prototype

Protótipo isolado para evoluir a QrStack de cardápios estáticos para uma plataforma multi-restaurante.

## Rotas do MVP

- `#/hq` - central interna QrStack.
- `#/hq/clientes` - clientes cadastrados.
- `#/hq/respostas` - respostas dos formulários.
- `#/hq/stories` - Stories gerados.
- `#/hq/insights` - insights internos.
- `#/admin/restaurante-demo` - acesso simplificado do restaurante.
- `#/r/restaurante-demo?src=qr` - cardápio público com tracking de origem.

## Escopo atual

- Dados simulados em `localStorage`.
- Formulário próprio para cardápio do dia.
- Publicação automática do cardápio público.
- Geração de Story 1080x1920 em canvas.
- Download e compartilhamento nativo do Story.
- Tentativa de abertura do Instagram após compartilhamento.
- Eventos e insights internos para a central QrStack.
- Schema Supabase em `supabase/schema.sql`.
- Central QrStack com identidade própria do sistema.
- Portal do cliente com tema herdado do restaurante.

## Modelo de automação

O fluxo atual do Amaro usa Google Forms, Google Sheets e um endpoint de Google Apps Script. O site busca esse endpoint, filtra os itens pela data do dia e renderiza o cardápio automaticamente.

No produto QrStack, o Google Forms sai do fluxo:

1. Restaurante recebe link do painel.
2. Preenche formulário próprio da QrStack.
3. Supabase salva cardápio e itens.
4. Página pública busca por `slug` e data.
5. Story é gerado a partir da mesma publicação.
6. Insights ficam na central QrStack.

## Próxima fase

- Migrar para Next.js.
- Conectar Supabase/Postgres.
- Salvar imagens no Supabase Storage.
- Criar autenticação/token por restaurante.
- Preparar automação WhatsApp para lembretes.
