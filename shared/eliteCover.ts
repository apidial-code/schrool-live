// No names, email addresses or parent notes belong in a review token.
export function coverReviewSnapshot(session:{id:number;lessonId:number;startsAt:Date;endsAt:Date},cover:{id:number;handover:string},reports:{id:number;sessionId:number}[]) {
  return JSON.stringify([cover.id,cover.handover,session.id,session.lessonId,session.startsAt.toISOString(),session.endsAt.toISOString(),
    reports.filter(r=>r.sessionId!==session.id).map(r=>r.id).sort((a,b)=>a-b)]);
}
export function coverNeedsReturn(cover:{status:string;returnedReportId:number|null},latestReportId:number|undefined) {
  return cover.status!=="returned" || !latestReportId || cover.returnedReportId!==latestReportId;
}
