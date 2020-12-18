Component({
  properties: {
    checkboxData: {
      type: Object,
      value: null,
      observer(val) {
        this.setData({
          fieldCode: val.fieldCode,
          fieldName: val.fieldName,
          dataList: val.optionList,
          required: val.required
        })
      }
    }
  },
  data: {
    activeNameStr: '',
    placeholder: '请选择',
    dataList:[],
    isShow: false,
    fieldName: '',
    name: ''
  },
  methods: {
    trim(str) {
      return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
    },
    closePopup() {
      this.setData({
        isShow: false
      })
    },
    openPopup() {
      this.setData({
        isShow: true
      })
    },
    handleTap({ currentTarget }) {
      this.data.dataList.forEach(item => {
        if(item.fieldCode === currentTarget.dataset.fieldcode) {
          item.isChecked = !item.isChecked
        }
      })
      console.log(currentTarget)
      this.setData({
        dataList: this.data.dataList
      })
    },
    handleCheck: function() {
      const allCheckedList = []
      const activeNameList = []
      const activeCodeList = []
      this.data.dataList.forEach(item => item.isChecked && allCheckedList.push(item))
      allCheckedList.forEach(item => {
        activeNameList.push(item.fieldName)
        activeCodeList.push(item.fieldCode)
      })
      this.setData({
        activeNameStr: activeNameList.join('/'),
        isShow: false
      });
      this.triggerEvent('handleCheck', {
        fieldCode: this.data.fieldCode,
        fieldName: this.data.fieldName,
        data: activeCodeList.join(','),
        required: this.data.required,
        isOK: !!activeCodeList.length,
      })
    }
  }
})