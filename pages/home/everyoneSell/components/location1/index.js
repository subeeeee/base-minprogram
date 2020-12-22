import Api from "../../../../../utils/api";
const app = getApp()


Component({
  properties: {
    selectorData: {
      type: Object,
      value: null,
      observer(val) {
        const data = {
          fieldCode: val.fieldCode,
          fieldName: val.fieldName,
          selectList: val.selectList,
          required: val.required,
        }
        if(val.rangeKey) {
          data.rangeKey = val.rangeKey
        }
        this.setData(data)
        this.getAddressData(val.url)
      }
    }
  },
  data: {
    fieldName: '',
    addressData: [],
    required: false,
    rangeKey: '',
    selectContent: '请选择'
  },
  methods: {
    async getAddressData(url) {
      const res = await Api.fetch({
        method: 'get',
        url: 'iCloud-rest/' + url,
        data: {
          tenantId:app.globalData.tenantId,
        }
      }, '')
      this.setData({
        addressData: res.data
      })
      console.log(this.data.addressData)

    },
    handleChange({ detail }) {
      let selectContent = null
      const selectItem = this.data.selectList[+detail.value]
      if (this.data.rangeKey) {
        selectContent = selectItem[this.data.rangeKey]
      } else {
        selectContent = selectItem
      }
      this.setData({
        selectContent
      })
      this.triggerEvent('onChange', {
        fieldName: this.data.fieldName,
        required: this.data.required,
        data: selectItem,
        isOK: !!selectItem
      })
    },

    handleColumnChange(e) {
      console.log(e)
    }
  }
})