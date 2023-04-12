import{d as v,r as w,o as b,t as f,s as u,a as l,c as i,b as s,F as y,e as T,f as o,g as p,p as I,h as N,_ as V}from"./index-f7b6aab6.js";const c=d=>(I("data-v-95171ce7"),d=d(),N(),d),x={class:"container"},L=c(()=>s("h1",null,"Dashboard",-1)),M={key:0},k={class:"table"},B=c(()=>s("thead",null,[s("tr",null,[s("th",null,"Title"),s("th",null,"Date"),s("th",null,"Start"),s("th",null,"End"),s("th",null,"Duration")])],-1)),J=c(()=>s("td",{colspan:"4"},"Total",-1)),O={key:1,class:"title"},C=c(()=>s("h2",null,"No trackings yet",-1)),E=[C],F=c(()=>s("br",null,null,-1)),$=v({__name:"DashboardView",setup(d){const a=w([]);async function g(){const t=sessionStorage.getItem("trackings");if(t)a.value=JSON.parse(t);else{const{data:n}=await u.from("trackings").select().order("start",{ascending:!1});a.value=n,sessionStorage.setItem("trackings",JSON.stringify(a.value))}u.channel("any").on("postgres_changes",{event:"*",schema:"public",table:"trackings"},async n=>{const{data:e}=await u.from("trackings").select().order("start",{ascending:!1});a.value=e,sessionStorage.setItem("trackings",JSON.stringify(a.value))}).subscribe()}function m(t){if(!t.end)return"in progress";const n=new Date(t.start),r=new Date(t.end).getTime()-n.getTime();return _(r)}function _(t){t=new Date(t).getTime();const n=Math.floor(t/1e3/60/60),e=Math.floor(t/1e3/60)%60,r=Math.floor(t/1e3)%60;return[n,e,r].map(S=>String(S).padStart(2,"0")).join(":")}function h(t){if(t)return new Date(t).toLocaleTimeString().slice(0,8)}function D(t){let n=new Date(t.start).toLocaleDateString();if(t.end){let e=new Date(t.end).toLocaleDateString();return n===e?n:`${n} - ${e}`}return n}return b(async()=>{var e;f.show();const{data:t,error:n}=await u.auth.getSession();t&&((e=t.session)==null||e.user,g().then(()=>{f.hide()}))}),(t,n)=>(l(),i("div",x,[L,a.value.length!==0?(l(),i("div",M,[s("table",k,[B,s("tbody",null,[(l(!0),i(y,null,T(a.value,e=>(l(),i("tr",{key:e.id},[s("td",null,o(e.title),1),s("td",null,o(D(e)),1),s("td",null,o(h(e.start)),1),s("td",null,o(e.end?h(e.end):""),1),s("td",null,o(m(e)),1)]))),128))]),s("tfoot",null,[s("tr",null,[J,s("td",null,o(_(a.value.map(e=>e.end?new Date(e.end).getTime()-new Date(e.start).getTime():0).reduce((e,r)=>e+r,0))),1)])])])])):p("",!0),a.value.length===0?(l(),i("div",O,E)):p("",!0),F]))}});const z=V($,[["__scopeId","data-v-95171ce7"]]);export{z as default};
