import { z } from 'zod';
export const criterionNames = ['제목','책 소개','줄거리','인상적인 부분과 까닭','책에 대한 평가'] as const;
export const boxSchema=z.object({x:z.number().min(0).max(1),y:z.number().min(0).max(1),w:z.number().positive().max(1),h:z.number().positive().max(1)}).refine(b=>b.x+b.w<=1.01&&b.y+b.h<=1.01);
export const lineSchema=z.object({id:z.string().max(40),page:z.number().int().min(0).max(3),text:z.string().max(1500),confidence:z.number().min(0).max(1),box:boxSchema.nullable()});
export const ocrSchema=z.object({quality:z.enum(['clear','photo','handwriting','uncertain']),unreadableRatio:z.number().min(0).max(1),lines:z.array(lineSchema).max(180)});
export const feedbackSchema=z.object({criteria:z.array(z.object({name:z.enum(criterionNames),status:z.enum(['found','missing','teacher']),evidenceIds:z.array(z.string()).max(8)})).length(5),cards:z.array(z.object({id:z.string().max(40),kind:z.enum(['content','spelling','teacher']),title:z.string().max(80),quote:z.string().max(350),instruction:z.string().max(450),lineIds:z.array(z.string()).max(5),correction:z.string().max(150).nullable()})).max(7),teacherNotes:z.array(z.string().max(300)).max(6)});
export type Ocr=z.infer<typeof ocrSchema>;
export type Feedback=z.infer<typeof feedbackSchema>;
export type Card=Feedback['cards'][number];
export type ReviewResult={id:string;status:'ready'|'retake';pages:string[];ocr:Ocr;feedback:Feedback;studentNumber?:number;createdAt?:number;handoff?:string;doneIds?:string[];teacherComment?:string};
export const qualityMessages={clear:'',photo:'사진이 흐리거나 어두워 글을 읽기 어려워요. 종이를 평평하게 펴고 밝은 곳에서 글 전체가 보이게 다시 찍어주세요.',handwriting:'읽기 어려운 글자가 많아요. 글자 사이를 조금 띄우고, 글자의 모양이 보이도록 또박또박 써주세요. 어려운 부분은 선생님과 함께 읽어도 좋아요.',uncertain:'몇몇 글자를 확실히 읽지 못했어요. 글씨가 잘 보이도록 가까이 다시 찍거나 선생님께 도움을 요청해주세요.'};
export const example:ReviewResult={id:'example',status:'ready',pages:['/example.svg'],ocr:{quality:'clear',unreadableRatio:0,lines:[
{id:'l1',page:0,text:'함께 지킨 작은 생명',confidence:1,box:{x:.15,y:.12,w:.63,h:.035}},
{id:'l2',page:0,text:'『호랑이를 부탁해』는 달걀을 부화시키는',confidence:1,box:{x:.12,y:.24,w:.76,h:.025}},
{id:'l3',page:0,text:'아이들의 이야기를 담은 동화이다.',confidence:1,box:{x:.12,y:.285,w:.68,h:.025}},
{id:'l4',page:0,text:'아이들은 깨진 달걀을 발견하고 슬퍼한다.',confidence:1,box:{x:.12,y:.375,w:.76,h:.025}},
{id:'l5',page:0,text:'함께 남은 달걀을 지켜 병아리를 부화시킨다.',confidence:1,box:{x:.12,y:.42,w:.79,h:.025}},
{id:'l6',page:0,text:'아이들이 서로 용서하는 장면이 감동적이었다.',confidence:1,box:{x:.12,y:.51,w:.80,h:.025}},
{id:'l7',page:0,text:'이 책은 친구의 마음을 생각하게 해 준다.',confidence:1,box:{x:.12,y:.60,w:.77,h:.025}},
{id:'l8',page:0,text:'나는 친구들과 함께 이 책을 읽고 싶다.',confidence:1,box:{x:.12,y:.645,w:.76,h:.025}},
{id:'l9',page:0,text:'나도 친구에게 먼저 사과해도 됄 것 같다.',confidence:1,box:{x:.12,y:.69,w:.77,h:.025}}]},feedback:{criteria:criterionNames.map(name=>({name,status:name==='인상적인 부분과 까닭'?'missing':'found',evidenceIds:[]})),cards:[
{id:'c1',kind:'content',title:'마음에 남은 까닭을 보태요',quote:'아이들이 서로 용서하는 장면이 감동적이었다.',instruction:'어떤 점 때문에 감동했나요? 그 장면이 마음에 남은 까닭을 종이에 한 문장 보태보세요.',lineIds:['l6'],correction:null},
{id:'c2',kind:'spelling',title:'이 글자의 표기를 살펴봐요',quote:'나도 친구에게 먼저 사과해도 됄 것 같다.',instruction:'‘됄’은 ‘될’로 고쳐 써요. ‘되다’에 ‘-ㄹ’이 붙으면 ‘될’이 돼요.',lineIds:['l9'],correction:'됄 → 될'}],teacherNotes:['책에 대한 평가와 근거가 잘 연결되는지 선생님과 함께 살펴봐요.']}};
