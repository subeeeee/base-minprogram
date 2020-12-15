Component({
  properties: {
    inputData: {
      type: Object,
      value: null,
      observer(val) {
        this.setData({
          fieldCode: val.fieldCode,
          fieldName: val.fieldName,
          required: val.required,
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
    onInput: function({ detail }) {
      this.setData({
        name: detail.value
      });
      this.triggerEvent('onInput', {
        fieldCode: this.data.fieldCode,
        fieldName: this.data.fieldName,
        data: this.trim(detail.value),
        required: this.data.required,
        isOK: !!this.trim(detail.value),
      })
    }
  }
})