import {
  getValidDate,
  isValidDate,
  createDate,
  setMonth,
  startOfYear,
  startOfMonth,
  startOfDay,
} from '../util/date';
import TableDate from './table-date.vue';
import TableMonth from './table-month.vue';
import TableYear from './table-year.vue';
import TableQuarter from './table-quarter.vue';

export default {
  name: 'CalendarPanel',
  inject: {
    prefixClass: {
      default: 'mx',
    },
    dispatchDatePicker: {
      default: () => () => {},
    },
  },
  props: {
    value: {},
    defaultValue: {
      default() {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
      },
    },
    defaultPanel: {
      type: String,
    },
    disabledDate: {
      type: Function,
      default: () => false,
    },
    type: {
      type: String,
      default: 'date',
    },
    getClasses: {
      type: Function,
      default: () => [],
    },
    showWeekNumber: {
      type: Boolean,
      default: undefined,
    },
    getYearPanel: {
      type: Function,
    },
    titleFormat: {
      type: String,
      default: 'YYYY-MM-DD',
    },
    calendar: Date,
    // update date when select year or month
    partialUpdate: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const panels = ['date', 'month', 'year', 'quarter'];
    const index = Math.max(panels.indexOf(this.type), panels.indexOf(this.defaultPanel));
    const panel = index !== -1 ? panels[index] : 'date';
    return {
      panel,
      oldPanel: '',
      innerCalendar: new Date(),
    };
  },
  computed: {
    innerValue() {
      const value = Array.isArray(this.value) ? this.value : [this.value];
      const map = {
        year: startOfYear,
        month: startOfMonth,
        date: startOfDay,
      };
      const start = map[this.type] || map.date;
      return value.filter(isValidDate).map(v => start(v));
    },
    calendarYear() {
      return this.innerCalendar.getFullYear();
    },
    calendarMonth() {
      return this.innerCalendar.getMonth();
    },
  },
  watch: {
    value: {
      immediate: true,
      handler: 'initCalendar',
    },
    calendar: {
      handler: 'initCalendar',
    },
    defaultValue: {
      handler: 'initCalendar',
    },
  },
  methods: {
    initCalendar() {
      let calendarDate = this.calendar;
      if (!isValidDate(calendarDate)) {
        const { length } = this.innerValue;
        calendarDate = getValidDate(length > 0 ? this.innerValue[length - 1] : this.defaultValue);
      }
      this.innerCalendar = startOfMonth(calendarDate);
    },
    isDisabled(date) {
      return this.disabledDate(new Date(date), this.innerValue);
    },
    emitDate(date, type) {
      if (!this.isDisabled(date)) {
        this.$emit('select', date, type, this.innerValue);
        // someone need get the first selected date to set range value. (#429)
        this.dispatchDatePicker('pick', date, type);
      }
    },
    handleCalendarChange(calendar, type) {
      const oldCalendar = new Date(this.innerCalendar);
      this.innerCalendar = calendar;
      this.$emit('update:calendar', calendar);
      this.dispatchDatePicker('calendar-change', calendar, oldCalendar, type);
    },
    handelPanelChange(panel) {
      const oldPanel = this.panel;
      this.oldPanel = oldPanel;
      this.panel = panel;
      this.dispatchDatePicker('panel-change', panel, oldPanel);
    },
    handleSelectYear(year) {
      if (this.type === 'year') {
        const date = this.getYearCellDate(year);
        this.emitDate(date, 'year');
      } else {
        this.handleCalendarChange(createDate(year, this.calendarMonth), 'year');
        // this.handelPanelChange('month');
        this.handelPanelChange(this.oldPanel);
        if (this.partialUpdate && this.innerValue.length === 1) {
          const date = new Date(this.innerValue[0]);
          date.setFullYear(year);
          this.emitDate(date, 'year');
        }
      }
    },
    handleSelectMonth(month) {
      if (this.type === 'month') {
        const date = this.getMonthCellDate(month);
        this.emitDate(date, 'month');
      } else {
        this.handleCalendarChange(createDate(this.calendarYear, month), 'month');
        this.handelPanelChange('date');
        if (this.partialUpdate && this.innerValue.length === 1) {
          const date = new Date(this.innerValue[0]);
          date.setFullYear(this.calendarYear);
          this.emitDate(setMonth(date, month), 'month');
        }
      }
    },
    handleSelectQuarter(quarter) {
      const date = this.getQuarterCellDate(quarter);
      this.emitDate(date, 'quarter');
    },
    handleSelectDate(date) {
      this.emitDate(date, this.type === 'week' ? 'week' : 'date');
    },
    getMonthCellDate(month) {
      return createDate(this.calendarYear, month);
    },
    getQuarterCellDate(quarter) {
      const map = {
        1: 0,
        2: 3,
        3: 6,
        4: 9
      }
      return createDate(this.calendarYear, map[quarter]);
    },
    getYearCellDate(year) {
      return createDate(year, 0);
    },
    getDateClasses(cellDate) {
      const notCurrentMonth = cellDate.getMonth() !== this.calendarMonth;
      const classes = [];
      if (cellDate.getTime() === new Date().setHours(0, 0, 0, 0)) {
        classes.push('today');
      }
      if (notCurrentMonth) {
        classes.push('not-current-month');
      }
      const state = this.getStateClass(cellDate);
      if (!(state === 'active' && notCurrentMonth)) {
        classes.push(state);
      }
      return classes.concat(this.getClasses(cellDate, this.innerValue, classes.join(' ')));
    },
    getMonthClasses(month) {
      if (this.type !== 'month') {
        return this.calendarMonth === month ? 'active' : '';
      }
      const classes = [];
      const cellDate = this.getMonthCellDate(month);
      classes.push(this.getStateClass(cellDate));
      return classes.concat(this.getClasses(cellDate, this.innerValue, classes.join(' ')));
    },
    getYearClasses(year) {
      if (this.type !== 'year') {
        return this.calendarYear === year ? 'active' : '';
      }
      const classes = [];
      const cellDate = this.getYearCellDate(year);
      classes.push(this.getStateClass(cellDate));
      return classes.concat(this.getClasses(cellDate, this.innerValue, classes.join(' ')));
    },
    getQuarterClasses(quarter) {
      const classes = [];
      const cellDate = this.getQuarterCellDate(quarter);
      classes.push(this.getStateClass(cellDate));
      return classes.concat(this.getClasses(cellDate, this.innerValue, classes.join(' ')));
    },
    getStateClass(cellDate) {
      if (this.isDisabled(cellDate)) {
        return 'disabled';
      }
      if(this.type==='quarter') {
        const map = {
          0: [0, 2],
          3: [3, 5],
          6: [6, 8],
          9: [9, 11],
        }
        const span = map[cellDate.getMonth()];
        if(
          this.innerValue.some(v => 
            v.getMonth()>=span[0] && v.getMonth()<=span[1]
            && v.getYear()===cellDate.getYear()
          )
        ) {
          return 'active';
        }
      }else if(this.innerValue.some(v => v.getTime() === cellDate.getTime())) {
        return 'active';
      }
      return '';
    },
    getWeekState(row) {
      if (this.type !== 'week') return '';
      const start = row[0].getTime();
      const end = row[6].getTime();
      const active = this.innerValue.some(v => {
        const time = v.getTime();
        return time >= start && time <= end;
      });
      return active ? `${this.prefixClass}-active-week` : '';
    },
  },
  render() {
    const { panel, innerCalendar } = this;
    if (panel === 'year') {
      return (
        <TableYear
          calendar={innerCalendar}
          getCellClasses={this.getYearClasses}
          getYearPanel={this.getYearPanel}
          onSelect={this.handleSelectYear}
          onChangecalendar={this.handleCalendarChange}
        />
      );
    }
    if (panel === 'month') {
      return (
        <TableMonth
          calendar={innerCalendar}
          getCellClasses={this.getMonthClasses}
          onSelect={this.handleSelectMonth}
          onChangepanel={this.handelPanelChange}
          onChangecalendar={this.handleCalendarChange}
        />
      );
    }
    if (panel === 'quarter') {
      return (
        <TableQuarter
          calendar={innerCalendar}
          getCellClasses={this.getQuarterClasses}
          onSelect={this.handleSelectQuarter}
          onChangepanel={this.handelPanelChange}
          onChangecalendar={this.handleCalendarChange}
        />
      );
    }
    return (
      <TableDate
        class={{ [`${this.prefixClass}-calendar-week-mode`]: this.type === 'week' }}
        calendar={innerCalendar}
        getCellClasses={this.getDateClasses}
        getRowClasses={this.getWeekState}
        titleFormat={this.titleFormat}
        showWeekNumber={
          typeof this.showWeekNumber === 'boolean' ? this.showWeekNumber : this.type === 'week'
        }
        onSelect={this.handleSelectDate}
        onChangepanel={this.handelPanelChange}
        onChangecalendar={this.handleCalendarChange}
      />
    );
  },
};
