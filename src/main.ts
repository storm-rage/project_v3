import { createApp } from 'vue'
import { store, key } from './store'
import ElementPlus from 'element-plus';
// import 'dayjs/locale/zh-cn'
import locale from 'element-plus/lib/locale/lang/zh-cn'
import 'element-plus/lib/theme-chalk/index.css';
import router from "./router";
import ajaxRequest from "./commons/http";
import App from './App.vue';
import gcoord from 'gcoord';
import moment from "moment";


// 路由守卫
router.beforeEach((to, from, next) => {
  let token:any = store.state.userToken
  if (to.meta.title) {
    if (to.name !== "login" && !token) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    next({ name: '404' })
  }
});

const app = createApp(App)

app.config.globalProperties.$ajaxRequest = ajaxRequest.njdfAjax;
app.config.globalProperties.$gcoord = gcoord;
app.config.globalProperties.$moment = moment;

app.use(ElementPlus, {locale});
app.use(router);
app.use(store, key);
app.mount('#app');
