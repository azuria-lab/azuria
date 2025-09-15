# CHANGELOG

Todas as mudanças relevantes deste projeto serão documentadas neste arquivo.

O formato segue *Keep a Changelog* e datas em ISO (YYYY-MM-DD). Versões seguem *SemVer*.

## [Unreleased]

### Adicionado

- Estrutura inicial de governança (licença proprietária, políticas e automações)
- Script de verificação de gerenciador de pacotes (npm-only)
- Workflow de guarda de lockfiles alternativos
- Placeholder de workflow de deploy para futura integração com Azure

### Alterado

- Padronização de pipeline CI com concurrency e artifact de build
- Dependabot configurado para apenas atualizações de segurança

### Segurança

- Política de segurança revisada com contato [security@azuria.com](mailto:security@azuria.com)

## [0.1.0] - 2025-09-13

### Base Inicial

- Plataforma (frontend React/Vite + Supabase)
- Scripts de build, lint, type-check e smoke tests

[Unreleased]: https://github.com/azuria-lab/azuria/compare/0.1.0...HEAD
