var p=Object.defineProperty;var k=(l,t,r)=>t in l?p(l,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):l[t]=r;var u=(l,t,r)=>(k(l,typeof t!="symbol"?t+"":t,r),r);class T{constructor(t){u(this,"supabase");u(this,"currentTracking");u(this,"user");this.supabase=t,this.currentTracking=null}async initialize(){const{data:t,error:r}=await this.supabase.from("trackings").select().is("end",null);t&&t.length>0?this.currentTracking=t[0]:this.currentTracking=null,this.user=await this.checkSession()}async refresh(){return await this.initialize()}async start(t,r,e=null,a=null){var o,g;const s=r.toISOString(),n=(e==null?void 0:e.toISOString())||null,{data:i,error:c}=await this.supabase.from("trackings").insert([{title:t,start:s,end:n,user:(o=this.user)==null?void 0:o.id}]).select("*");return this.currentTracking=i&&i.length==1?i[0]:null,a&&a.length>0&&((g=this.currentTracking)!=null&&g.id)&&await this.supabase.from("tracking_tags").insert(a.map(d=>{var h;return{tag:d,tracking:(h=this.currentTracking)==null?void 0:h.id}})),{data:i,error:c}}async stop(t){var e,a;const r=t.toISOString();if((e=this.currentTracking)!=null&&e.id){const{data:s,error:n}=await this.supabase.from("trackings").update({end:r}).eq("id",(a=this.currentTracking)==null?void 0:a.id);return this.currentTracking=null,{data:s,error:n}}else return{data:null,error:"No tracking to stop"}}getCurrentTracking(){return this.currentTracking?{data:this.currentTracking,error:null}:{data:null,error:null}}async checkSession(){var e;const{data:t,error:r}=await this.supabase.auth.getSession();return t?(e=t.session)==null?void 0:e.user:!1}async update(t,r){var e,a;if(r=r||((e=this.currentTracking)==null?void 0:e.id)||((a=(await this.getCurrentTracking()).data)==null?void 0:a.id),r){if(t.hasOwnProperty("tags")){const i=t.tags||[];delete t.tags,await this.supabase.from("tracking_tags").delete().eq("tracking",r),i.length>0&&await this.supabase.from("tracking_tags").upsert(i.map(c=>({tag:c,tracking:r})),{onConflict:"tag,tracking",noUpdate:!0})}const{data:s,error:n}=await this.supabase.from("trackings").update(t).eq("id",r);return{data:s,error:n}}else return{data:null,error:"No tracking to update"}}async getTitles(){var e;const{data:t,error:r}=await this.supabase.from("titles").select("title, amount, last_use").eq("user",(e=this.user)==null?void 0:e.id);return t&&t.length>0?{data:t,error:null}:{data:null,error:null}}async getTrackingGroups(t=null){let r;if(t)r=t;else{const{data:a,error:s}=await this.supabase.from("trackings_parent").select();r=a}let e=[];if(r&&r.length>0){for(let a=0;a<r.length;a++){const s=r[a],n=r[a-1]||null;n&&s.title==n.title&&new Date(s.end).toLocaleDateString()==new Date(n.end).toLocaleDateString()?e[e.length-1].push(s):e.push([s])}return{data:e,error:null}}else return{data:null,error:null}}async getTags(){const{data:t,error:r}=await this.supabase.from("tags").select("title, id");return t&&t.length>0?{data:t,error:null}:{data:null,error:null}}}export{T};