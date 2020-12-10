import moment from "../../../utils/moment";
var dateTimePicker = require('../../../utils/dateTimePicker.js');
Component({
    properties: {
        dateData: {
            type: Object,
            value: null,
            observer(newVal) {
                this.setData({
                    fieldName: newVal.fieldName,
                    fieldType: newVal.fieldType,
                    required: newVal.required,
                    dateFormat: newVal.dateFormat,
                    sort: newVal.sort
                })
            }
        }
    },
    data: {
        start: moment().format('YYYY-MM-DD'),
        appointmentDate: '选择时间',
        appointmentDate1: '选择时间',
        dateTimeArray: dateTimePicker.dateTimePicker().dateTimeArray,
        dateTime: dateTimePicker.dateTimePicker().dateTime,
    },
    methods: {
        bindDateChange: function(e) {
            this.setData({
                appointmentDate: e.detail.value
            });
            this.triggerEvent('myevent', {
                fieldName: this.data.fieldName,
                fieldValue: e.detail.value,
                fieldType: this.data.fieldType,
                sort: this.data.sort
            })
        },
        changeDateTime: function(e) {
            var dateTimeArray = this.data.dateTimeArray;
            var dateTime = this.data.dateTime;
            this.setData({
                dateTime: e.detail.value,
                appointmentDate1: dateTimeArray[0][dateTime[0]] + '-' + dateTimeArray[1][dateTime[1]] + '-' + dateTimeArray[2][dateTime[2]] + ' ' + dateTimeArray[3][dateTime[3]] + ':' + dateTimeArray[4][dateTime[4]] + ':' + dateTimeArray[5][dateTime[5]]
            });
            var value = dateTimeArray[0][dateTime[0]] + '-' + dateTimeArray[1][dateTime[1]] + '-' + dateTimeArray[2][dateTime[2]] + ' ' + dateTimeArray[3][dateTime[3]] + ':' + dateTimeArray[4][dateTime[4]] + ':' + dateTimeArray[5][dateTime[5]];
            this.triggerEvent('myevent', {
                fieldName: this.data.fieldName,
                fieldValue: value,
                fieldType: this.data.fieldType,
                sort: this.data.sort
            })
        },
        changeDateTimeColumn: function(e) {
            var arr = this.data.dateTime,
                dateArr = this.data.dateTimeArray;

            arr[e.detail.column] = e.detail.value;
            dateArr[2] = dateTimePicker.getMonthDay(dateArr[0][arr[0]], dateArr[1][arr[1]]);

            this.setData({
                dateTimeArray: dateArr,
                dateTime: arr
            });
        }
    }
})