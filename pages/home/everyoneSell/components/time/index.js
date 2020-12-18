import { parseTime } from '../../../../../utils/utils.js'

Component({
  properties: {
    pickerTimeData: {
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
    date:parseTime(new Date(),'{y}-{m}-{d} {h}:{i}'),
    disabled:false,//设置是否能点击 false可以 true不能点击
    startDate: '2000-01-01 00:00',
    endDate: '2040-12-31 23:59',
    placeholder:'请选择时间'
  },
  methods: {
    /**
     * 日历控件绑定函数
     * 点击日期返回
     */
    onPickerChange: function ({ detail }) {
      this.setData({
        date: detail.dateString
      })
      this.triggerEvent('handleChange', {
        fieldCode: this.data.fieldCode,
        fieldName: this.data.fieldName,
        required: this.data.required,
        isOK: !!detail.dateString,
        data: detail.dateString,
      })

      },
  }
})