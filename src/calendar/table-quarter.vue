<template>
  <div :class="`${prefixClass}-calendar ${prefixClass}-calendar-panel-quarter`">
    <div :class="`${prefixClass}-calendar-header`">
      <icon-button type="double-left" @click="handleIconDoubleLeftClick"></icon-button>
      <icon-button type="double-right" @click="handleIconDoubleRightClick"></icon-button>
      <span :class="`${prefixClass}-calendar-header-label`">
        <button
          type="button"
          :class="`${prefixClass}-btn ${prefixClass}-btn-text`"
          @click="handlePanelChange"
        >
          {{ calendarYear }}
        </button>
      </span>
    </div>
    <div :class="`${prefixClass}-calendar-content`" class="calender-content-quarter">
      <table :class="`${prefixClass}-table ${prefixClass}-table-quarter`" @click="handleClick">
        <tr>
          <td
            v-for="(cell, j) in quarters"
            :key="j"
            :data-quarter="cell"
            class="cell"
          >
            <div>{{ 'Q'+cell }}</div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { chunk } from '../util/base';
import IconButton from './icon-button';
import { getLocale } from '../locale';
import { createDate } from '../util/date';

export default {
  name: 'TableQuarter',
  components: { IconButton },
  data() {
    return {
      quarters: [1, 2, 3, 4]
    }
  },
  inject: {
    getLocale: {
      default: () => getLocale,
    },
    prefixClass: {
      default: 'mx',
    },
  },
  props: {
    calendar: {
      type: Date,
      default: () => new Date(),
    },
    getCellClasses: {
      type: Function,
      default: () => [],
    },
  },
  computed: {
    calendarYear() {
      return this.calendar.getFullYear();
    },
    months() {
      const locale = this.getLocale();
      const monthsLocale = locale.months || locale.formatLocale.monthsShort;
      const months = monthsLocale.map((text, month) => {
        return { text, month };
      });
      return chunk(months, 3);
    },
  },
  methods: {
    getNextCalendar(diffYear) {
      const year = this.calendar.getFullYear();
      const month = this.calendar.getMonth();
      return createDate(year + diffYear, month);
    },
    handleIconDoubleLeftClick() {
      this.$emit('changecalendar', this.getNextCalendar(-1), 'last-year');
    },
    handleIconDoubleRightClick() {
      this.$emit('changecalendar', this.getNextCalendar(1), 'next-year');
    },
    handlePanelChange() {
      this.$emit('changepanel', 'year');
    },
    handleClick(evt) {
      let { target } = evt;
      if (target.tagName.toUpperCase() === 'DIV') {
        target = target.parentNode;
      }
      const quarter = target.getAttribute('data-quarter');
      if (quarter) {
        this.$emit('select', parseInt(quarter, 10));
      }
    },
  },
};
</script>
<style lang="scss" scoped>

</style>
