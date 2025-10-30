// server.js - Express backend com SendGrid
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@cineflix.example';
let sgMail = null;
if(SENDGRID_API_KEY){
  try{
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('SendGrid habilitado');
  }catch(e){
    console.warn('Instale @sendgrid/mail para envio real.');
  }
}

const pending = {}; // email -> { code, expires, password }

function genCode(){ return String(Math.floor(Math.random()*900000)+100000); }
function expireTs(){ return Date.now() + 30*60*1000; }

app.post('/api/signup', async (req,res)=>{
  const { email, pwd } = req.body || {};
  if(!email || !pwd) return res.status(400).json({ error: 'email e pwd são necessários' });
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Formato de e-mail inválido' });
  const code = genCode();
  pending[email.toLowerCase()] = { code, expires: expireTs(), pwd };
  const template = `<!doctype html>\n<html>\n  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n    <style>body{font-family:Arial,Helvetica,sans-serif;background:#0b0b0b;color:#fff;margin:0;padding:0}.container{max-width:600px;margin:36px auto;background:#0f1113;padding:24px;border-radius:8px}.logo{color:#e50914;font-weight:700;font-size:28px}.code{font-size:28px;background:#111;padding:12px;border-radius:6px;display:inline-block;margin:12px 0}p{color:#cfd6db}</style>\n  </head>\n  <body>\n    <div class="container">\n      <div class="logo">CineFlix</div>\n      <h2>Código de verificação</h2>\n      <p>Use o código abaixo para confirmar seu e-mail. Ele expira em 30 minutos.</p>\n      <div class="code">%%CODE%%</div>\n      <p>Se você não cadastrou uma conta, ignore este e-mail.</p>\n      <p style="font-size:13px;color:#7f8a91">© 2025 CineFlix</p>\n    </div>\n  </body>\n</html>\n`.replace('%%CODE%%', code);
  if(sgMail){
    try{
      await sgMail.send({ to: email, from: FROM_EMAIL, subject: 'Seu código CineFlix', html: template });
      console.log('Enviado via SendGrid para', email);
      return res.json({ ok:true, message: 'Código enviado por e-mail.' });
    }catch(err){
      console.error('SendGrid error', err);
      return res.status(500).json({ error: 'Falha ao enviar e-mail' });
    }
  }else{
    console.log('Simulação (no SendGrid): código para', email, '=>', code);
    return res.json({ ok:true, message: 'Simulação: código gerado (veja log do servidor).' });
  }
});

app.post('/api/verify', (req,res)=>{
  const { email, code } = req.body || {};
  if(!email || !code) return res.status(400).json({ error: 'email e code necessários' });
  const entry = pending[email.toLowerCase()];
  if(!entry) return res.status(400).json({ error: 'Nenhum cadastro pendente' });
  if(Date.now() > entry.expires){ delete pending[email.toLowerCase()]; return res.status(400).json({ error: 'Código expirado' }); }
  if(String(entry.code) !== String(code)) return res.status(400).json({ error: 'Código incorreto' });
  delete pending[email.toLowerCase()];
  return res.json({ ok:true, message: 'E-mail confirmado. Conta criada.' });
});

app.get('/api/ping', (req,res)=>res.json({ ok:true, ts:Date.now() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=> console.log('Backend CineFlix rodando na porta', PORT));
