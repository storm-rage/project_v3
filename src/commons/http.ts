import axios from "axios";
import { ElMessage } from 'element-plus'
const instance = axios.create({
  timeout: 1000 * 60 // 设置超时时间为1分钟d
});

// 添加请求拦截器
instance.interceptors.request.use(
    (options: any) => {
      // 简化类型设置
      const headers = (options.headers = options.headers || {});
      if (options.json) {
        headers["Content-Type"] = "application/json; charset=UTF-8";
        delete options.json;
      }
      if (options.formUpload) {
        headers["Content-Type"] = "multipart/form-data; charset=UTF-8";
        delete options.formUpload;
      }
      // 校验post数据格式
      const contentType = headers["Content-Type"];
      if (
        typeof options.data === "object" &&
        contentType &&
        contentType.indexOf("application/x-www-form-urlencoded") > -1
      ) {
        options.data = JSON.stringify(options.data);
      }
      return options;
    },
    error => {
      return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    response => {
      return response.data;
    },
    error => {
      if (error.response) {
        const data = error.response.data;
        const status = error.response.status;
        let errMessage = data.message || "";
        switch (status) {
          case 401:
            errMessage = "401登录已过期";
            sessionStorage.clear();
            window.location.replace(window.location.origin + '/#/login') // 跳转主页
            // 返回登录页面
            break;
          case 404:
            errMessage = "404没有找到请求资源";
            break;
          case 405:
            errMessage = "405http请求方式有误";
            break;
          case 500:
            errMessage = "500服务器出了点小差，请稍后再试";
            break;
          case 501:
            errMessage = "501服务器不支持当前请求所需要的某个功能";
            break;
          default:
            errMessage = "请求失败，请联系管理员";
            break;
        }
        // 禁用全局错误提示
        if (error.config.toast !== false) {
          ElMessage.error(errMessage);
        }
      } else {
        if (axios.isCancel(error)) {
          console.error("请求被取消", error.message);
        } else {
          // 默认放一个空对象避免其他地方报错
          error.response = {};
          console.error(
            (error.config && error.config.url) || "无url",
            "请求接口超过一分钟无响应"
          );
        }
      }
      return error.response.data
    }
);

export default {
    njdfAjax: async(options: any) => {
      if (sessionStorage.getItem('userToken') && sessionStorage.getItem('cityKey')) {
        if (options.headers) {
          options.headers.Authorization = sessionStorage.getItem('userToken')
          options.headers.cityKey = sessionStorage.getItem('cityKey')
        } else {
          options["headers"] = {
            "Authorization": sessionStorage.getItem('userToken'),
            "cityKey": sessionStorage.getItem('cityKey')
          }
        }
      }
      return instance.request(options)
    }
}