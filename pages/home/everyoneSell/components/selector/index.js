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
          selectList: val.optionList,
          required: val.required,
        }
        if(val.rangeKey) {
          data.rangeKey = val.rangeKey
        }
        if(val.rangeCode) {
          data.rangeCode = val.rangeCode
        }
        this.setData(data)
      }
    },
    isHide: {
      type: Boolean,
      value: false,
      observer(isHide) {
        this.changeIsHide(isHide)

      }
    },
  },
  data: {
    placeholder: '',
    fieldName: '',
    selectList: [],
    required: false,
    rangeKey: '',
    selectContent: '请选择',
    imgServerUrl:app.globalData.imgServerUrl,
    globalProjectName:app.globalData.projectName,
    cdnUrl:app.globalData.cdnUrl,
    darkColor:app.globalData.darkColor,
    lightColor:app.globalData.lightColor
  },
  methods: {
    handleChange({ detail }) {
      let selectContent = null
      let data = null
      let isOK = false
      const selectItem = this.data.selectList[+detail.value]
      if(this.data.rangeKey) {
        selectContent = selectItem[this.data.rangeKey]
        data = selectItem[this.data.rangeCode || this.data.rangeKey]
        isOK = true
      } else {
        selectContent = selectItem
        isOK = true
      }
      this.setData({
        selectContent
      })
      const params = {
        fieldCode: this.data.fieldCode || '',
        fieldName: this.data.fieldName || '',
        required: this.data.required || '',
        data,
        dataDesc: selectItem,
        isOK,
      }
      this.triggerEvent('onChange', params)
    },
    changeIsHide(isHide) {
      let placeholder = ''
      if(this.data.fieldName === '置业顾问') {
        placeholder = isHide ? '不支持指定置业顾问' : ''
      }
      this.setData({
        isHide,
        placeholder,
        selectContent: '请选择'
      })
      // 手动触发更改
      this.triggerEvent('onChange', {
        fieldCode: this.data.fieldCode || '',
        fieldName: this.data.fieldName || '',
        required: this.data.required || '',
        data: '',
        isOK: false,
      })
    }
  }
})
