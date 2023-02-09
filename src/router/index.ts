import { createRouter, createWebHashHistory } from 'vue-router';
import login from "./login";

const routes = [
    { 
        path: '/',
        name: 'layout',
        component: () => import('../views/layout/index.vue'),
        children: [
            {
                path: '/404',
                name: '404',
                meta: {
                    title: '错误页面'
                },
                component: () => import('../views/404/index.vue')
            },
            {
                path: '/home',
                name: 'home',
                meta: {
                    title: '首页'
                },
                component: () => import('../views/home/index.vue')
            }
        ]
    },
    login
]
const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router;