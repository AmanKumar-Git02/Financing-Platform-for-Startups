const startups=[
  {id:1,name:"PayWave",industry:"FinTech",stage:"Early",region:"India",fundingNeed:20000,risk:"Medium",quality:0.86,verified:true,raised:18000},
  {id:2,name:"MediAI",industry:"HealthTech",stage:"Growth",region:"USA",fundingNeed:60000,risk:"Low",quality:0.9,verified:true,raised:52000},
  {id:3,name:"GreenPulse",industry:"GreenTech",stage:"Early",region:"EU",fundingNeed:30000,risk:"Medium",quality:0.78,verified:false,raised:12000},
  {id:4,name:"TutorHive",industry:"EdTech",stage:"Idea",region:"India",fundingNeed:10000,risk:"High",quality:0.72,verified:false,raised:3000},
  {id:5,name:"VisionML",industry:"AI/ML",stage:"Early",region:"USA",fundingNeed:25000,risk:"Medium",quality:0.88,verified:true,raised:19000},
  {id:6,name:"AgroGrid",industry:"GreenTech",stage:"Growth",region:"India",fundingNeed:55000,risk:"Low",quality:0.84,verified:true,raised:40000},
  {id:7,name:"CareLink",industry:"HealthTech",stage:"Early",region:"EU",fundingNeed:18000,risk:"Medium",quality:0.76,verified:false,raised:15000},
  {id:8,name:"ByteLearn",industry:"EdTech",stage:"Growth",region:"SEA",fundingNeed:45000,risk:"Low",quality:0.83,verified:true,raised:33000},
  {id:9,name:"NanoPay",industry:"FinTech",stage:"Idea",region:"EU",fundingNeed:8000,risk:"High",quality:0.69,verified:false,raised:2000},
  {id:10,name:"FarmSight",industry:"AI/ML",stage:"Early",region:"India",fundingNeed:22000,risk:"Medium",quality:0.8,verified:true,raised:16000}
];

const investors=[
  {id:1,name:"Aman Kumar",industries:["FinTech","AI/ML"],budget:30000,region:"India",risk:"Medium",activity:0.7},
  {id:2,name:"Amulya V Singh",industries:["HealthTech","EdTech"],budget:20000,region:"India",risk:"Low",activity:0.55}
];

function scoreMatch(startup,prefs){
  let s=0,w={industry:.4,budget:.25,stage:.2,region:.1,risk:.05};
  if(prefs.industry==='any'||startup.industry===prefs.industry) s+=w.industry;
  if(!isNaN(prefs.budget)&&prefs.budget>0){
    const diff=Math.max(0,1-Math.abs(prefs.budget-startup.fundingNeed)/Math.max(prefs.budget,startup.fundingNeed));
    s+=diff*w.budget;
  }else s+=.6*w.budget;
  if(prefs.stage==='any'||startup.stage===prefs.stage) s+=w.stage;
  if(prefs.region==='any'||startup.region===prefs.region) s+=w.region;
  if(prefs.risk==='any'||startup.risk===prefs.risk) s+=w.risk;
  s = s*(0.85+0.15*startup.quality);
  if(startup.verified) s+=0.03;
  return Math.min(1,Number(s.toFixed(4)));
}

function readPrefs(){
  return {
    industry:document.getElementById('prefIndustry').value,
    budget:parseInt(document.getElementById('prefBudget').value,10),
    stage:document.getElementById('prefStage').value,
    risk:document.getElementById('prefRisk').value,
    region:document.getElementById('prefRegion').value
  };
}

function renderStartupCard(s,score){
  const div=document.createElement('div');
  div.className='card';
  const badgeV=s.verified?'<span class="badge good">Verified</span>':'';
  const badgeR=s.quality>=0.82?'<span class="badge warn">Rising</span>':'';
  const pill=`<span class="pill">${s.industry}</span>`;
  const sc=score!=null?`<div class="tag">Match Score: ${(score*100).toFixed(0)}%</div>`:'';
  div.innerHTML=`<div class="row">${pill} ${badgeV} ${badgeR}</div>
    <h3 style="margin:8px 0 4px">${s.name}</h3>
    <div class="muted" style="font-size:14px">Stage: ${s.stage} • Region: ${s.region} • Need: $${s.fundingNeed.toLocaleString()}</div>
    <div class="row" style="margin-top:8px">${sc}<span class="tag">Quality ${(s.quality*100).toFixed(0)}%</span><span class="tag">Raised $${s.raised.toLocaleString()}</span></div>
    <div class="row" style="margin-top:10px"><button>View</button><button style="background:var(--good)">Fund</button></div>`;
  return div;
}

function renderAll(){
  document.getElementById('kpiStartups').textContent=startups.length;
  document.getElementById('kpiInvestors').textContent=investors.length;
  document.getElementById('kpiRaised').textContent='$'+startups.reduce((a,b)=>a+b.raised,0).toLocaleString();
  const list=document.getElementById('allStartups');list.innerHTML='';
  startups.forEach(s=>list.appendChild(renderStartupCard(s)));
  const lb=document.getElementById('leaderboard');lb.innerHTML='';
  startups.slice().sort((a,b)=>b.raised-a.raised).forEach((s,i)=>{
    const li=document.createElement('li');
    li.innerHTML=`<span>#${i+1} • ${s.name} <span class="pill">${s.industry}</span></span><span class="muted">$${s.raised.toLocaleString()}</span>`;
    lb.appendChild(li);
  });
}

function recommend(){
  const prefs=readPrefs();
  const scored=startups.map(s=>({s,score:scoreMatch(s,prefs)})).sort((a,b)=>b.score-a.score);
  const top=scored.slice(0,6);
  const avg=top.reduce((a,b)=>a+b.score,0)/Math.max(1,top.length);
  document.getElementById('kpiScore').textContent= top.length? (avg*100).toFixed(0)+'%':'–';
  const box=document.getElementById('recommendations');box.innerHTML='';
  top.forEach(({s,score})=>box.appendChild(renderStartupCard(s,score)));
}

document.getElementById('btnRecommend').addEventListener('click',recommend);
document.getElementById('btnReset').addEventListener('click',()=>{
  document.getElementById('prefIndustry').value='any';
  document.getElementById('prefBudget').value='';
  document.getElementById('prefStage').value='any';
  document.getElementById('prefRisk').value='any';
  document.getElementById('prefRegion').value='any';
  document.getElementById('kpiScore').textContent='–';
  document.getElementById('recommendations').innerHTML='';
});

renderAll();