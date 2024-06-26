import * as z from 'zod';

export const CodeCoverageSchema = z.object({
  github_access_token: z.string(),
  github_username: z.string(),
  github_repo_name: z.string(),
  project_type: z.enum(['java', 'python']),
  projectId: z.string(),
});
