/* ==========================================================================
   firebase-config.js — CONFIGURAÇÕES DO EVENTO
   --------------------------------------------------------------------------
   Este é o ÚNICO arquivo que você precisa editar para ligar o site ao seu
   projeto Firebase. Enquanto os valores abaixo estiverem com "COLE_AQUI",
   o site roda em MODO DEMONSTRAÇÃO (dados salvos só no seu navegador),
   perfeito para testar o visual antes de configurar tudo.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1) 👇 COLE AQUI O SEU firebaseConfig
   Onde achar: Console do Firebase → ⚙️ Configurações do projeto → Geral →
   "Seus apps" → App da Web (</>) → "Configuração do SDK" → Config.
   -------------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyC0YdZiE9ywN9Eh2VCm5LFEUKjCcvilBh4",
  authDomain: "wgs-oscar.firebaseapp.com",
  projectId: "wgs-oscar",
  storageBucket: "wgs-oscar.firebasestorage.app",
  messagingSenderId: "443413668076",
  appId: "1:443413668076:web:4c93dd0d9aef4095cf45c9",
  measurementId: "G-CRG3VC8L4H"
};

/* --------------------------------------------------------------------------
   2) 👇 COLE AQUI O UID DA CONTA GOOGLE DO ORGANIZADOR (ADMIN)
   Como descobrir: configure o firebaseConfig acima, abra o admin.html e faça
   login com a sua conta Google. A tela de "acesso negado" mostrará o seu UID
   com um botão de copiar. Cole-o aqui E também no arquivo firestore.rules.
   -------------------------------------------------------------------------- */
const ADMIN_UID = "MPC53zedqPONkerRGbGGsYUWroU2";

/* (Opcional) E-mail do organizador — usado como segunda verificação no
   admin.html. As regras de segurança do Firestore usam SEMPRE o UID. */
const ADMIN_EMAIL = "awardswgs@gmail.com";

/* --------------------------------------------------------------------------
   3) 👇 DADOS DO EVENTO (aparecem na tela inicial, cerimônia e resultados)
   -------------------------------------------------------------------------- */
const EVENTO = {
  nome: "WGS GRAMMY",                          // Nome do evento (aparece gigante no topo)
  ano: 2026,
  turma: "Grande Gala do Terceirão",           // Aparece no selo acima do título
  subtitulo: "A noite mais esperada do Terceirão chegou. Os indicados estão prontos — agora é a sua vez de decidir quem leva o troféu para casa.",
  sessao: "Sexta-feira • 19h00 • Ao Vivo",     // Aparece no cartão de cerimônia ao vivo na tela inicial
  totalAlunos: 100                             // Usado para calcular a % de participação no painel
};

/* Não mexa daqui pra baixo ------------------------------------------------- */
window.GALA_CONFIG = { firebaseConfig, ADMIN_UID, ADMIN_EMAIL, evento: EVENTO };
