/**
 * Decap CMS GitHub OAuth 自建代理
 * 部署于 Cloudflare Pages Functions，路径映射：
 *   GET /auth           → 发起 GitHub OAuth 授权
 *   GET /auth/callback  → 接收回调，换 token，通过 postMessage 传回 CMS
 *
 * 环境变量 (Cloudflare Pages Dashboard → Settings → Environment variables):
 *   GITHUB_OAUTH_CLIENT_ID     = GitHub OAuth App 的 Client ID
 *   GITHUB_OAUTH_CLIENT_SECRET = GitHub OAuth App 的 Client Secret
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const route = (context.params.route || '').toLowerCase();

  const CLIENT_ID = env.GITHUB_OAUTH_CLIENT_ID;
  const CLIENT_SECRET = env.GITHUB_OAUTH_CLIENT_SECRET;
  const REDIRECT_URI = `${url.origin}/auth/callback`;

  // ── GET /auth ── 启动 GitHub OAuth 流程
  if (!route) {
    if (!CLIENT_ID) {
      return new Response('OAuth 未配置：请在 Cloudflare 环境变量中设置 GITHUB_OAUTH_CLIENT_ID', { status: 500 });
    }
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      scope: 'repo,user',
      redirect_uri: REDIRECT_URI,
    });
    return Response.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
      302
    );
  }

  // ── GET /auth/callback ── 处理 GitHub 回调，交换 access_token
  if (route === 'callback') {
    const code = url.searchParams.get('code');
    if (!code) {
      return new Response('缺少授权码 (code)', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    try {
      const tokenResp = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
        }),
      });

      const data = await tokenResp.json();

      if (data.error) {
        return new Response(`GitHub OAuth 错误: ${data.error_description || data.error}`, {
          status: 400,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      // 通过 postMessage 将 token 传回 Decap CMS 主窗口
      const payload = JSON.stringify({ token: data.access_token, provider: 'github' });
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>授权成功</title></head>
<body style="text-align:center;margin-top:60px;font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;">
  <p>✅ 授权成功，窗口即将关闭...</p>
  <script>
    (function(){
      var message = 'authorization:github:success:' + ${JSON.stringify(payload)};
      window.opener.postMessage(message, '*');
      setTimeout(function(){ window.close(); }, 500);
    })();
  </script>
</body></html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    } catch (err) {
      return new Response(`Token 交换失败: ${err.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  }

  return new Response('Not Found', { status: 404 });
}
