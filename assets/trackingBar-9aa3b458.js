import{r as p,s as T,t as g,_ as w,a as d,c as u,b as o,F as f,e as v,f as m,k as S,n as _,p as B,h as D}from"./index-4777df5d.js";import{T as E}from"./track-87b30f9b.js";const O={data(){return{items:p([]),tags:p([]),trackingTime:"",intervalId:null,trackingSubscription:null,tagsDropdownOpen:!1,titleDropdownOpen:!1,track:new E(T)}},methods:{async updateTitle(){const t=document.getElementById("trackingTitle");sessionStorage.setItem("trackingTitle",t.value),this.isIntervalRunning()&&await this.track.update({title:t.value},null)},async updateItems(){const t=document.getElementById("trackingTitle");sessionStorage.getItem("titles")||await this.fetchItems();const s=t.value.toLowerCase(),i=JSON.parse(sessionStorage.getItem("titles")||"[]");if(t.value.length==0){this.items=i.slice(0,1),this.titleDropdownOpen=!0;return}const r=i.filter(a=>a.title.toLowerCase().includes(s));r.sort((a,n)=>n.amount-a.amount),this.items=r.slice(0,3),this.titleDropdownOpen=!0},selectItem(t){const s=document.getElementById("trackingTitle"),i=t.title;s.value=i,this.updateTitle(),this.items=[],this.titleDropdownOpen=!1},async fetchItems(){const t=await this.track.getTitles();if(t.error){console.log(t.error);return}sessionStorage.setItem("titles",JSON.stringify(t.data))},async toggleTracking(){g.show(),document.getElementById("startTracking"),document.getElementById("stopTracking"),this.isIntervalRunning()?this.stopTracking().then(()=>{g.hide()}):this.startTracking().then(()=>{g.hide()})},isIntervalRunning(){return this.intervalId!=null},async startTracking(){const t=new Date,s=document.getElementById("startTracking"),i=document.getElementById("stopTracking"),r=document.getElementById("trackingTitle"),n=JSON.parse(sessionStorage.getItem("tags")||"[]").reduce((e,c)=>(c.active&&e.push(c.id),e),[]);this.startInterval(t),s.style.display="none",i.style.display="block",await this.track.start(r.value,t,null,n).then(e=>{e.error?(console.log(e.error),s.style.display="block",i.style.display="none",this.stopInterval(),this.trackingTime="--:--:--"):console.log("tracking started!")})},async stopTracking(){const t=new Date,s=document.getElementById("startTracking"),i=document.getElementById("stopTracking"),r=document.getElementById("trackingTitle");this.stopInterval(),this.trackingTime="00:00:00",r.value="",sessionStorage.removeItem("trackingTitle"),s.style.display="block",i.style.display="none";const a=JSON.parse(sessionStorage.getItem("tags")||"[]");a.forEach(n=>{n.active=!1}),sessionStorage.setItem("tags",JSON.stringify(a)),await this.track.stop(t).then(n=>{n.error&&console.log(n.error),this.fetchItems(),console.log("tracking stopped!")})},startInterval(t){const i=new Date().getTime()-t.getTime(),r=new Date(i);this.trackingTime=this.formatTime(r),this.intervalId=setInterval(()=>{const n=new Date().getTime()-t.getTime(),e=new Date(n);this.trackingTime=this.formatTime(e)},1e3)},stopInterval(){clearInterval(this.intervalId),this.intervalId=null},async updateTracking(t=null){var a;const s=document.getElementById("startTracking"),i=document.getElementById("stopTracking"),r=document.getElementById("trackingTitle");if(t){const n=t.start?new Date(t.start):null,e=t.end?new Date(t.end):null;n&&!e&&!this.isIntervalRunning()?(console.log("tracking has changed to running"),this.startInterval(n),s.style.display="none",i.style.display="block"):!n&&e&&this.isIntervalRunning()&&(console.log("tracking has changed to stopped"),this.trackingTime="00:00:00",r.value="",sessionStorage.removeItem("trackingTitle"),this.stopInterval(),s.style.display="block",i.style.display="none"),this.isIntervalRunning()&&(r.value=((a=t.title)==null?void 0:a.toString())||"",sessionStorage.setItem("trackingTitle",r.value))}this.isIntervalRunning()||(r.value=sessionStorage.getItem("trackingTitle")||"",s.style.display="block",i.style.display="none")},formatTime(t){const s=t.getUTCHours().toString().padStart(2,"0"),i=t.getUTCMinutes().toString().padStart(2,"0"),r=t.getUTCSeconds().toString().padStart(2,"0");return`${s}:${i}:${r}`},toggleTagsDropdown(){if(this.tagsDropdownOpen)this.tagsDropdownOpen=!1,this.tags=[];else{this.tagsDropdownOpen=!0;const t=JSON.parse(sessionStorage.getItem("tags")||"[]");this.tags=t}},async selectTag(t){if(this.tags[this.tags.indexOf(t)].active=!this.tags[this.tags.indexOf(t)].active,sessionStorage.setItem("tags",JSON.stringify(this.tags)),this.isIntervalRunning()){const s=this.tags.filter(i=>i.active).map(i=>i.id);console.log(s),await this.track.update({tags:s},null)}}},setup(){const t=p("--:--:--");return g.show(),{trackingTime:t}},async mounted(){var r;await this.track.initialize();const t=this.track.getCurrentTracking(),s=(r=t.data)!=null&&r.start?new Date(t.data.start):null;if(t.error){console.log(t.error),g.hide();return}s||(this.trackingTime="00:00:00"),this.updateTracking(t.data),await this.track.getTitles().then(a=>{if(a.error){console.log(a.error);return}sessionStorage.setItem("titles",JSON.stringify(a.data))}),await this.track.getTags().then(async a=>{var e,c,I;if(a.error){console.log(a.error);return}if(a.data.forEach(l=>{l.active=!1}),((e=t.data)==null?void 0:e.start)&&!((c=t.data)!=null&&c.end)){const{data:l,error:k}=await T.from("tracking_tags").select("tag").eq("tracking",(I=t.data)==null?void 0:I.id);console.log(l),l&&l.length>0&&l.forEach(h=>{a.data.find(y=>y.id===h.tag).active=!0})}else{const l=JSON.parse(sessionStorage.getItem("tags")||"[]");l.length>0&&l.forEach(k=>{k.active&&(a.data.find(h=>h.id===k.id).active=!0)})}sessionStorage.setItem("tags",JSON.stringify(a.data))});const i=document.getElementById("tagsItems");document.addEventListener("click",a=>{const n=document.getElementById("trackingTitle");a.target!=n&&(this.items=[],this.titleDropdownOpen=!1);const e=document.getElementById("tagsButton");!i.contains(a.target)&&this.tagsDropdownOpen&&a.target!=e&&(this.tags=[],this.tagsDropdownOpen=!1)}),this.trackingSubscription=T.channel("public:trackings").on("postgres_changes",{event:"*",schema:"public",table:"trackings"},async a=>{this.updateTracking(a.new)}).subscribe(),g.hide()}},b="/time-tracker/assets/tags_icon-193ca0b0.svg",C="/time-tracker/assets/stop_tracking-195e8611.svg",N="/time-tracker/assets/start_tracking-18db4d96.svg";const J=t=>(B("data-v-dc77a659"),t=t(),D(),t),R={class:"tracking-container"},x={class:"title-container"},L={class:"autocomplete-items"},z=["onClick"],F=J(()=>o("br",null,null,-1)),U={style:{"font-size":"small"}},V={class:"tags-items",id:"tagsItems"},q=["onClick"],H={class:"tracking-time",id:"trackingTime"};function K(t,s,i,r,a,n){return d(),u("div",R,[o("div",x,[o("input",{autocomplete:"off",class:"tracking-title",type:"text",placeholder:"Title",id:"trackingTitle",onChange:s[0]||(s[0]=(...e)=>n.updateTitle&&n.updateTitle(...e)),onFocusin:s[1]||(s[1]=(...e)=>n.updateItems&&n.updateItems(...e)),onKeyup:s[2]||(s[2]=(...e)=>n.updateItems&&n.updateItems(...e))},null,32),o("div",L,[(d(!0),u(f,null,v(a.items,e=>(d(),u("div",{onClick:c=>n.selectItem(e)},[S(m(e.title)+" ",1),F,o("p",U,m(new Date(e.last_use).toLocaleDateString()),1)],8,z))),256))])]),o("img",{src:b,alt:"tags",class:"tag-button",onClick:s[3]||(s[3]=(...e)=>n.toggleTagsDropdown&&n.toggleTagsDropdown(...e)),id:"tagsButton"}),o("div",V,[(d(!0),u(f,null,v(a.tags,e=>(d(),u("div",{onClick:c=>n.selectTag(e),key:e.id,class:_({"tags-active":e.active})},m(e.title),11,q))),128))]),o("h3",H,m(r.trackingTime),1),o("img",{class:"toggleTracking",src:C,alt:"stop tracking",onClick:s[4]||(s[4]=(...e)=>n.toggleTracking&&n.toggleTracking(...e)),id:"stopTracking",hidden:"",loading:"eager"}),o("img",{class:"toggleTracking",src:N,alt:"start tracking",onClick:s[5]||(s[5]=(...e)=>n.toggleTracking&&n.toggleTracking(...e)),id:"startTracking",loading:"eager"})])}const A=w(O,[["render",K],["__scopeId","data-v-dc77a659"]]);export{A as T};
