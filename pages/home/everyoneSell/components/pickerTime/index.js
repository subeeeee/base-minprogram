Component({
  properties: {
    pickerTimeData: {
      type: Object,

      value: null,
      observer(val) {
        const data = {
          fieldCode: val.fieldCode,
          fieldName: val.fieldName,
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
    required: false,
    selectDate: ''
  },
  methods: {
    handleChange({ detail }) {
      console.log(detail)
      this.setData({
        selectDate: detail.value
      })
      this.triggerEvent('onChange', {
        fieldCode: this.data.fieldCode,
        fieldName: this.data.fieldName,
        required: this.data.required,
        data: detail.value,
        isOK: !!detail.value
      })
    }
  }
})