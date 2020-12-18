Component({
  properties: {
    selectorData: {
      type: Object,
      value: null,
      observer(val) {
        const data = {
          placeholder:val.placeholder || '请选择',
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
    }
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
    }
  }
})