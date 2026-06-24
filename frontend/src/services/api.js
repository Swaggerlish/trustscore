export async function submitAssessment(data){
 return fetch('http://localhost:8000/assessment/score',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify(data)
 }).then(res=>res.json());
}
