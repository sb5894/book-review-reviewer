import { z } from 'zod';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { classroom,db,failure,response,sameOrigin,teacher,AppError } from '@/lib/server';
import { configured } from '@/lib/google';
export async function GET(){try{const {room}=await teacher();const reviews=(await db().prepare('SELECT id,student_number AS studentNumber,status,created_at AS createdAt,handoff,done_ids AS doneIds,teacher_comment AS teacherComment FROM reviews ORDER BY created_at DESC LIMIT 300').all()).results;return response({room,configured:configured(),reviews})}catch(e){return failure(e)}}
export async function POST(req:Request){try{sameOrigin(req);const user=await getChatGPTUser();if(!user)throw new AppError('선생님 로그인이 필요해요.',401);if(await classroom())throw new AppError('이미 만들어진 교실이에요. 기존 선생님 계정으로 들어와주세요.',409);const {name}=z.object({name:z.string().trim().min(1).max(50)}).parse(await req.json());await db().prepare('INSERT INTO classroom(id,owner_id,name,enabled,created_at) VALUES(1,?,?,1,?)').bind(user.userId,name,Date.now()).run();return response({ok:true});}catch(e){return failure(e)}}
export async function PATCH(req:Request){try{sameOrigin(req);await teacher();const {enabled}=z.object({enabled:z.boolean()}).parse(await req.json());await db().prepare('UPDATE classroom SET enabled=? WHERE id=1').bind(enabled?1:0).run();return response({ok:true})}catch(e){return failure(e)}}
