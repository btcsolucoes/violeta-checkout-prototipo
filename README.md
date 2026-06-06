# QrStack Platform Prototype

Protótipo isolado para evoluir a QrStack de cardápios estáticos para uma plataforma multi-restaurante.

## Rotas do MVP

- `#/hq` - central interna QrStack.
- `#/hq/clientes` - clientes cadastrados.
- `#/hq/respostas` - respostas dos formulários.
- `#/hq/stories` - Stories gerados.
- `#/hq/insights` - insights internos.
- `#/admin/violeta` - acesso simplificado do restaurante.
- `#/r/violeta?src=qr` - cardápio público com tracking de origem.

## Escopo atual

- Dados simulados em `localStorage`.
- Formulário próprio para cardápio do dia.
- Publicação automática do cardápio público.
- Geração de Story 1080x1920 em canvas.
- Download e compartilhamento nativo do Story.
- Tentativa de abertura do Instagram após compartilhamento.
- Eventos e insights internos para a central QrStack.
- Schema Supabase em `supabase/schema.sql`.

## Próxima fase

- Migrar para Next.js.
- Conectar Supabase/Postgres.
- Salvar imagens no Supabase Storage.
- Criar autenticação/token por restaurante.
- Preparar automação WhatsApp para lembretes.
