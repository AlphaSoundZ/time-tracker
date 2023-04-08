import{d as w,r as S,o as v,s as i,c as l,a as t,F as T,b as y,e as c,t as s,p as x,f as I,_ as L}from"./index-535af72b.js";const _=o=>(x("data-v-2c9ce85f"),o=o(),I(),o),M={class:"container"},V=_(()=>t("h1",{class:"title"},"Time Tracker",-1)),B={class:"table"},C=_(()=>t("thead",null,[t("tr",null,[t("th",null,"Title"),t("th",null,"Date"),t("th",null,"Start"),t("th",null,"End"),t("th",null,"Duration")])],-1)),E=w({__name:"DashboardView",setup(o){const d=S([]);async function p(){const{data:e}=await i.from("trackings").select();d.value=e}function f(e){if(!e.end)return"in progress";const a=new Date(e.start),r=new Date(e.end).getTime()-a.getTime(),m=Math.floor(r/1e3/60/60),D=Math.floor(r/1e3/60)%60,b=Math.floor(r/1e3)%60;return[m,D,b].map(g=>String(g).padStart(2,"0")).join(":")}function u(e){if(e)return new Date(e).toLocaleTimeString().split(" ")[0]}function h(e){let a=new Date(e.start).toLocaleDateString();if(e.end){let n=new Date(e.end).toLocaleDateString();return a===n?a:`${a} - ${n}`}return a}return v(()=>{p(),i.channel("any").on("postgres_changes",{event:"*",schema:"public",table:"trackings"},e=>{console.log("Change received!",e)}).subscribe()}),(e,a)=>(c(),l("div",M,[V,t("table",B,[C,t("tbody",null,[(c(!0),l(T,null,y(d.value,n=>(c(),l("tr",{key:n.id},[t("td",null,s(n.title),1),t("td",null,s(h(n)),1),t("td",null,s(u(n.start)),1),t("td",null,s(n.end?u(n.end):""),1),t("td",null,s(f(n)),1)]))),128))])])]))}});const j=L(E,[["__scopeId","data-v-2c9ce85f"]]);export{j as default};
