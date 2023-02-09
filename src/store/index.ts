import { InjectionKey } from 'vue'
import { createStore, Store } from 'vuex'

export interface State {
  userToken: String,
  cityKey: String,
  cityName: String,
  regionList: String,
  dictionaryList: String
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state() {
    return {
      userToken:sessionStorage.getItem('userToken') || "", // token
      cityKey: sessionStorage.getItem('cityKey') || "", // 地区数据库KEY
      cityName: sessionStorage.getItem('cityName') || "", // 地区数据库名称
      regionList: sessionStorage.getItem('regionList') || "[]", // 地区列表
      dictionaryList: sessionStorage.getItem('dictionaryList') || "[]" // 数据字典
    }
  },
  mutations: {
    userTokenFun(state, data) {
      sessionStorage.setItem('userToken', data)
      state.userToken = data
    },
    cityKeyFun(state, data) {
      sessionStorage.setItem('cityKey', data)
      state.cityKey = data
    },
    cityNameFun(state, data) {
      sessionStorage.setItem('cityName', data)
      state.cityName = data
    },
    regionListFun(state, data) {
      sessionStorage.setItem('regionList', data)
      state.regionList = data
    },
    dictionaryListFun(state, data) {
      sessionStorage.setItem('dictionaryList', data)
      state.dictionaryList = data
    }
  }
})