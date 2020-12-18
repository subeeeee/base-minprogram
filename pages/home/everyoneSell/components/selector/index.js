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
    selectContent: '请选择'
  },
  methods: {
    handleChange({ detail }) {
      console.log(detail)
      let selectContent = null
      let isOk = false
      const selectItem = this.data.selectList[+detail.value]
      if(this.data.rangeKey) {
        selectContent = selectItem[this.data.rangeKey]
        isOk = true
      } else {
        selectContent = selectItem
        isOk = true
      }
      this.setData({
        selectContent
      })
      this.triggerEvent('onChange', {
        fieldCode: this.data.fieldCode || '',
        fieldName: this.data.fieldName || '',
        required: this.data.required || '',
        data: selectItem,
        isOk,
      })
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
        isOk: false,
      })
    }
  }
})