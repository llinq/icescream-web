import { HTTP } from '../../http'

export default {
  state: {
    debtors: [],
    lastPaymentDate: null
  },
  mutations: {
    setDebtors (state, payload) {
      state.debtors = payload
    },
    setLastPaymentDate (state, payload) {
      state.lastPaymentDate = payload
    },
    confirmPayment (state, payload) {
      const debtors = state.debtors
      debtors.splice(debtors.findIndex(debtor => debtor.id === payload.idUserDebtor), 1)
      state.debtors = debtors
    }
  },
  actions: {
    loadUserDebtors ({commit}, payload) {
      commit('setLoading', true)
      HTTP.get('UserDebtor/GetPending', {
        params: {
          maximumItems: payload === undefined ? null : payload
        }
      })
        .then((data) => {
          const debtors = []
          const obj = data.data
          for (let key in obj) {
            debtors.push({
              id: obj[key].idUserDebtor,
              name: obj[key].userName,
              imageUrl: obj[key].imageURL,
              contact: obj[key].userContact,
              date: obj[key].debitDate,
              reason: obj[key].reason
            })
          }
          commit('setDebtors', debtors)
          commit('clearResponse')
          commit('setLoading', false)
        })
        .catch((error) => {
          commit('clearResponse')
          const response = {
            type: 'error',
            message: error.message
          }
          commit('setResponse', response)
          commit('setLoading', false)
        })
    },
    getEvaluations ({commit}) {
      commit('clearResponse')
      commit('setLoading', true)
      HTTP.get('UserDebtor/GetAllEvaluationData')
        .then((data) => {
          const debtors = []
          const obj = data.data
          for (let key in obj) {
            debtors.push({
              name: obj[key].userName,
              debitDate: obj[key].debitDate,
              paymentDate: obj[key].paymentDate,
              reason: obj[key].reason,
              reviewIcon: obj[key].evaluation === '1' ? 'sentiment_dissatisfied' : obj[key].evaluation === '2' ? 'sentiment_neutral' : obj[key].evaluation === '3' ? 'mood' : 'stamp'
            })
          }
          commit('setDebtors', debtors)
          commit('setLoading', false)
        })
        .catch((error) => {
          const response = {
            type: 'error',
            message: error.message
          }
          commit('setResponse', response)
          commit('setLoading', false)
        })
    },
    createPendingDebtors ({commit}) {
      commit('setLoading', true)
      commit('clearResponse')
      HTTP.post('UserDebtor/CreatePendingDebtors')
        .then(() => {
          commit('loadUserDebtors')
          const response = {
            type: 'success',
            message: 'Devedores de sorvete atualizados com sucesso.'
          }
          commit('setResponse', response)
          commit('setLoading', false)
        })
        .catch((error) => {
          const response = {
            type: 'error',
            message: error.message
          }
          commit('setResponse', response)
          commit('setLoading', false)
        })
    },
    getLastPaymentDate ({commit}) {
      commit('clearResponse')
      return new Promise((resolve, reject) => {
        HTTP.get('UserDebtor/GetLastPaymentDate')
        .then((data) => {
          const lastPaymentDate = data.data
          commit('setLastPaymentDate', lastPaymentDate)
          resolve()
        })
        .catch((error) => {
          const response = {
            type: 'error',
            message: error.message
          }
          commit('setResponse', response)
          reject()
        })
      })
    },
    confirmPayment ({commit}, payload) {
      commit('clearResponse')
      commit('setLoading', true)
      HTTP.put('UserDebtor/RequestPayment', payload)
        .then(() => {
          const response = {
            type: 'success',
            message: 'Sorvete pago com sucesso.'
          }
          commit('confirmPayment', payload)
          commit('setResponse', response)
          commit('setLoading', false)
        })
        .catch((error) => {
          const response = {
            type: 'error',
            message: error.message
          }
          commit('setResponse', response)
          commit('setLoading', false)
        })
    }
  },
  getters: {
    debtors (state) {
      return state.debtors
    },
    lastPaymentDate (state) {
      return state.lastPaymentDate
    }
  }
}
