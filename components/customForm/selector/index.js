import Api from "../../../utils/api.js";
Component({
  properties: {
    radioData: {
      type: Object,
      value: null,
      observer(val) {
        const data = {
          placeholder:val.placeholder || '请选择',
          fieldName: val.fieldName,
          radioList: val.radioList,
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
    radioList: [],
    required: false,
    rangeKey: '',
    selectContent: '请选择'
  },
  methods: {
    handleChange({ detail }) {
      let selectContent = null
      const selectItem = this.data.radioList[+detail.value]
      if(this.data.rangeKey) {
        selectContent =selectItem[this.data.rangeKey]
      } else {
        selectContent = selectItem
      }
      this.setData({
        selectContent
      })
      this.triggerEvent('handleChange', {
        fieldName: this.data.fieldName,
        required: this.data.required,
        data: selectItem,
      })
    }
  }
})