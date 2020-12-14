Component({
  properties: {
    inputData: {
      type: Object,
      value: null,
      observer(newVal) {
        this.setData({
          fieldName: newVal.fieldName,
          required: newVal.required,
        })
      }
    }
  },
  data: {
    fieldType: '',
    fieldName: '',
    name: ''
  },
  methods: {
    trim(str) {
      return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
    },
    nameChange: function(e) {
      this.setData({
        name: e.detail.value
      });
      this.triggerEvent('myevent', {
        fieldName: this.data.fieldName,
        fieldValue: this.trim(e.detail.value),
        fieldType: this.data.fieldType,
      })
    }
  }
})