import assert from 'node:assert/strict';
import {describe,it} from 'node:test';
import {example,feedbackSchema,boxSchema} from '../lib/review.ts';
import {normalizeFeedback} from '../lib/validation.ts';
describe('student-facing feedback boundaries',()=>{
 it('preserves evidence-backed feedback',()=>{const r=normalizeFeedback(structuredClone(example.feedback),example.ocr);assert.equal(r.cards.length,2)});
 it('defers low-confidence spelling to teacher',()=>{const ocr=structuredClone(example.ocr);ocr.lines.find(l=>l.id==='l9')!.confidence=.9;const r=normalizeFeedback(structuredClone(example.feedback),ocr);assert.equal(r.cards.filter(c=>c.kind==='spelling').length,0);assert.ok(r.teacherNotes.some(n=>n.includes('보류')))});
 it('rejects invented quotations and unknown line IDs',()=>{const f=structuredClone(example.feedback);f.cards[0].quote='학생이 쓰지 않은 문장';f.cards[1].lineIds=['invented'];assert.equal(normalizeFeedback(f,example.ocr).cards.length,0)});
 it('caps content at one and spelling at three',()=>{const f=structuredClone(example.feedback);f.cards=[...Array.from({length:3},(_,i)=>({...f.cards[0],id:'c'+i})),...Array.from({length:5},(_,i)=>({...f.cards[1],id:'s'+i}))];const r=normalizeFeedback(f,example.ocr);assert.equal(r.cards.filter(c=>c.kind==='content').length,1);assert.equal(r.cards.filter(c=>c.kind==='spelling').length,3)});
 it('does not send subjective teacher notes as student correction cards',()=>{const f=structuredClone(example.feedback);f.cards=[{...f.cards[0],kind:'teacher',instruction:'이유의 타당성을 선생님과 확인'}];const r=normalizeFeedback(f,example.ocr);assert.equal(r.cards.length,0);assert.ok(r.teacherNotes.includes('이유의 타당성을 선생님과 확인'))});
 it('allows no correction for a sufficient draft',()=>{const f=structuredClone(example.feedback);f.cards=[];assert.equal(normalizeFeedback(f,example.ocr).cards.length,0)});
 it('rejects boxes outside the image and malformed results',()=>{assert.equal(boxSchema.safeParse({x:.9,y:0,w:.3,h:.1}).success,false);assert.equal(feedbackSchema.safeParse({criteria:[],cards:[]}).success,false)});
});
