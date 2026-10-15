export const STAGES = ['Saved', 'Applied', 'Interview', 'Offer', 'Closed'];
export function validateJob(value) {
  if (!value || typeof value !== 'object') throw new Error('Invalid application.');
  const job = {};
  for (const key of ['company', 'role', 'location', 'notes', 'date', 'stage']) {
    if (typeof value[key] !== 'string') throw new Error(`Missing or invalid ${key}.`);
    job[key] = value[key].trim();
  }
  if (!job.company || !job.role || job.company.length > 100 || job.role.length > 120) throw new Error('Enter a company and job title within the character limits.');
  if (!STAGES.includes(job.stage)) throw new Error('Invalid application stage.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(job.date) || Number.isNaN(Date.parse(job.date)) || new Date(job.date).toISOString().slice(0,10) !== job.date) throw new Error('Choose a valid date.');
  if (job.location.length > 120 || job.notes.length > 2000) throw new Error('Location or notes are too long.');
  job.id = typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 100 ? value.id : crypto.randomUUID();
  return job;
}
export function parseBackup(text) {
  const value = JSON.parse(text);
  if (value?.version !== 1 || !Array.isArray(value.jobs) || value.jobs.length > 2000) throw new Error('Choose a CareerBoard v1 backup with at most 2,000 applications.');
  const jobs = value.jobs.map(validateJob);
  if (new Set(jobs.map(j => j.id)).size !== jobs.length) throw new Error('Duplicate application IDs in backup.');
  return jobs;
}
export function filterJobs(jobs, query = '', stage = 'All', sort = 'newest') {
  const term = query.trim().toLowerCase();
  return jobs.filter(j => (stage === 'All' || j.stage === stage) && `${j.company} ${j.role} ${j.location}`.toLowerCase().includes(term)).sort((a,b) => sort === 'company' ? a.company.localeCompare(b.company) : sort === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date));
}
export function getStats(jobs) { return {total: jobs.length, active: jobs.filter(j => ['Applied','Interview'].includes(j.stage)).length, interviews: jobs.filter(j => j.stage === 'Interview').length, offers: jobs.filter(j => j.stage === 'Offer').length}; }
