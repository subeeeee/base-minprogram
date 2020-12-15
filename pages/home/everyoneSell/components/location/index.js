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
      }
    }
  },
  data: {
    fieldName: '',
    selectList: [],
    required: false,
    rangeKey: '',
    selectContent: '请选择'
  },
  methods: {
    handleChange({ detail }) {
      this.setData({
        data: detail.value,
        selectContent: detail.value.join('/'),
      })


    },
    emit() {
      this.triggerEvent('onChange', {
        fieldCode: this.data.fieldCode,
        fieldName: this.data.fieldName,
        required: this.data.required,
        data: this.data.selectContent,
        isOk: this.data.selectContent === '请选择'
      })
    }
  }
})