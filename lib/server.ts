import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export class AppError extends Error{constructor(message:string,public status=400){super(message)}}
export function db(){if(!env.DB)throw new AppError('저장 공간을 준비 중이에요. 선생님께 알려주세요.',503);return env.DB;}
export function bucket(){if(!env.BUCKET)throw new AppError('사진 저장 공간을 준비 중이에요.',503);return env.BUCKET;}
export function response(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function failure(e:unknown){if(e instanceof AppError)return response({error:e.message},e.status);console.error('review_request_failed',e instanceof Error?e.name:'unknown');return response({error:'잠시 처리하지 못했어요. 사진은 이 화면에 남아 있으니 다시 시도해주세요.'},500)}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)throw new AppError('이 화면을 새로 열고 다시 시도해주세요.',403)}
export async function digest(value:string){return Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))).toString('hex')}
export type Classroom={id:number;owner_id:string;name:string;enabled:number;created_at:number};
export async function classroom(){return db().prepare('SELECT * FROM classroom WHERE id=1').first<Classroom>()}
export async function teacher(){const user=await getChatGPTUser();if(!user)throw new AppError('선생님 로그인이 필요해요.',401);const room=await classroom();if(!room||room.owner_id!==user.userId)throw new AppError('이 교실의 선생님 계정으로 로그인해주세요.',403);return {user,room}}
export type StudentSession={id:string;student_number:number;expires_at:number};
export async function student(){const token=(await cookies()).get('review_student')?.value;if(!token)return null;return db().prepare('SELECT id,student_number,expires_at FROM student_sessions WHERE id=? AND expires_at>?').bind(await digest(token),Date.now()).first<StudentSession>()}
export async function requireStudent(){const s=await student();if(!s)throw new AppError('출석번호를 다시 선택해주세요.',401);return s}
export type ReviewRow={id:string;session_id:string;student_number:number;status:string;result_json:string|null;photo_keys:string;created_at:number;handoff:string;done_ids:string;teacher_comment:string};
export async function authorizedReview(id:string){const row=await db().prepare('SELECT * FROM reviews WHERE id=?').bind(id).first<ReviewRow>();if(!row)throw new AppError('글을 찾을 수 없어요.',404);const s=await student();if(s?.id===row.session_id)return row;await teacher();return row}
export function serialize(row:ReviewRow){const data=row.result_json?JSON.parse(row.result_json):null;if(!data)throw new AppError(row.status==='processing'?'아직 글을 살펴보고 있어요. 잠시 후 다시 열어주세요.':'분석을 마치지 못했어요. 사진을 다시 올려주세요.',409);return {...data,id:row.id,pages:JSON.parse(row.photo_keys).map((_:string,i:number)=>'/api/reviews/'+row.id+'/photo/'+i),studentNumber:row.student_number,createdAt:row.created_at,handoff:row.handoff,doneIds:JSON.parse(row.done_ids),teacherComment:row.teacher_comment}}
export async function rateLimit(key:string,max:number,windowMs:number){const slot=Math.floor(Date.now()/windowMs);const row=await db().prepare('INSERT INTO rate_limits (key,slot,count) VALUES (?,?,1) ON CONFLICT(key,slot) DO UPDATE SET count=count+1 RETURNING count').bind(key,slot).first<{count:number}>();if(!row||row.count>max)throw new AppError('오늘 사용할 수 있는 횟수를 다 썼어요. 선생님께 도움을 요청해주세요.',429)}
