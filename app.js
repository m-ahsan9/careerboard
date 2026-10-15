import {STAGES,validateJob,parseBackup,filterJobs,getStats} from './domain.js';
const $ = selector => document.querySelector(selector);
const KEY = 'careerboard.v1';
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const seed = [['Orbit Studio','Frontend Developer','Remote','Interview','Portfolio discussion with the engineering team.'],['Northstar','Software Engineer','Lahore, Pakistan','Applied','Application submitted. Follow up next week.'],['Bloom Labs','UI Developer','Remote','Saved','Interesting product team. Tailor portfolio before applying.'],['Forma','Junior Web Developer','Karachi, Pakistan','Offer','Review the offer and prepare questions.'],['Layers','React Developer','Islamabad, Pakistan','Applied','Shared GitHub profile and personal projects.'],['Atlas Digital','Frontend Intern','Remote','Closed','Keep in touch for future opportunities.']].map(([company,role,location,stage,notes]) => ({id:crypto.randomUUID(),company,role,location,stage,notes,date:today()}));
let state = {jobs:seed,demo:true};
let storageBlocked = false;
try { const saved = localStorage.getItem(KEY); if (saved) { const data = JSON.parse(saved); state = {jobs:parseBackup(saved),demo:data.demo === true}; } } catch { storageBlocked = true; }
let toastTimer;
function notify(message) { $('#toast').textContent = message; $('#toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').hidden = true,4500); }
function commit(jobs, demo = false) {
  try { localStorage.setItem(KEY,JSON.stringify({version:1,jobs,demo})); }
  catch { notify('Could not save. Your changes were not applied. Export a backup and check browser storage.'); return false; }
  state = {jobs,demo}; storageBlocked = false; render(); return true;
}
function node(tag, className, text) { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
function edit(job) {
  $('#form').reset(); $('#error').textContent = ''; $('#title').textContent = job ? 'Edit application' : 'Add application';
  const values = job || {id:'',company:'',role:'',location:'',stage:'Saved',date:today(),notes:''};
  for (const [key,value] of Object.entries(values)) $('#form').elements.namedItem(key).value = value;
  $('#editor').showModal();
}
let confirmedAction;
function confirmAction(title,message,action) { $('#confirm-title').textContent = title; $('#confirm-message').textContent = message; confirmedAction = action; $('#confirmation').showModal(); }
function render() {
  $('#demo').hidden = !state.demo;
  const stats = getStats(state.jobs);
  $('#stats').replaceChildren(...[['Total applications',stats.total,'Every opportunity counts','↗'],['In progress',stats.active,'Applications moving forward','◷'],['Interviews',stats.interviews,'Conversations worth having','☷'],['Offers received',stats.offers,'Your hard work, recognized','✧']].map(([label,value,description,icon]) => { const box = node('div','stat'); const top = node('div','stat-top',label); top.append(node('span','stat-icon',icon)); box.append(top,node('div','stat-value',value),node('small','',description)); return box; }));
  $('#count').textContent = state.jobs.length;
  $('#tabs').replaceChildren(...['All',...STAGES].map(stage => { const button = node('button',`tab${$('#stage').value === stage ? ' active' : ''}`,stage === 'All' ? 'All applications' : stage); button.type = 'button'; button.setAttribute('aria-pressed',String($('#stage').value === stage)); button.append(node('span','',stage === 'All' ? state.jobs.length : state.jobs.filter(j => j.stage === stage).length)); button.onclick = () => { $('#stage').value = stage; render(); }; return button; }));
  const visible = filterJobs(state.jobs,$('#search').value,$('#stage').value,$('#sort').value);
  $('#jobs').replaceChildren(...visible.map(job => {
    const card = node('article','card'); const top = node('div','card-top'); const company = node('div'); company.append(node('div','company',job.company),node('div','location',job.location || 'Location not specified')); top.append(node('div','logo',job.company.slice(0,2).toUpperCase()),company);
    const foot = node('div','card-footer'); const date = node('time','',new Date(`${job.date}T12:00:00`).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})); date.dateTime = job.date;
    const buttons = node('div'); const editButton = node('button','','Edit ↗'); editButton.setAttribute('aria-label',`Edit ${job.role} at ${job.company}`); editButton.onclick = () => edit(job); const remove = node('button','','Delete'); remove.setAttribute('aria-label',`Delete ${job.role} at ${job.company}`); remove.onclick = () => confirmAction('Delete application?',`Remove ${job.role} at ${job.company}? This cannot be undone.`,() => { if (commit(state.jobs.filter(j => j.id !== job.id),state.demo)) notify('Application deleted.'); }); buttons.append(editButton,remove); foot.append(date,buttons);
    card.append(top,node('h3','',job.role),node('span',`badge ${job.stage}`,job.stage),node('p','card-notes',job.notes || 'A new possibility. Add notes as you go.'),foot); return card;
  }));
  $('#empty').hidden = visible.length !== 0; $('#results').textContent = `Showing ${visible.length} of ${state.jobs.length} applications`;
}
for (const stage of STAGES) { $('#stage').append(new Option(stage,stage)); $('#form-stage').append(new Option(stage,stage)); }
$('#add').onclick = () => edit();
$('#close').onclick = $('#cancel').onclick = () => $('#editor').close();
$('#form').onsubmit = event => { event.preventDefault(); try { const job = validateJob(Object.fromEntries(new FormData($('#form')))); const jobs = state.jobs.some(j => j.id === job.id) ? state.jobs.map(j => j.id === job.id ? job : j) : [...state.jobs,job]; if (jobs.length > 2000) throw new Error('Workspace limit: 2,000 applications.'); if (commit(jobs,state.demo)) { $('#editor').close(); notify('Application saved.'); } } catch(error) { $('#error').textContent = error.message; } };
$('#search').oninput = render; $('#stage').onchange = render; $('#sort').onchange = render;
$('#no').onclick = () => $('#confirmation').close(); $('#yes').onclick = () => { $('#confirmation').close(); confirmedAction?.(); confirmedAction = null; };
$('#fresh').onclick = () => confirmAction('Start your own workspace?','This removes the sample applications and any edits to them. Export first if you want to keep them.',() => { if (commit([])) notify('Your workspace is ready. Add your first opportunity.'); });
$('#export').onclick = () => { const url = URL.createObjectURL(new Blob([JSON.stringify({version:1,jobs:state.jobs},null,2)],{type:'application/json'})); const link = node('a'); link.href = url; link.download = `careerboard-${today()}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000); notify('Backup exported.'); };
$('#import').onclick = () => $('#file').click();
$('#file').onchange = async () => { const file = $('#file').files[0]; if (!file) return; try { if (file.size > 6000000) throw new Error('Backup must be smaller than 6 MB.'); const jobs = parseBackup(await file.text()); confirmAction('Replace workspace?',`Import ${jobs.length} applications? This replaces all current applications. Export first if needed.`,() => { if (commit(jobs)) notify('Backup imported.'); }); } catch(error) { notify(`Import failed: ${error.message}`); } finally { $('#file').value = ''; } };
window.addEventListener('storage',event => { if (event.key === KEY) { try { if (!event.newValue) { state = {jobs:[],demo:false}; } else { const data = JSON.parse(event.newValue); state = {jobs:parseBackup(event.newValue),demo:data.demo === true}; } render(); notify('Workspace updated from another tab.'); } catch { notify('Another tab saved invalid data. Reload after checking your backup.'); } } });
render();
if (storageBlocked) notify('Saved data could not be read. Export any visible data before making changes.');
