/* ================= CONFIG ================= */
const USE_EMAILJS   = true;  // switch to false if you use Twilio/SendGrid
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';

// Twilio credentials (only used if USE_EMAILJS=false)
const TWILIO_SID   = '';
const TWILIO_TOKEN = '';
const TWILIO_FROM  = '';
const TWILIO_TO    = '';

// SendGrid (only used if USE_EMAILJS=false)
const SENDGRID_KEY = '';

/* ========================================== */

const statusEl = document.getElementById('status');
const silentBtn = document.getElementById('silentBtn');

if (USE_EMAILJS) emailjs.init(EMAILJS_PUBLIC_KEY);

// Geolocation cache
let lastPos = null;
navigator.geolocation.watchPosition(
  pos => lastPos = pos,
  err => console.warn('GPS error', err),
  { enableHighAccuracy: true }
);

// Speech recognition
const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!Speech) {
  statusEl.textContent = '❌ Web Speech API not supported';
} else {
  const rec = new Speech();
  rec.lang = 'en-US';
  rec.interimResults = false;
  rec.continuous = true;
  rec.onresult = e => {
    const transcript = e.results[e.results.length - 1][0].transcript.trim();
    if (/help me/i.test(transcript)) triggerEmergency();
  };
  rec.onerror = e => statusEl.textContent = '⚠️ ' + e.error;
  rec.start();
  statusEl.textContent = '🎤 Listening for “Help me”…';
}

silentBtn.onclick = () => triggerEmergency();

async function triggerEmergency() {
  statusEl.textContent = '🚨 Emergency triggered — recording…';
  const { base64 } = await record10s();
  const loc = lastPos
    ? `https://maps.google.com/?q=${lastPos.coords.latitude},${lastPos.coords.longitude}`
    : 'Location unavailable';

  const msg = `Emergency alert!\nLocation: ${loc}\nVideo attached.`;

  if (USE_EMAILJS) {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      message: msg,
      videoBase64: base64
    });
  } else {
    // Twilio SMS with Media URL (requires upload step – omitted for brevity)
    // or SendGrid with attachment
  }
  statusEl.textContent = '✅ Alert sent!';
  setTimeout(() => statusEl.textContent = '🎤 Listening…', 4000);
}
