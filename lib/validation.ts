import { criterionNames, type Feedback,type Ocr } from './review.ts';
export function normalizeFeedback(feedback:Feedback,ocr:Ocr):Feedback{
 const byId=new Map(ocr.lines.map(l=>[l.id,l]));let content=0;const teacherNotes=[...feedback.teacherNotes];const ids=new Set<string>();
 const uncertainText=ocr.lines.some(l=>l.confidence<.85);
 const cards=feedback.cards.filter(c=>{if(ids.has(c.id))return false;ids.add(c.id);if(c.kind==='teacher'){teacherNotes.push(c.instruction);return false;}const lines=c.lineIds.map(id=>byId.get(id));if(lines.some(l=>!l)||lines.some(l=>l!.confidence<(c.kind==='spelling'?.95:.85))){teacherNotes.push('인식이 불확실하여 피드백을 보류: '+c.title);return false;}const canonical=(s:string)=>s.replace(/\s/g,'');if(c.quote&&(!lines.length||!canonical(lines.map(l=>l!.text).join(' ')).includes(canonical(c.quote)))){teacherNotes.push('인용문과 인식 원문이 달라 보류: '+c.title);return false;}if(c.kind==='spelling'){if(!c.quote||!lines.length||!c.correction)return false;}else{c.correction=null;if(++content>1)return false;}return true;});
 const criteria=criterionNames.map(name=>{const item=feedback.criteria.find(c=>c.name===name);if(!item)return {name,status:'teacher' as const,evidenceIds:[]};const evidence=item.evidenceIds.filter(id=>byId.has(id));const uncertain=evidence.some(id=>byId.get(id)!.confidence<.85);return {...item,evidenceIds:evidence,status:uncertain||item.status==='found'&&!evidence.length||item.status==='missing'&&uncertainText?'teacher' as const:item.status};});
 if(uncertainText){for(let i=cards.length-1;i>=0;i--)if(cards[i].kind==='content'&&!cards[i].lineIds.length){teacherNotes.push('읽지 못한 부분에 내용이 있을 수 있어 누락 판단을 보류했습니다.');cards.splice(i,1);}}
 return {criteria,cards,teacherNotes:[...new Set(teacherNotes)].slice(0,8)};
}
