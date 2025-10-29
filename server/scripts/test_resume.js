// scripts/test_resume.js
// Creates demo achievements, validates them, then requests a mock resume

const jwt = require('jsonwebtoken');
const fetch = global.fetch || require('node-fetch');

const SERVER = 'http://localhost:3000';

async function main(){
  try{
    const adminToken = jwt.sign({username:'local-admin', role:'admin'}, process.env.DUMMY_TOKEN || 'supersecrettokenforauth');
    console.log('adminToken=', adminToken);

    const achievements = [
      {
        studentName: 'Test Student', rollNumber: 'TEST123', achievementTitle: 'Awesome Project', achievementDescription: 'Built a React app using Node and Docker', category: 'project', level: 'college', achievementDate: '2025-10-01', issuingAuthority: 'CS Dept', evidenceLink: 'https://example.com'
      },
      {
        studentName: 'Test Student', rollNumber: 'TEST123', achievementTitle: 'Research Paper', achievementDescription: 'Published paper on ML using Python and TensorFlow', category: 'research', level: 'national', achievementDate: '2024-05-20', issuingAuthority: 'ACM', evidenceLink: 'https://example.org'
      },
      {
        studentName: 'Test Student', rollNumber: 'TEST123', achievementTitle: 'Internship at Acme', achievementDescription: 'Worked on backend services using Node and AWS', category: 'internship', level: 'national', achievementDate: '2023-08-15', issuingAuthority: 'Acme Corp', evidenceLink: 'https://acme.example'
      }
    ];

    const createdIds = [];
    for(const a of achievements){
      const res = await fetch(SERVER + '/api/achievements/log', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(a)});
      const body = await res.json();
      console.log('create status', res.status, body.message || body);
      if (res.ok && body.achievement && body.achievement.id){
        createdIds.push(body.achievement.id);
      } else if (res.ok && body.achievementId){
        createdIds.push(body.achievementId);
      } else {
        // if server returned created resource differently, try to query by rollNumber later
      }
    }

    // If createdIds empty, attempt to fetch pending and collect ids
    if(createdIds.length === 0){
      const res2 = await fetch(SERVER + '/api/achievements/pending', {headers:{'Authorization':'Bearer ' + adminToken}});
      const list = await res2.json();
      console.log('pending count', list.length);
      for(const it of list){ if (it.rollNumber === 'TEST123') createdIds.push(it.id); }
    }

    console.log('to validate ids=', createdIds);
    for(const id of createdIds){
      const r = await fetch(SERVER + `/api/achievements/${id}/validate`, {method:'PUT', headers:{'Content-Type':'application/json','Authorization':'Bearer ' + adminToken}, body: JSON.stringify({status:'validated'})});
      console.log('validate', id, '=>', r.status);
    }

    // Now request resume (mock mode)
    const res = await fetch(SERVER + '/api/resume/generate?mock=true', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer ' + adminToken}, body: JSON.stringify({rollNumber:'TEST123'})});
    const text = await res.text();
    console.log('\n--- GENERATED RESUME (mock) ---\n');
    console.log(text);

  }catch(err){
    console.error('Error in script', err);
  }
}

main();
