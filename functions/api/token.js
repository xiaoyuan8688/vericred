/**
 * 返回 GitHub Personal Access Token (PAT)
 * 用于 Decap CMS 自动认证，免去 GitHub OAuth 登录
 *
 * 环境变量 (Cloudflare Pages Dashboard → Settings → Environment variables):
 *   GITHUB_PAT = GitHub Personal Access Token（需有 repo 读写权限）
 *
 * 安全说明：
 *   - 本接口仅返回 PAT，不校验请求来源
 *   - 建议将 /admin 路由通过 Cloudflare Access 或 WAF 保护
 *   - 若担心 PAT 泄露，可使用 Cloudflare Workers 的加密变量
 */

export async function onRequest({ env }) {
  const token = env.GITHUB_PAT;

  if (!token) {
    return new Response(
      JSON.stringify({
        error: 'GITHUB_PAT 未配置',
        hint: '请在 Cloudflare Pages Dashboard → Settings → Environment variables 中设置 GITHUB_PAT',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      },
    );
  }

  return new Response(JSON.stringify({ token }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}