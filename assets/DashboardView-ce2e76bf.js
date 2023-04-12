import{d as v,r as w,o as b,t as f,s as u,a as l,c as i,b as s,F as y,e as T,f as o,g as p,p as I,h as N,_ as V}from"./index-11b04d1a.js";const c=d=>(I("data-v-69c9823f"),d=d(),N(),d),x={class:"container"},L=c(()=>s("h1",null,"Dashboard",-1)),M={key:0},k={class:"table"},B=c(()=>s("thead",null,[s("tr",null,[s("th",null,"Title"),s("th",null,"Date"),s("th",null,"Start"),s("th",null,"End"),s("th",null,"Duration")])],-1)),J=c(()=>s("td",{colspan:"4"},"Total",-1)),O={key:1,class:"title"},C=c(()=>s("h2",null,"No trackings yet",-1)),E=[C],F=c(()=>s("br",null,null,-1)),$=v({__name:"DashboardView",setup(d){const a=w([]);async function g(){const e=sessionStorage.getItem("trackings");if(e&&e!=="[]")a.value=JSON.parse(e);else{const{data:n}=await u.from("trackings").select().order("start",{ascending:!1});a.value=n,sessionStorage.setItem("trackings",JSON.stringify(a.value))}u.channel("any").on("postgres_changes",{event:"*",schema:"public",table:"trackings"},async n=>{const{data:t}=await u.from("trackings").select().order("start",{ascending:!1});a.value=t,sessionStorage.setItem("trackings",JSON.stringify(a.value))}).subscribe()}function m(e){if(!e.end)return"in progress";const n=new Date(e.start),r=new Date(e.end).getTime()-n.getTime();return _(r)}function _(e){e=new Date(e).getTime();const n=Math.floor(e/1e3/60/60),t=Math.floor(e/1e3/60)%60,r=Math.floor(e/1e3)%60;return[n,t,r].map(S=>String(S).padStart(2,"0")).join(":")}function h(e){if(e)return new Date(e).toLocaleTimeString().slice(0,8)}function D(e){let n=new Date(e.start).toLocaleDateString();if(e.end){let t=new Date(e.end).toLocaleDateString();return n===t?n:`${n} - ${t}`}return n}return b(async()=>{var t;f.show();const{data:e,error:n}=await u.auth.getSession();e&&((t=e.session)==null||t.user,g().then(()=>{f.hide()}))}),(e,n)=>(l(),i("div",x,[L,a.value.length!==0?(l(),i("div",M,[s("table",k,[B,s("tbody",null,[(l(!0),i(y,null,T(a.value,t=>(l(),i("tr",{key:t.id},[s("td",null,o(t.title),1),s("td",null,o(D(t)),1),s("td",null,o(h(t.start)),1),s("td",null,o(t.end?h(t.end):""),1),s("td",null,o(m(t)),1)]))),128))]),s("tfoot",null,[s("tr",null,[J,s("td",null,o(_(a.value.map(t=>t.end?new Date(t.end).getTime()-new Date(t.start).getTime():0).reduce((t,r)=>t+r,0))),1)])])])])):p("",!0),a.value.length===0?(l(),i("div",O,E)):p("",!0),F]))}});const z=V($,[["__scopeId","data-v-69c9823f"]]);export{z as default};