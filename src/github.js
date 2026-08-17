export function assertGithubEnv(env) {
  for (const key of ["GITHUB_TOKEN", "GITHUB_OWNER", "GITHUB_REPO", "GITHUB_BRANCH"]) {
    if (!env[key]) throw new Error(`Missing env ${key}`);
  }
}

export async function commitFiles(env, files, message) {
  assertGithubEnv(env);
  const branch = await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/ref/heads/${env.GITHUB_BRANCH}`);
  const baseSha = branch.object.sha;
  const baseCommit = await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits/${baseSha}`);
  const tree = await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({
      base_tree: baseCommit.tree.sha,
      tree: files.map((file) => ({
        path: file.path,
        mode: "100644",
        type: "blob",
        content: file.content
      }))
    })
  });

  const commit = await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: tree.sha, parents: [baseSha] })
  });

  await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/git/refs/heads/${env.GITHUB_BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha })
  });

  return {
    sha: commit.sha,
    html_url: `https://github.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/commit/${commit.sha}`
  };
}

export async function getPages(env) {
  try {
    return await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/pages`);
  } catch (error) {
    return null;
  }
}

export async function getPagesUrl(env) {
  const pages = await getPages(env);
  return pages?.html_url || null;
}

export async function getLatestPagesBuild(env) {
  try {
    return await githubJson(env, `/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/pages/builds/latest`);
  } catch (error) {
    return null;
  }
}

export async function getPagesBuildStatus(env, commitSha) {
  assertGithubEnv(env);
  const [pages, latestBuild] = await Promise.all([getPages(env), getLatestPagesBuild(env)]);
  const buildCommitSha = latestBuild ? pagesBuildCommitSha(latestBuild) : null;
  const status = latestBuild?.status || "unknown";
  const matchesCommit = buildCommitSha === commitSha;
  return {
    pages_url: pages?.html_url || null,
    latest_build: latestBuild ? {
      status,
      error: latestBuild.error || null,
      commit_sha: buildCommitSha,
      commit_url: buildCommitSha ? `https://github.com/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/commit/${buildCommitSha}` : null,
      matches_commit: matchesCommit,
      updated_at: latestBuild.updated_at,
      url: latestBuild.url
    } : null,
    deploy_status: matchesCommit ? pagesDeployStatus(status) : "waiting",
    deploy_error: latestBuild?.error ? JSON.stringify(latestBuild.error) : null
  };
}

async function githubJson(env, path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "cms-admin-worker",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub API failed ${path}: ${detail}`);
  }

  return response.json();
}

function pagesBuildCommitSha(build) {
  if (!build?.commit) return null;
  if (typeof build.commit === "string") return build.commit;
  return build.commit.sha || build.commit.id || null;
}

function pagesDeployStatus(status) {
  if (status === "built") return "built";
  if (status === "errored") return "failed";
  if (status === "building") return "building";
  if (status === "queued") return "queued";
  return status || "unknown";
}
