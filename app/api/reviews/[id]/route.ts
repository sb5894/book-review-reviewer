import { z } from 'zod';
import {authorizedReview,db,failure,response,sameOrigin,serialize,teacher,bucket,requireStudent,AppError} from '@/lib/server';
type Context={params:Promise<{id:string}>};
export async function GET(_:Request,{params}:Context){try{return response(serialize(await authorizedReview((await params).id)))}catch(e){return failure(e)}}
export async function PATCH(req:Request,{params}:Context){
 try{sameOrigin(req);const {id}=await params;const row=await authorizedReview(id);const body=await req.json();
 if(body&&typeof body==='object'&&'teacherComment' in body){
 await teacher();const {teacherComment}=z.object({teacherComment:z.string().max(3000)}).parse(body);await db().prepare('UPDATE reviews SET teacher_comment=? WHERE id=?').bind(teacherComment,id).run();
 }else{
 const s=await requireStudent();if(s.id!==row.session_id)throw new AppError('내 글에서만 표시할 수 있어요.',403);
 const {doneIds,handoff}=z.object({doneIds:z.array(z.string()).max(7),handoff:z.enum(['','ready','help','misread'])}).parse(body);
 const known=JSON.parse(row.result_json||'{}').feedback?.cards?.map((c:{id:string})=>c.id)||[];
 if(doneIds.some(d=>!known.includes(d)))throw new AppError('피드백을 다시 열어주세요.');
 await db().prepare('UPDATE reviews SET done_ids=?,handoff=? WHERE id=?').bind(JSON.stringify([...new Set(doneIds)]),handoff,id).run();
 }return response({ok:true});
 }catch(e){if(e instanceof z.ZodError)return response({error:'입력 내용을 확인해주세요.'},400);return failure(e)}
}
export async function DELETE(req:Request,{params}:Context){try{sameOrigin(req);await teacher();const row=await authorizedReview((await params).id);await bucket().delete(JSON.parse(row.photo_keys));await db().prepare('DELETE FROM reviews WHERE id=?').bind(row.id).run();return response({ok:true});}catch(e){return failure(e)}}
