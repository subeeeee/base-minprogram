Component({
  properties: {
    selectorData: {
      type: Object,
      value: null,
      observer(val) {
        const data = {
          placeholder:val.placeholder || '请选择',
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
    placeholder: '',
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
        fieldName: this.data.fieldName,
        required: this.data.required,
        data: selectItem,
        isOk: !!selectItem
      })
    }
  }
})