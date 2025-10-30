Backend CineFlix (Node.js) — instruções
1) Instale dependências:
   npm install
2) Configure .env com SENDGRID_API_KEY e FROM_EMAIL (veja .env.example)
3) Inicie:
   node backend/server.js
4) Endpoints:
   POST /api/signup  { "email":"...","pwd":"..." }
   POST /api/verify  { "email":"...","code":"123456" }
Observações:
- Em modo sem SendGrid, o servidor faz "simulação" e imprime o código no console.
- Substitua armazenamento em memória por DB em produção.
