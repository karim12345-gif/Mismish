import type { Request, Response } from "express";

const buildResetPasswordPage = (
  token: string,
  logoUrl: string,
  apiBase: string,
): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Password — Mismish</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #FFF8F5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 4px 32px rgba(255,127,80,0.12);
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
    }
    .logo { display: block; height: 40px; margin: 0 auto 32px; }
    h1 { font-size: 22px; font-weight: 700; color: #1a1a1a; text-align: center; margin-bottom: 8px; }
    p.sub { font-size: 14px; color: #888; text-align: center; margin-bottom: 32px; }
    label { display: block; font-size: 13px; font-weight: 600; color: #444; margin-bottom: 6px; }
    input[type=password] {
      width: 100%;
      padding: 12px 16px;
      border: 1.5px solid #e5e5e5;
      border-radius: 10px;
      font-size: 15px;
      outline: none;
      transition: border-color .15s;
      margin-bottom: 20px;
    }
    input[type=password]:focus { border-color: #FF7F50; }
    button {
      width: 100%;
      padding: 14px;
      background: #FF7F50;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity .15s;
    }
    button:disabled { opacity: .6; cursor: not-allowed; }
    .msg {
      margin-top: 20px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 14px;
      text-align: center;
      display: none;
    }
    .msg.error { background: #FFF0ED; color: #c0392b; display: block; }
    .msg.success { background: #F0FFF4; color: #27ae60; display: block; }
    .msg.invalid { background: #FFF0ED; color: #c0392b; display: block; }
  </style>
</head>
<body>
  <div class="card">
    <img src="${logoUrl}" alt="Mismish" class="logo" onerror="this.style.display='none'" />
    ${
      !token
        ? `<h1>Invalid Link</h1>
           <p class="sub">This reset link is missing a token. Please request a new one.</p>`
        : `<h1>Set new password</h1>
           <p class="sub">Choose a strong password for your merchant account.</p>
           <form id="form">
             <label for="pw">New password</label>
             <input type="password" id="pw" placeholder="At least 8 characters" required minlength="8" />
             <label for="pw2">Confirm password</label>
             <input type="password" id="pw2" placeholder="Repeat password" required minlength="8" />
             <button type="submit" id="btn">Reset Password</button>
           </form>
           <div id="msg" class="msg"></div>
           <script>
             document.getElementById('form').addEventListener('submit', async function(e) {
               e.preventDefault();
               var pw = document.getElementById('pw').value;
               var pw2 = document.getElementById('pw2').value;
               var msg = document.getElementById('msg');
               var btn = document.getElementById('btn');
               msg.className = 'msg'; msg.textContent = '';
               if (pw !== pw2) {
                 msg.className = 'msg error'; msg.textContent = 'Passwords do not match.'; return;
               }
               btn.disabled = true; btn.textContent = 'Resetting…';
               try {
                 var res = await fetch('${apiBase}/api/auth/v1/vendor/reset-password', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ token: '${token}', newPassword: pw })
                 });
                 var data = await res.json();
                 if (res.ok) {
                   document.getElementById('form').style.display = 'none';
                   msg.className = 'msg success';
                   msg.textContent = 'Password reset! You can now log in to the Mismish merchant app.';
                 } else {
                   msg.className = 'msg error';
                   msg.textContent = data.message || 'Something went wrong. Please try again.';
                   btn.disabled = false; btn.textContent = 'Reset Password';
                 }
               } catch(_) {
                 msg.className = 'msg error'; msg.textContent = 'Network error. Please try again.';
                 btn.disabled = false; btn.textContent = 'Reset Password';
               }
             });
           </script>`
    }
  </div>
</body>
</html>`;

export const renderResetPasswordPage = (
  req: Request,
  res: Response,
): void => {
  const token = String(req.query.token ?? "");
  const dashboardUrl = process.env.DASHBOARD_URL ?? "";

  res.setHeader("Content-Type", "text/html");
  res.send(
    buildResetPasswordPage(
      token,
      `${dashboardUrl}/logo.png`,
      dashboardUrl,
    ),
  );
};
