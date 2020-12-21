import Api from "../../../utils/api.js";
Component({
  properties: {
    radioData: {
      type: Object,
      value: null,
      observer(newVal) {
        this.setData({
          list: this.getOnlineCustomizeOptionList(newVal),
          fieldName: newVal.fieldName,
          fieldType: newVal.fieldType,
          required: newVal.required,
          sList: newVal.onlineCustomizeDtos,
          sort: newVal.sort
        })
      }
    }
  },
  data: {
    selectName: '请选择',
    list: '',
    sList: ''
  },
  methods: {
    bindPickerProjectChange(e) {
      this.setData({
        selectName: this.data.list[e.detail.value].fieldName,
        correlationCustomizeId: this.data.list[e.detail.value].correlationCustomizeId,
        correlationCustomizeName: this.data.list[e.detail.value].correlationCustomizeName
      });
      this.triggerEvent('myevent', {
        fieldName: this.data.fieldName,
        fieldValue: this.data.list[e.detail.value].fieldName,
        fieldType: this.data.fieldType,
        required: this.data.required,
        sort: this.data.sort
      })
      console.log(this.data.sList)
      // 报名活动时,此处会报错,先解决报错,后期优化  2020.12.15
      if(this.data.sList) {
        this.data.sList.forEach(item => {
          if(this.data.correlationCustomizeId==item.customizeId) {
            const o = {
              ...item,
              fieldValue: ''
            }
            this.triggerEvent('myevent', o)
          }
        })
      }

      // this.triggerEvent('myevent', {
      //     fieldName: this.data.fieldName,
      //     fieldValue: this.data.list[e.detail.value].fieldName,
      //     fieldType: this.data.fieldType,
      //     required: this.data.required,
      //     sort: this.data.sort
      // })
    },
    getOnlineCustomizeOptionList(newVal) {
      if (newVal.dataType == 0 && newVal.onlineCustomizeOptionList) {
        return newVal.onlineCustomizeOptionList;
      } else if (newVal.dataType == 1 && newVal.url) {
        this.getProjectData(newVal.fieldName, newVal.url, 1)
      };
    },
    getProjectData(correlationCustomizeName, url) {
      let that = this;
      Api.fetch({
        method: 'get',
        url: url
      }).then((res) => {
        if (res.code == 200) {
          if (res.data.length > 0) {
            that.setData({
              list: res.data
            })
          }
        }
      });
    },
    myevent({detail}) {
      console.log(detail)
      this.triggerEvent('myevent', detail)
    }
  }
})