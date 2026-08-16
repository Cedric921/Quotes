import { route } from "@/server/http/route";

// Simple page the Stripe Checkout WebView lands on (mobile checkout).
const HTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Paiement annulé</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .card { background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 400px; }
            .icon { font-size: 60px; margin-bottom: 20px; }
            h1 { color: #ef4444; margin: 0 0 10px; }
            p { color: #666; margin: 0 0 20px; }
            .btn { background: #667eea; color: white; padding: 15px 30px; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">❌</div>
            <h1>Paiement annulé</h1>
            <p>Vous avez annulé le paiement.<br>Vous pouvez fermer cette page et réessayer.</p>
            <button class="btn" onclick="window.close()">Fermer</button>
          </div>
        </body>
      </html>
    `;

export const GET = route(
  { auth: "public" },
  async () => new Response(HTML, { headers: { "content-type": "text/html; charset=utf-8" } }),
);
